'use client';

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Challenge, User } from "@/lib/types";
import { useDoc } from "@/lib/supabase/hooks";
import { mapDbUserToUser } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Clock, User as UserIcon, Edit } from "lucide-react";
import { formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';
import { useMemo } from "react";

type ChallengeCardProps = {
  challenge: Challenge;
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { data: rawCreator } = useDoc<any>(
    challenge.creatorId ? 'users' : null,
    challenge.creatorId
  );

  const creator = useMemo(() => {
    if (!rawCreator) return null;
    return mapDbUserToUser(rawCreator);
  }, [rawCreator]);

  const deadlineDate = challenge.deadline ? new Date(challenge.deadline) : new Date();
  const hasEnded = deadlineDate < new Date();
  const timeRemaining = hasEnded
    ? 'Ended'
    : `${formatDistanceToNowStrict(deadlineDate, { unit: 'day' })} left`;

  const getSubmissionIcon = () => {
    switch (challenge.submissionType) {
      case 'photo': return '📷';
      case 'video': return '🎥';
      case 'text': return '✍️';
      default: return '📁';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden border-border/60 bg-card shadow-lg rounded-xl">
      {challenge.coverImageUrl && (
        <div className="relative aspect-video">
          <Image
            src={challenge.coverImageUrl}
            alt={challenge.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold tracking-tight">{challenge.title}</h2>
          </div>
        </div>
      )}

      <CardContent className={`p-4 space-y-4 ${challenge.coverImageUrl ? '' : 'pt-6'}`}>
        {!challenge.coverImageUrl && (
          <h2 className="text-xl font-bold tracking-tight text-primary-foreground">{challenge.title}</h2>
        )}

        <p className="text-sm text-muted-foreground">{challenge.description}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary-foreground">
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-4 h-4 text-primary" />
            <span>Hosted by <Link href={`/profile/${creator?.id}`}><strong className="hover:underline">{creator?.username || '...'}</strong></Link></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            <span>{timeRemaining}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">{getSubmissionIcon()}</span>
            <span className="capitalize">{challenge.submissionType} submissions</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/play/${challenge.id}`} passHref className="w-full">
          <Button className="w-full font-bold">
            {hasEnded ? 'VIEW RESULTS' : 'VIEW CHALLENGE'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
