'use client';

import { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Flame, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection } from "@/lib/supabase/hooks";
import { mapDbChallengeToChallenge } from "@/lib/types";
import type { Challenge } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChallengeCard } from "@/components/challenge-card";
import { LogoIcon } from '@/components/icons/logo';

export default function PlayPage() {
  const now = new Date().toISOString();

  const { data: rawActiveChallenges, isLoading: isLoadingActive } = useCollection<any>({
    table: 'challenges',
    filters: [{ column: 'deadline', operator: 'gt', value: now }],
    orderBy: { column: 'deadline', ascending: true },
  });

  const { data: rawPastChallenges, isLoading: isLoadingPast } = useCollection<any>({
    table: 'challenges',
    filters: [{ column: 'deadline', operator: 'lte', value: now }],
    orderBy: { column: 'deadline', ascending: false },
  });

  const activeChallenges = useMemo(() => rawActiveChallenges?.map(mapDbChallengeToChallenge) || [], [rawActiveChallenges]);
  const pastChallenges = useMemo(() => rawPastChallenges?.map(mapDbChallengeToChallenge) || [], [rawPastChallenges]);

  const isLoading = isLoadingActive || isLoadingPast;

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/" passHref>
          <div className="flex items-center gap-2 cursor-pointer">
            <LogoIcon width={40} height={40} />
            <span className="text-2xl font-headline gradient-text">Xtream</span>
          </div>
        </Link>
        <Link href="/play/create" passHref>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Challenge
          </Button>
        </Link>
      </header>
      <div className="p-4 sm:p-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary mb-6">
            <TabsTrigger value="active" className="gap-2"><Flame className="w-4 h-4" /> Active Challenges</TabsTrigger>
            <TabsTrigger value="past" className="gap-2"><Star className="w-4 h-4" /> Past Challenges</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <div className="flex flex-col gap-8">
              {isLoading && (
                <>
                  <Skeleton className="w-full aspect-video rounded-xl" />
                  <Skeleton className="w-full aspect-video rounded-xl" />
                </>
              )}
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
              {activeChallenges.length === 0 && !isLoading && (
                <div className="text-center py-10">
                  <Flame className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Active Challenges</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Why not be the first to create one?
                  </p>
                  <Link href="/play/create" passHref className="mt-4 inline-block">
                    <Button>Create a New Challenge</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="past">
            <div className="flex flex-col gap-8">
              {isLoading && (
                <Skeleton className="w-full aspect-video rounded-xl" />
              )}
              {pastChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
              {pastChallenges.length === 0 && !isLoading && (
                <div className="text-center py-10">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Past Challenges</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Completed challenges and their winners will appear here.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
