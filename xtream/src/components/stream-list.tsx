'use client';

import { useQuery } from "@/lib/supabase/hooks";
import type { Stream } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { StreamCard } from "@/components/stream-card";

export function StreamList() {
  const { data: streams, isLoading } = useQuery<Stream>(
    'streams',
    (query: any) => query.order('live', { ascending: false })
  );

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
      {streams && streams.map((stream: Stream) => (
        <StreamCard key={stream.id} stream={stream} />
      ))}
    </div>
  );
}
