'use client';
import { AppHeader } from "@/components/layout/app-header";
import { useCollection } from "@/lib/supabase/hooks";
import { useMemo } from "react";
import type { Stream, Post } from '@/lib/types';
import { mapDbStreamToStream, mapDbPostToPost } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { StreamCard } from "@/components/stream-card";
import { PostCard } from "@/components/post-card";
import { StoriesCarousel } from "@/components/stories-carousel";

type FeedItem = (Stream & { type: 'stream' }) | (Post & { type: 'post' });

export default function Home() {
  const { data: rawStreams, isLoading: isLoadingStreams } = useCollection({
    table: 'streams',
    orderBy: { column: 'live', ascending: false },
    orderBySecondary: { column: 'start_time', ascending: false },
  });

  const { data: rawPosts, isLoading: isLoadingPosts } = useCollection({
    table: 'posts',
    orderBy: { column: 'created_at', ascending: false },
  });

  const feedItems = useMemo((): FeedItem[] => {
    const combined: FeedItem[] = [];

    if (rawStreams) {
      combined.push(...rawStreams.map(s => ({ ...mapDbStreamToStream(s), type: 'stream' as const })));
    }
    if (rawPosts) {
      combined.push(...rawPosts.map(p => ({ ...mapDbPostToPost(p), type: 'post' as const })));
    }

    return combined.sort((a, b) => {
      const aTime = a.type === 'stream' ? a.startTime : a.createdAt;
      const bTime = b.type === 'stream' ? b.startTime : b.createdAt;

      if (a.type === 'stream' && a.live && (b.type !== 'stream' || !b.live)) return -1;
      if (b.type === 'stream' && b.live && (a.type !== 'stream' || !a.live)) return 1;

      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [rawStreams, rawPosts]);

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
