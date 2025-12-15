
'use client';
// This component is no longer used and will be replaced by ChallengeCard.
// It is kept for now to prevent breaking changes but can be deleted.

import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Game, User } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Users, Clock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import Link from "next/link";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';


type GameCardProps = {
  game: any; // Using any as Game type might be deprecated
};

export function GameCard({ game }: GameCardProps) {
  const gameImage = PlaceHolderImages.find((img) => img.id === game.imageId);
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !game.hostId) return null;
    return doc(firestore, 'users', game.hostId);
  }, [firestore, game.hostId]);

  const { data: userProfile } = useDoc<User>(userDocRef);
  
  const startTime = game.startTime ? new Date(game.startTime.seconds * 1000) : new Date();
  const startsIn = formatDistanceToNow(startTime, { addSuffix: true });
  const duration = game.duration ? `${game.duration} minutes` : 'N/A';

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden border-border/60 bg-card shadow-lg rounded-xl">
      {gameImage && (
        <div className="relative aspect-video">
            <Image
                src={gameImage.imageUrl}
                alt={game.title}
                data-ai-hint={gameImage.imageHint}
                fill
                className="object-cover"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}
      <CardContent className="p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-primary-foreground">{game.title}</h2>
        
        <Link href={`/profile/${game.hostId}`} passHref>
            <p className="font-semibold text-secondary-foreground hover:underline">Host: {userProfile?.username || '...'} ⭐ {game.hostRating || 'N/A'}</p>
        </Link>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-secondary-foreground">
            <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary"/>
                <span>{game.playerIds?.length || 0}/{game.maxPlayers} slots</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary"/>
                <span>Starts {startsIn}</span>
            </div>
             <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary"/>
                <span>{game.privacy || 'N/A'} Join</span>
            </div>
             <div className="flex items-center gap-1.5">
                <span className="font-semibold">Duration:</span>
                <span>{duration}</span>
            </div>
        </div>

        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
              {game.tags.map((tag: any) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          </div>
        )}
        <div className="flex gap-2">
            <Button className="w-full font-bold transition-transform active:scale-[0.98]">
                QUICK JOIN
            </Button>
            <Link href={`/play/${game.id}`} passHref className="w-full">
              <Button variant="secondary" className="w-full">MORE INFO</Button>
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}

    