
'use client';

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Share, Eye, Star, Users, Link as LinkIcon, Video, LogOut, Medal, QrCode, DatabaseZap, MapPin, Film, PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleStreamDialog } from "@/components/schedule-stream-dialog";
import { useUser, useAuth, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, where, serverTimestamp, getDocs, limit, orderBy } from 'firebase/firestore';
import type { User as UserType, Stream, Post } from '@/lib/types';
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
import { useEffect, useState } from "react";
import QRCode from 'qrcode';
import { useToast } from "@/hooks/use-toast";
import { seedDatabase } from "@/lib/seed";
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
        if(open && !qrCodeUrl) {
            generateQRCode();
        }
    }}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-sm">
          <QrCode className="w-4 h-4 mr-2"/>
          Link a New Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Link a New Device</DialogTitle>
          <DialogDescription>
            Scan this QR code with another device to log in instantly. Do not share this code with anyone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          {isLoading && <Skeleton className="h-64 w-64" />}
          {qrCodeUrl && <Image src={qrCodeUrl} alt="QR Code" width={256} height={256} />}
          {!isLoading && !qrCodeUrl && <p className="text-destructive">Could not load QR code.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}


export default function ProfilePage() {
  const { user } = useUser(); 
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserType>(userDocRef);
  
  const userPostsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'posts'), where('creatorId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: userPosts, isLoading: arePostsLoading } = useCollection<Post>(userPostsQuery);

  const coverImage = PlaceHolderImages.find((img) => img.id === 'stream-2');

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };
  
  const handleSeedDatabase = async () => {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to seed the database.' });
      return;
    }
    setIsSeeding(true);
    const result = await seedDatabase(firestore, user.uid);
    if (result?.success) {
      toast({
        title: 'Database Seeded!',
        description: 'Sample streams, challenges, and events have been added.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: 'Could not seed the database. Check the console for errors.',
      });
    }
    setIsSeeding(false);
  };
  
  const handleCreatePost = async () => {
    if (!firestore || !user) return;
    setIsCreatingPost(true);

    try {
        // Find a past stream by this user to create a clip from
        const pastStreamsQuery = query(
            collection(firestore, 'streams'),
            where('userId', '==', user.uid),
            where('live', '==', false),
            orderBy('startTime', 'desc'),
            limit(1)
        );
        const streamSnapshot = await getDocs(pastStreamsQuery);

        if (streamSnapshot.empty) {
            toast({ variant: 'destructive', title: 'No past streams found', description: 'You need to have at least one completed stream to create a post.' });
            setIsCreatingPost(false);
            return;
        }

        const pastStream = streamSnapshot.docs[0].data() as Stream;
        const postsCollection = collection(firestore, 'posts');

        await addDocumentNonBlocking(postsCollection, {
            creatorId: user.uid,
            originalStreamId: pastStream.id,
            title: `Highlight from: ${pastStream.title}`,
            // In a real app, this URL would point to a real video clip.
            // We use a placeholder video for demonstration.
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            thumbnailUrl: pastStream.thumbnailUrl || 'https://picsum.photos/seed/post/400/225',
            createdAt: serverTimestamp(),
            reactions: { spark: 0, brightIdea: 0, support: 0, gold: 0, grow: 0 },
        });

        toast({ title: 'Post Created!', description: 'A highlight from your last stream has been posted.' });

    } catch (error) {
        console.error("Error creating post:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create post.' });
    } finally {
        setIsCreatingPost(false);
    }
  }


  const getInitials = (name?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  }
  
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
            data-ai-hint="cover photo"
            fill
            className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 rounded-full" onClick={handleSignOut}><LogOut className="w-5 h-5"/></Button>
            <Link href="/profile/settings" passHref>
              <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 rounded-full"><Settings className="w-5 h-5"/></Button>
            </Link>
            <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 rounded-full"><Share className="w-5 h-5"/></Button>
        </div>
        <div className="absolute -bottom-12 left-4">
            <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={userProfile?.profilePictureUrl || user?.photoURL || undefined} alt={userProfile?.username || 'User'} />
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
                    <MapPin className="w-4 h-4"/>
                    <span>{userProfile.location}</span>
                </div>
            )}
            <div className="font-semibold"><Users className="w-4 h-4 inline mr-1 text-primary"/>{userProfile.followerIds?.length || 0} <span className="font-normal">followers</span></div>
            <div className="font-semibold"><LinkIcon className="w-4 h-4 inline mr-1 text-primary"/>{userProfile.followingIds?.length || 0} <span className="font-normal">following</span></div>
        </div>

        <p className="mt-2 text-primary-foreground">{userProfile?.bio || 'Your bio will appear here. Edit your profile to add one!'}</p>

        <div className="my-4 grid grid-cols-2 text-center border-y border-border/80 py-2">
            <div className="font-semibold"><Eye className="w-4 h-4 inline mr-1 text-primary"/>0 <span className="font-normal text-muted-foreground">views</span></div>
            <div className="font-semibold"><Star className="w-4 h-4 inline mr-1 text-accent"/>{userProfile.lifetimeGold || 0} <span className="font-normal text-muted-foreground">Gold</span></div>
        </div>

        <div className="flex gap-2">
            <Link href="/go-live" passHref className="flex-1">
              <Button variant="hot" className="w-full"><Video className="w-4 h-4 mr-2"/>STREAM NOW</Button>
            </Link>
            <ScheduleStreamDialog />
        </div>
        
        <Tabs defaultValue="content" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-6 bg-secondary">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="vybes">Challenges</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
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
                        {userPosts.map(post => <PostCard key={post.id} post={post}/>)}
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
           <TabsContent value="developer" className="mt-4 text-center space-y-4">
             <h3 className="font-semibold text-primary-foreground">Developer Options</h3>
             <p className="text-sm text-muted-foreground">For testing and development purposes.</p>
            
            <div className="pt-4 flex flex-col items-center gap-4">
                <QRCodeDialog userProfile={userProfile} />

                <Button variant="outline" onClick={handleSeedDatabase} disabled={isSeeding} className="w-full max-w-sm">
                    <DatabaseZap className="mr-2 h-4 w-4" />
                    {isSeeding ? 'Seeding Database...' : 'Seed Database'}
                </Button>
            </div>
           </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

    