
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Beacon } from '@/lib/types';
import { BeaconCard } from '@/components/beacon-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPanel } from '@/components/chat-panel';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function BeaconDetailsPage({ params }: { params: { beaconId: string } }) {
  const { beaconId } = params;
  const firestore = useFirestore();
  const router = useRouter();

  const beaconRef = useMemoFirebase(() => {
    if (!firestore || !beaconId) return null;
    return doc(firestore, 'beacons', beaconId as string);
  }, [firestore, beaconId]);

  const { data: beacon, isLoading } = useDoc<Beacon>(beaconRef);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
         <button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
         </button>
        <h1 className="text-xl font-bold truncate">{beacon?.purpose || 'Beacon'}</h1>
      </header>

      <main className="flex-1 flex flex-col">
         <div className="p-4 sm:p-6">
          {isLoading && <Skeleton className="w-full h-28 rounded-xl" />}
          {beacon && (
            <div className="mb-8">
               <BeaconCard beacon={beacon} />
            </div>
          )}
        </div>
        <div className="flex-1 bg-card border-t border-border/60">
            <ChatPanel chatId={`beacon_${beaconId}`} />
        </div>
      </main>
    </div>
  );
}
