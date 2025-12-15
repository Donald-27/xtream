
'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { Stream } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { StreamCard } from "@/components/stream-card";

// This component is now deprecated in favor of the combined feed on the home page,
// but is kept to avoid breaking changes if it's imported elsewhere.
export function StreamList() {
  const firestore = useFirestore();
  
  const streamsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'streams'), orderBy('live', 'desc'));
  }, [firestore]);

  const { data: streams, isLoading } = useCollection<Stream>(streamsQuery);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="w-full aspect-video rounded-xl" />
        <Skeleton className="w-full aspect-video rounded-xl" />
      </div>
    );
  }

  if (streams && streams.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No live streams right now. Why not start one?</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {streams && streams.map((stream) => (
        <StreamCard key={stream.id} stream={stream} />
      ))}
    </div>
  );
}

    