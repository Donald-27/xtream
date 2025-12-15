
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useCollection, updateDocumentNonBlocking, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, documentId, arrayRemove, writeBatch } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export function PrivacySettings() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const [isDiscoverable, setIsDiscoverable] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setIsDiscoverable(userProfile.isDiscoverable || false);
    }
  }, [userProfile]);

  const handleDiscoverableToggle = async (checked: boolean) => {
    if (!userDocRef) return;
    setIsDiscoverable(checked);
    try {
      await setDocumentNonBlocking(userDocRef, { isDiscoverable: checked }, { merge: true });
      toast({
        title: 'Discovery Setting Updated',
        description: checked ? 'You are now discoverable by nearby users.' : 'You are no longer discoverable.',
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update your setting.' });
      // revert state on error
      setIsDiscoverable(!checked);
    }
  };

  const blockedUsersQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile?.blockedUserIds || userProfile.blockedUserIds.length === 0) return null;
    return query(collection(firestore, 'users'), where(documentId(), 'in', userProfile.blockedUserIds));
  }, [firestore, userProfile?.blockedUserIds]);

  const { data: blockedUsers, isLoading: areBlockedUsersLoading } = useCollection<User>(blockedUsersQuery);
  const isLoading = isProfileLoading || areBlockedUsersLoading;

  const handleUnblockUser = async (userIdToUnblock: string) => {
    if (!user || !userDocRef) return;
    
    try {
        await updateDocumentNonBlocking(userDocRef, {
            blockedUserIds: arrayRemove(userIdToUnblock)
        });
        toast({
            title: 'User Unblocked',
            description: 'They will now be able to interact with you.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not unblock the user. Please try again.',
        });
    }
  };

  const getInitials = (name?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-primary-foreground">Nearby Discovery</h3>
        <p className="text-sm text-muted-foreground">Allow others on the same Wi-Fi network to find your profile.</p>
        <div className="flex items-center space-x-2 mt-4">
          <Switch 
            id="discoverable-mode" 
            checked={isDiscoverable}
            onCheckedChange={handleDiscoverableToggle}
          />
          <Label htmlFor="discoverable-mode">Make my profile discoverable</Label>
        </div>
      </div>


      <div>
        <h3 className="text-lg font-medium text-primary-foreground">Blocked Users</h3>
        <p className="text-sm text-muted-foreground">Manage users you've blocked. They won't be able to find your profile, stream, or message you.</p>
        
        <div className="mt-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          )}
          {!isLoading && (!blockedUsers || blockedUsers.length === 0) && (
            <p className="text-muted-foreground text-center py-4">You haven't blocked any users.</p>
          )}
          {blockedUsers && blockedUsers.map(blockedUser => (
            <div key={blockedUser.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={blockedUser.profilePictureUrl} />
                  <AvatarFallback>{getInitials(blockedUser.username)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{blockedUser.username}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleUnblockUser(blockedUser.id)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Unblock {blockedUser.username}</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

    