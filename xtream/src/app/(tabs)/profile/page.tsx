'use client';

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Share, Eye, Star, Users, Link as LinkIcon, Video, LogOut, Medal, QrCode, DatabaseZap, MapPin, PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleStreamDialog } from "@/components/schedule-stream-dialog";
import { useUser, useSupabaseClient } from "@/lib/supabase/provider";
import { useDoc, useCollection } from "@/lib/supabase/hooks";
import type { User as UserType, Post } from '@/lib/types';
import { mapDbUserToUser, mapDbPostToPost } from '@/lib/types';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getMedal } from "@/lib/medals";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import QRCode from 'qrcode';
import { useToast } from "@/hooks/use-toast";
import { PostCard } from "@/components/post-card";

function ProfileSkeleton() {
  return (
    <div className="flex flex-col">
      <header className="relative h-48 bg-muted">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-4 right-4 flex gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="absolute -bottom-12 left-4">
          <Skeleton className="w-24 h-24 rounded-full border-4 border-background" />
        </div>
      </header>
      <main className="p-4 pt-16">
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="my-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Skeleton className="h-6 w-20 mx-auto" />
          <Skeleton className="h-6 w-20 mx-auto" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </main>
    </div>
  );
}

function QRCodeDialog({ userProfile }: { userProfile: UserType }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/generate-qr', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code.');
      }

      const url = await QRCode.toDataURL(JSON.stringify(data.qrCodeData));
      setQrCodeUrl(url);
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      setQrCodeUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => {
      if (open && !qrCodeUrl) {
        generateQRCode();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-sm">
          <QrCode className="w-4 h-4 mr-2" />
          Link a New Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Link a New Device</DialogTitle>
          <DialogDescription>
            Scan this QR code with another device to log in instantly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          {isLoading && <Skeleton className="h-64 w-64" />}
          {qrCodeUrl && <Image src={qrCodeUrl} alt="QR Code" width={256} height={256} />}
          {!isLoading && !qrCodeUrl && <p className="text-destructive">Could not load QR code.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { toast } = useToast();

  const { data: rawUserProfile, isLoading: isProfileLoading } = useDoc<any>(
    user ? 'users' : null,
    user?.id
  );

  const userProfile = useMemo(() => {
    if (!rawUserProfile) return null;
    return mapDbUserToUser(rawUserProfile);
  }, [rawUserProfile]);

  const { data: rawPosts, isLoading: arePostsLoading } = useCollection<any>(
    user ? {
      table: 'posts',
      filters: [{ column: 'creator_id', operator: 'eq', value: user.id }],
      orderBy: { column: 'created_at', ascending: false },
    } : null
  );

  const userPosts = useMemo(() => {
    if (!rawPosts) return null;
    return rawPosts.map(mapDbPostToPost);
  }, [rawPosts]);

  const coverImage = PlaceHolderImages.find((img) => img.id === 'stream-2');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleCreatePost = async () => {
    if (!user) return;
    setIsCreatingPost(true);

    try {
      const { data: pastStream } = await supabase
        .from('streams')
        .select('*')
        .eq('user_id', user.id)
        .eq('live', false)
        .order('start_time', { ascending: false })
        .limit(1)
        .single() as { data: any };

      if (!pastStream) {
        toast({ variant: 'destructive', title: 'No past streams found', description: 'You need to have at least one completed stream to create a post.' });
        setIsCreatingPost(false);
        return;
      }

      await supabase.from('posts').insert({
        creator_id: user.id,
        original_stream_id: pastStream.id,
        title: `Highlight from: ${pastStream.title}`,
        video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail_url: pastStream.thumbnail_url || 'https://picsum.photos/seed/post/400/225',
        reactions: { spark: 0, brightIdea: 0, support: 0, gold: 0, grow: 0 },
      } as any);

      toast({ title: 'Post Created!', description: 'A highlight from your last stream has been posted.' });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create post.' });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  if (isProfileLoading || !userProfile) {
    return <ProfileSkeleton />;
  }

  const followerCount = userProfile?.followerIds?.length || 0;
  const medal = getMedal(followerCount);

  return (
    <div className="flex flex-col">
      <header className="relative h-48">
        <Image
          src={userProfile?.coverPhotoUrl || coverImage?.imageUrl || 'https://picsum.photos/seed/cover/1200/300'}
          alt="Cover photo"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 rounded-full" onClick={handleSignOut}><LogOut className="w-5 h-5" /></Button>
          <Link href="/profile/settings" passHref>
            <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 rounded-full"><Settings className="w-5 h-5" /></Button>
          </Link>
          <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 rounded-full"><Share className="w-5 h-5" /></Button>
        </div>
        <div className="absolute -bottom-12 left-4">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage src={userProfile?.profilePictureUrl || user?.user_metadata?.avatar_url || undefined} alt={userProfile?.username || 'User'} />
            <AvatarFallback>{getInitials(userProfile?.username)}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="p-4 pt-16">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{userProfile?.username || user?.email}</h1>
          {medal && <Medal className="w-6 h-6" style={{ color: medal.color }} />}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground mt-1">
          {userProfile?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{userProfile.location}</span>
            </div>
          )}
          <div className="font-semibold"><Users className="w-4 h-4 inline mr-1 text-primary" />{userProfile.followerIds?.length || 0} <span className="font-normal">followers</span></div>
          <div className="font-semibold"><LinkIcon className="w-4 h-4 inline mr-1 text-primary" />{userProfile.followingIds?.length || 0} <span className="font-normal">following</span></div>
        </div>

        <p className="mt-2 text-primary-foreground">{userProfile?.bio || 'Your bio will appear here. Edit your profile to add one!'}</p>

        <div className="my-4 grid grid-cols-2 text-center border-y border-border/80 py-2">
          <div className="font-semibold"><Eye className="w-4 h-4 inline mr-1 text-primary" />0 <span className="font-normal text-muted-foreground">views</span></div>
          <div className="font-semibold"><Star className="w-4 h-4 inline mr-1 text-accent" />{userProfile.lifetimeGold || 0} <span className="font-normal text-muted-foreground">Gold</span></div>
        </div>

        <div className="flex gap-2">
          <Link href="/go-live" passHref className="flex-1">
            <Button variant="hot" className="w-full"><Video className="w-4 h-4 mr-2" />STREAM NOW</Button>
          </Link>
          <ScheduleStreamDialog />
        </div>

        <Tabs defaultValue="content" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-5 bg-secondary">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="vybes">Challenges</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="mt-4">
            <div className="text-center space-y-4">
              <Button onClick={handleCreatePost} disabled={isCreatingPost}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isCreatingPost ? 'Creating Post...' : 'Create Post from Last Stream'}
              </Button>
              {arePostsLoading && (
                <div className="space-y-4 pt-4">
                  <Skeleton className="h-64 w-full max-w-2xl mx-auto" />
                  <Skeleton className="h-64 w-full max-w-2xl mx-auto" />
                </div>
              )}
              {userPosts && userPosts.length > 0 && (
                <div className="space-y-8 pt-4">
                  {userPosts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
              )}
              {userPosts && userPosts.length === 0 && !arePostsLoading && (
                <p className="text-muted-foreground py-8">Your posted clips will appear here.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="vybes" className="mt-4">
            <p className="text-center text-muted-foreground py-8">Challenges you've created or played will appear here.</p>
          </TabsContent>
          <TabsContent value="events" className="mt-4">
            <p className="text-center text-muted-foreground py-8">Your events will appear here.</p>
          </TabsContent>
          <TabsContent value="groups" className="mt-4">
            <p className="text-center text-muted-foreground py-8">Your groups will appear here.</p>
          </TabsContent>
          <TabsContent value="about" className="mt-4">
            <p className="text-center text-muted-foreground py-8">Your bio and other details will appear here.</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
