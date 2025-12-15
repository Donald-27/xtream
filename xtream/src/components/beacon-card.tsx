
'use client';

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Beacon, User } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import { RadioTower, Users, Clock } from "lucide-react";

type BeaconCardProps = {
  beacon: Beacon;
};

export function BeaconCard({ beacon }: BeaconCardProps) {
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !beacon.creatorId) return null;
    return doc(firestore, 'users', beacon.creatorId);
  }, [firestore, beacon.creatorId]);

  const { data: userProfile } = useDoc<User>(userDocRef);

  const expiresAt = beacon.expiresAt ? new Date(beacon.expiresAt.seconds * 1000) : new Date();
  const expiresIn = formatDistanceToNow(expiresAt, { addSuffix: true });

  return (
    <Card className="w-full max-w-2xl mx-auto border-border/60 bg-card shadow-lg rounded-xl">
      <CardContent className="p-4">
        <div className="flex gap-4">
            <div className="text-2xl p-3 bg-secondary rounded-lg h-fit">
                <RadioTower className="w-6 h-6 text-primary animate-pulse"/>
            </div>
            <div className="flex-grow space-y-2">
                <h3 className="font-bold text-primary-foreground">{beacon.purpose}</h3>
                <p className="text-sm text-secondary-foreground">
                   <Link href={`/profile/${beacon.creatorId}`} passHref><span className="hover:underline">Activated by {userProfile?.username || '...'}</span></Link>
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>📍 {beacon.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {beacon.participantIds?.length || 1} joined</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Expires {expiresIn}</span>
                </div>
            </div>
        </div>
      </CardContent>
       <CardFooter className="p-4 pt-0 flex gap-2">
          <Link href={`/connect/beacon/${beacon.id}`} passHref className="w-full">
            <Button className="w-full font-bold">Join Chat</Button>
          </Link>
       </CardFooter>
    </Card>
  );
}

    