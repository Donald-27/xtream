
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPanel } from '@/components/chat-panel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EventDetailsPage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const firestore = useFirestore();
  const router = useRouter();

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, 'events', eventId);
  }, [firestore, eventId]);

  const { data: event, isLoading } = useDoc<Event>(eventRef);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
         <button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
         </button>
        <h1 className="text-xl font-bold">{event?.title || 'Event'}</h1>
      </header>

      <main className="flex-1 flex flex-col">
         <div className="p-4 sm:p-6">
          {isLoading && <Skeleton className="w-full h-32 rounded-xl" />}
          {event && (
            <div className="mb-8">
               <EventCard event={event} />
            </div>
          )}
        </div>
        <div className="flex-1 bg-card border-t border-border/60">
            <ChatPanel chatId={`event_${eventId}`} />
        </div>
      </main>
    </div>
  );
}
