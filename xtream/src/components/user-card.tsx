
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import Link from 'next/link';
import { getMedal } from "@/lib/medals";
import { Medal } from "lucide-react";

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const getInitials = (name?: string | null) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const medal = getMedal(user.followerIds?.length || 0);

  return (
    <Link href={`/profile/${user.id}`} passHref>
      <Card className="w-full aspect-[3/4] overflow-hidden border-border/60 bg-card shadow-lg rounded-xl flex flex-col items-center justify-center text-center p-4 transition-all hover:border-primary/80 hover:shadow-primary/20 hover:shadow-2xl hover:-translate-y-1">
        <Avatar className="w-20 h-20 border-4 border-background mb-3">
          <AvatarImage src={user.profilePictureUrl || undefined} alt={user.username} />
          <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-lg text-primary-foreground truncate">{user.username}</h3>
            {medal && <Medal className="w-4 h-4" style={{ color: medal.color }} />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{user.location || "Location not set"}</p>
        <p className="text-sm mt-2 text-secondary-foreground line-clamp-2">{user.bio || "No bio available."}</p>
      </Card>
    </Link>
  );
}
