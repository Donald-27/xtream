
'use client';

// This component is no longer used as the recommendation logic has been
// integrated into the main feed on the home page.
// It is kept for now to prevent breaking changes but can be deleted.

import { useSession } from '@/context/session-context';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, documentId, and } from 'firebase/firestore';
import { StreamCard } from './stream-card';
import type { Stream } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

export function RecommendedStreams() {
  const { getTopCategory, getViewedStreamIds } = useSession();
  const firestore = useFirestore();

  const topCategory = getTopCategory();
  const viewedStreamIds = getViewedStreamIds();

  const recommendationsQuery = useMemoFirebase(() => {
    if (!firestore || !topCategory) {
      return null;
    }

    const queryConstraints = [
        where('category', '==', topCategory),
        where('live', '==', true)
    ];

    if (viewedStreamIds.length > 0) {
      queryConstraints.push(where(documentId(), 'not-in', viewedStreamIds));
    }
    
    queryConstraints.push(limit(3));

    return query(collection(firestore, 'streams'), ...queryConstraints);
  }, [firestore, topCategory, viewedStreamIds]);

  const { data: recommendedStreams, isLoading } = useCollection<Stream>(recommendationsQuery);

  if (!topCategory || (recommendedStreams && recommendedStreams.length === 0)) {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-4 pt-8 border-t border-border/60">
        <h2 className="text-2xl font-bold">Because you're into "{topCategory}"</h2>
        {isLoading && (
            <div className="flex flex-col gap-8">
                <Skeleton className="w-full aspect-video rounded-xl" />
            </div>
        )}
        {recommendedStreams && recommendedStreams.map((stream) => (
            <StreamCard 
                key={stream.id} 
                stream={stream} 
                recommendationReason={`based on your interest in ${topCategory} streams.`}
            />
        ))}
    </div>
  )
}

    