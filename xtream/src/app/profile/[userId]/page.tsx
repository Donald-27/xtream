
'use client';

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Star, Users, Link as LinkIcon, ArrowLeft, Medal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getMedal } from "@/lib/medals";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', Array.isArray(userId) ? userId[0] : userId);
  }, [firestore, userId]);
  
  const { data: userProfile, isLoading } = useDoc<UserType>(userDocRef);
  
  const currentUserDocRef = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return doc(firestore, 'users', currentUser.uid);
  }, [firestore, currentUser]);

  const { data: currentUserProfile } = useDoc<UserType>(currentUserDocRef);

  const coverImage = PlaceHolderImages.find((img) => img.id === 'stream-4');

  const isFollowing = currentUserProfile?.followingIds?.includes(userProfile?.id || '');

  const handleFollowToggle = async () => {
    if (!currentUser || !userProfile || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to follow users.' });
        return;
    }
    
    const currentUserRef = doc(firestore, 'users', currentUser.uid);
    const targetUserRef = doc(firestore, 'users', userProfile.id);

    if (isFollowing) {
        // Unfollow
        updateDocumentNonBlocking(currentUserRef, { followingIds: arrayRemove(userProfile.id) });
        updateDocumentNonBlocking(targetUserRef, { followerIds: arrayRemove(currentUser.uid) });
        toast({ title: 'Unfollowed', description: `You are no longer following ${userProfile.username}.` });
    } else {
        // Follow
        updateDocumentNonBlocking(currentUserRef, { followingIds: arrayUnion(userProfile.id) });
        updateDocumentNonBlocking(targetUserRef, { followerIds: arrayUnion(currentUser.uid) });
        toast({ title: 'Followed', description: `You are now following ${userProfile.username}.` });
    }
  };


  const getInitials = (name?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    return 'U';
  }

  const followerCount = userProfile?.followerIds?.length || 0;
  const medal = getMedal(followerCount);

  if (isLoading || !userProfile) {
    return (
       <div className="flex flex-col">
          <header className="relative h-48 bg-muted">
             <Skeleton className="w-full h-full"/>
             <div className="absolute top-4 left-4">
                <Skeleton className="w-9 h-9 rounded-full"/>
             </div>
             <div className="absolute -bottom-12 left-4">
                <Skeleton className="w-24 h-24 rounded-full border-4 border-background"/>
             </div>
          </header>
           <main className="p-4 pt-16">
            <Skeleton className="h-8 w-48 mb-1"/>
            <Skeleton className="h-4 w-24 mb-2"/>
            <Skeleton className="h-4 w-full mb-4"/>
             <div className="my-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <Skeleton className="h-6 w-20 mx-auto"/>
                <Skeleton className="h-6 w-20 mx-auto"/>
                <Skeleton className="h-6 w-20 mx-auto"/>
                <Skeleton className="h-6 w-20 mx-auto"/>
            </div>
             <div className="flex gap-2">
                <Skeleton className="h-10 w-full"/>
             </div>
           </main>
       </div>
    )
  }
  
  const isOwnProfile = currentUser?.uid === userProfile.id;

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
         <div className="absolute top-4 left-4">
            <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 rounded-full" onClick={() => router.back()}><ArrowLeft className="w-5 h-5"/></Button>
        </div>
        <div className="absolute -bottom-12 left-4">
            <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={userProfile?.profilePictureUrl} alt={userProfile?.username || 'User'} />
                <AvatarFallback>{getInitials(userProfile?.username)}</AvatarFallback>
            </Avatar>
        </div>
      </header>

      <main className="p-4 pt-16">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{userProfile?.username}</h1>
          {medal && <Medal className="w-6 h-6" style={{ color: medal.color }} />}
        </div>
        <p className="text-muted-foreground">🌍 {userProfile?.location || 'Earth'}</p>
        <p className="mt-2 text-primary-foreground">{userProfile?.bio || 'No bio provided.'}</p>

        <div className="my-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="font-semibold"><Eye className="w-4 h-4 inline mr-1 text-primary"/>0 <span className="font-normal text-muted-foreground">views</span></div>
            <div className="font-semibold"><Star className="w-4 h-4 inline mr-1 text-primary"/>N/A <span className="font-normal text-muted-foreground">rating</span></div>
            <div className="font-semibold"><Users className="w-4 h-4 inline mr-1 text-primary"/>{userProfile.followerIds?.length || 0} <span className="font-normal text-muted-foreground">followers</span></div>
            <div className="font-semibold"><LinkIcon className="w-4 h-4 inline mr-1 text-primary"/>{userProfile.followingIds?.length || 0} <span className="font-normal text-muted-foreground">following</span></div>
        </div>

        {!isOwnProfile && (
            <div className="flex gap-2">
                <Button className="w-full" onClick={handleFollowToggle}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
                <Button variant="secondary" className="w-full">Message</Button>
            </div>
        )}
        
        <Tabs defaultValue="content" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-5 bg-secondary">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="mt-4">
            <p className="text-center text-muted-foreground py-8">Past streams and highlights will appear here.</p>
          </TabsContent>
           <TabsContent value="games" className="mt-4">
            <p className="text-center text-muted-foreground py-8">Games created or played by {userProfile.username} will appear here.</p>
          </TabsContent>
           <TabsContent value="events" className="mt-4">
            <p className="text-center text-muted-foreground py-8">Events for {userProfile.username} will appear here.</p>
          </TabsContent>
           <TabsContent value="groups" className="mt-4">
            <p className="text-center text-muted-foreground py-8">Groups for {userProfile.username} will appear here.</p>
          </TabsContent>
           <TabsContent value="about" className="mt-4">
            <p className="text-center text-muted-foreground py-8">More about {userProfile.username} will appear here.</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


