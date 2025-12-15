
'use client';

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Post, User } from "@/lib/types";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Download, Flame, Lightbulb, Handshake, Star, Leaf, Headphones } from "lucide-react";
import { AudioDownloadDialog } from "./audio-download-dialog";
import { formatDistanceToNow } from 'date-fns';

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !post.creatorId) return null;
    return doc(firestore, 'users', post.creatorId);
  }, [firestore, post.creatorId]);

  const { data: userProfile } = useDoc<User>(userDocRef);

  const getInitials = (name?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    return 'U';
  }

  const handleDownload = () => {
    // In a real app, this would trigger a download of post.videoUrl
    // with a watermark applied on the server.
    toast({
      title: "Downloading Clip...",
      description: "An Xtream watermark will be added to your download.",
    });
    const link = document.createElement('a');
    link.href = post.videoUrl;
    link.download = `Xtream_Clip_${post.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const reactions = post.reactions || {};
  const createdAt = post.createdAt ? new Date(post.createdAt.seconds * 1000) : new Date();

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden border-border/60 bg-card shadow-lg rounded-xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
            <Link href={`/profile/${post.creatorId}`} passHref>
              <Avatar>
                  <AvatarImage src={userProfile?.profilePictureUrl || undefined} alt={userProfile?.username} />
                  <AvatarFallback>{getInitials(userProfile?.username)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-grow">
                <Link href={`/profile/${post.creatorId}`} passHref>
                  <p className="font-semibold text-primary-foreground hover:underline">{userProfile?.username || '...'}</p>
                </Link>
                <p className="text-sm text-muted-foreground">{formatDistanceToNow(createdAt, { addSuffix: true })}</p>
            </div>
        </div>

        <h2 className="text-lg font-bold tracking-tight text-primary-foreground">{post.title}</h2>

        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          {/* In a real app, you'd use a proper video player */}
          <video
            src={post.videoUrl}
            controls
            className="w-full h-full object-cover"
            poster={post.thumbnailUrl}
          />
          <div className="absolute top-2 right-2 bg-black/50 text-white text-sm font-bold px-2 py-1 rounded">Xtream</div>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary-foreground pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5" title="Sparks">
                <Flame className="w-4 h-4 text-orange-500"/>
                <span>{reactions.spark || 0}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Bright Ideas">
                <Lightbulb className="w-4 h-4 text-yellow-400"/>
                <span>{reactions.brightIdea || 0}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Support">
                <Handshake className="w-4 h-4 text-blue-400"/>
                <span>{reactions.support || 0}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Gold">
                <Star className="w-4 h-4 text-amber-400"/>
                <span>{reactions.gold || 0}</span>
            </div>
             <div className="flex items-center gap-1.5" title="Grows">
                <Leaf className="w-4 h-4 text-green-500"/>
                <span>{reactions.grow || 0}</span>
            </div>
        </div>
      </CardContent>
       <CardFooter className="p-4 pt-0 flex gap-2">
          <Button className="flex-1 font-bold" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Clip
          </Button>
          <AudioDownloadDialog item={post} itemType="post" />
      </CardFooter>
    </Card>
  );
}
