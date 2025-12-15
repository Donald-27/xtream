
'use client';

import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Stream, User } from "@/lib/types";
import { Eye, MessageCircle, Clock, Flame, Lightbulb, Handshake, Star, Leaf, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from 'next/link';
import { AudioDownloadDialog } from "./audio-download-dialog";

type StreamCardProps = {
  stream: Stream;
  recommendationReason?: string;
};

function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export function StreamCard({ stream, recommendationReason }: StreamCardProps) {
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !stream.userId) return null;
    return doc(firestore, 'users', stream.userId);
  }, [firestore, stream.userId]);

  const { data: userProfile } = useDoc<User>(userDocRef);

  const startTime = stream.startTime ? new Date(stream.startTime.seconds * 1000) : new Date();
  const timeAgo = formatDistanceToNow(startTime, { addSuffix: true });
  
  const getInitials = (name?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    return 'U';
  }
  
  const reactions = stream.reactions || {};

  const handleJoinStream = () => {
    // This is a good place for analytics events in a real app
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden border-border/60 bg-card shadow-lg rounded-xl">
      {recommendationReason && (
        <div className="p-2 px-4 text-xs bg-secondary text-muted-foreground border-b border-border/80">
          <span className="font-semibold">Recommended for you:</span> {recommendationReason}
        </div>
      )}
      <div className="relative aspect-video">
        
        <Image
            src={stream.thumbnailUrl || 'https://picsum.photos/seed/stream/400/225'}
            alt={stream.title}
            data-ai-hint="live stream placeholder"
            fill
            className="object-cover"
        />
        
        {stream.live && (
          <div className="absolute top-3 left-3">
             <Badge variant="destructive" className="animate-pulse-live flex items-center gap-2 bg-destructive/90">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                LIVE NOW
             </Badge>
          </div>
        )}
         {!stream.live && stream.startTime && new Date(stream.startTime.seconds * 1000) > new Date() && (
          <div className="absolute top-3 left-3">
             <Badge variant="secondary" className="bg-background/80 text-foreground">
                Starts {formatDistanceToNow(new Date(stream.startTime.seconds * 1000), { addSuffix: true })}
             </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-primary-foreground">{stream.title}</h2>
        <div className="flex items-center gap-3">
            <Link href={`/profile/${stream.userId}`} passHref>
              <Avatar>
                  <AvatarImage src={userProfile?.profilePictureUrl || undefined} alt={userProfile?.username} />
                  <AvatarFallback>{getInitials(userProfile?.username)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-grow">
                <Link href={`/profile/${stream.userId}`} passHref>
                  <p className="font-semibold text-primary-foreground hover:underline">{userProfile?.username || '...'}</p>
                </Link>
                <p className="text-sm text-secondary-foreground">{userProfile?.location || 'Unknown Location'}</p>
            </div>
        </div>
        <p className="text-sm text-muted-foreground">{stream.category}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary-foreground">
            <div className="flex items-center gap-1.5" title="Viewers">
                <Eye className="w-4 h-4"/>
                <span>{stream.live ? '•••' : 0}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Comments">
                <MessageCircle className="w-4 h-4"/>
                <span>0</span>
            </div>
            <div className="flex items-center gap-1.5" title="Sparks">
                <Flame className="w-4 h-4 text-orange-500"/>
                <span>{reactions.spark || 0}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Bright Ideas">
                <Lightbulb className="w-4 h-4 text-yellow-400"/>
                <span>{reactions.brightIdea || 0}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Support">
                <Handshake className="w-4 h-4 text-blue-400"/>
                <span>{reactions.support || 0}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Gold">
                <Star className="w-4 h-4 text-amber-400"/>
                <span>{reactions.gold || 0}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Grows">
                <Leaf className="w-4 h-4 text-green-500"/>
                <span>{reactions.grow || 0}</span>
            </div>
             <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4"/>
                <span>{timeAgo}</span>
            </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/stream/${stream.id}`} passHref className="flex-1">
              <Button className="w-full font-bold transition-transform active:scale-[0.98]" onClick={handleJoinStream}>
                  {stream.live ? 'JOIN STREAM' : 'WATCH REPLAY'}
              </Button>
          </Link>
          {!stream.live && stream.allowAudioDownload !== false && (
            <AudioDownloadDialog item={stream} itemType="stream" />
          )}
        </div>
        {!stream.live && stream.duration && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Headphones className="w-3 h-3" />
            <span>Audio download available • {formatDuration(stream.duration)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    