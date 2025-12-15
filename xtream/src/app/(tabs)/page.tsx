
'use client';
import { AppHeader } from "@/components/layout/app-header";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import type { Stream, Post } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { StreamCard } from "@/components/stream-card";
import { PostCard } from "@/components/post-card";
import { StoriesCarousel } from "@/components/stories-carousel";
import { useMemo } from "react";

// Union type for the feed
type FeedItem = (Stream & { type: 'stream' }) | (Post & { type: 'post' });

export default function Home() {
  const firestore = useFirestore();
  
  const streamsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'streams'), orderBy('live', 'desc'), orderBy('startTime', 'desc'));
  }, [firestore]);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: streams, isLoading: isLoadingStreams } = useCollection<Stream>(streamsQuery);
  const { data: posts, isLoading: isLoadingPosts } = useCollection<Post>(postsQuery);

  const feedItems = useMemo((): FeedItem[] => {
    const combined: FeedItem[] = [];

    if (streams) {
      combined.push(...streams.map(s => ({ ...s, type: 'stream' as const })));
    }
    if (posts) {
      combined.push(...posts.map(p => ({ ...p, type: 'post' as const })));
    }
    
    // Sort by creation/start time, descending. Live streams get a boost.
    return combined.sort((a, b) => {
      const aTime = a.type === 'stream' ? a.startTime : a.createdAt;
      const bTime = b.type === 'stream' ? b.startTime : b.createdAt;
      
      // Give live streams priority
      if (a.type === 'stream' && a.live && (b.type !== 'stream' || !b.live)) return -1;
      if (b.type === 'stream' && b.live && (a.type !== 'stream' || !a.live)) return 1;

      const aTimestamp = aTime?.seconds || 0;
      const bTimestamp = bTime?.seconds || 0;
      
      return bTimestamp - aTimestamp;
    });

  }, [streams, posts]);

  const isLoading = isLoadingStreams || isLoadingPosts;

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="border-b border-border/60 bg-secondary/50">
        <StoriesCarousel />
      </div>
      <div className="flex flex-col gap-8 p-4 sm:p-6">
        {isLoading && (
          <div className="flex flex-col gap-8">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="w-full aspect-[4/3] rounded-xl" />
            <Skeleton className="w-full aspect-video rounded-xl" />
          </div>
        )}

        {!isLoading && feedItems.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            The feed is empty. Start a stream or post a clip!
          </p>
        )}

        {!isLoading && feedItems.map((item) => {
          if (item.type === 'stream') {
            return <StreamCard key={`stream-${item.id}`} stream={item} />;
          } else {
            return <PostCard key={`post-${item.id}`} post={item} />;
          }
        })}
      </div>
    </div>
  );
}

    