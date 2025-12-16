'use client';

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Event, User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useDoc } from "@/lib/supabase/hooks";
import { mapDbUserToUser } from "@/lib/types";
import { useMemo } from "react";

type EventCardProps = {
  event: Event;
};

export function EventCard({ event }: EventCardProps) {
  const { data: rawUserProfile } = useDoc<any>(
    event.organizerId ? 'users' : null,
    event.organizerId
  );

  const userProfile = useMemo(() => {
    if (!rawUserProfile) return null;
    return mapDbUserToUser(rawUserProfile);
  }, [rawUserProfile]);

  const startTime = event.startTime ? new Date(event.startTime) : new Date();
  const time = formatDistanceToNow(startTime, { addSuffix: true });

  const getCategoryEmoji = (category?: string) => {
    switch(category) {
      case 'Workshop': return '🎓';
      case 'Meetup': return '🚶';
      case 'Global Event': return '🌍';
      case 'Party': return '🎉';
      case 'Virtual': return '💻';
      case 'In-Person': return '🤝';
      default: return '📅';
    }
  };

  const spots = `${event.attendeeIds?.length || 0}/${event.maxAttendees}`;

  return (
    <Card className="w-full max-w-2xl mx-auto border-border/60 bg-card shadow-lg rounded-xl">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="text-2xl p-3 bg-secondary rounded-lg h-fit">{getCategoryEmoji(event.category)}</div>
          <div className="flex-grow space-y-2">
            <h3 className="font-bold text-primary-foreground">{event.title}</h3>
            <p className="text-sm text-secondary-foreground">
              {event.isInvitation ? 
                (<Link href={`/profile/${event.organizerId}`} passHref><span className="hover:underline">👤 {userProfile?.username} invited you</span></Link>)
                : (<Link href={`/profile/${event.organizerId}`} passHref><span className="hover:underline">Hosted by {userProfile?.username || '...'}</span></Link>)
              }
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>🕒 {time}</span>
              <span>{event.type === 'virtual' ? '🏠' : '📍'} {event.location}</span>
              <span>👥 {spots}</span>
              {event.distance && <span>{event.distance}</span>}
            </div>
            {event.isFree && <Badge variant="outline" className="border-primary text-primary">Free</Badge>}
          </div>
        </div>
      </CardContent>
      {event.isInvitation && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button className="w-full font-bold">ACCEPT</Button>
          <Button variant="secondary" className="w-full">DECLINE</Button>
        </CardFooter>
      )}
      {!event.isInvitation && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button variant="secondary" className="w-full">SAVE</Button>
          <Link href={`/connect/${event.id}`} passHref className="w-full">
            <Button className="w-full font-bold">MORE INFO</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
