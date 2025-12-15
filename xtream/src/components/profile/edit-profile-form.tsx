
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Search } from 'lucide-react';
import type { User } from '@/lib/types';
import { differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { findLocation } from '@/ai/flows/find-location';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be less than 20 characters.'),
  bio: z.string().max(160, 'Bio must be less than 160 characters.').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters.').optional(),
  profilePictureUrl: z.string().optional(),
  coverPhotoUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function EditProfileForm() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [usernameChangedDate, setUsernameChangedDate] = useState<Date | null>(null);

  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading } = useDoc<User>(userDocRef);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const profilePictureUrl = watch('profilePictureUrl');
  const coverPhotoUrl = watch('coverPhotoUrl');

  useEffect(() => {
    if (userProfile) {
      setValue('username', userProfile.username);
      setValue('bio', userProfile.bio || '');
      setValue('location', userProfile.location || '');
      setValue('profilePictureUrl', userProfile.profilePictureUrl || '');
      setValue('coverPhotoUrl', userProfile.coverPhotoUrl || '');
      
      if (userProfile.usernameLastChanged) {
        const lastChanged = new Date(userProfile.usernameLastChanged.seconds * 1000);
        setUsernameChangedDate(lastChanged);
        const daysSinceChange = differenceInDays(new Date(), lastChanged);
        setCanChangeUsername(daysSinceChange >= 30);
      }
    }
  }, [userProfile, setValue]);
  
  const checkUsernameAvailability = async (name: string) => {
    if (!firestore) return false;
    const usernameDocRef = doc(firestore, 'usernames', name.toLowerCase());
    const docSnap = await getDoc(usernameDocRef);
    return docSnap.exists();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePictureUrl' | 'coverPhotoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setValue(field, base64String);
    };
    reader.readAsDataURL(file);
  };
  
  const handleFindLocation = async () => {
      const query = getValues('location');
      if (!query) {
          toast({ variant: 'destructive', title: 'Location needed', description: 'Please type a location to search for.' });
          return;
      }
      setIsFindingLocation(true);
      try {
          const result = await findLocation({ query });
          if(result.formattedLocation) {
              setValue('location', result.formattedLocation);
              toast({ title: 'Location Found!', description: `Set location to ${result.formattedLocation}` });
          } else {
              toast({ variant: 'destructive', title: 'Location not found', description: 'Could not find a matching location. Please try a different search.' });
          }
      } catch (error) {
          console.error("Error finding location:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while searching for the location.' });
      } finally {
          setIsFindingLocation(false);
      }
  };


  const onSubmit = async (data: ProfileFormData) => {
    if (!user || !firestore || !userProfile || !userDocRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update your profile.' });
      return;
    }
    setIsSubmitting(true);
    
    let usernameLastChanged = userProfile.usernameLastChanged;

    if (data.username.toLowerCase() !== userProfile.username.toLowerCase()) {
        if (!canChangeUsername) {
            toast({ variant: 'destructive', title: 'Error', description: 'You can only change your username once every 30 days.' });
            setIsSubmitting(false);
            return;
        }
        const isTaken = await checkUsernameAvailability(data.username);
        if (isTaken) {
            toast({ variant: 'destructive', title: 'Username Taken', description: 'This username is already taken. Please choose another one.' });
            setIsSubmitting(false);
            return;
        }
        
        const oldUsernameDocRef = doc(firestore, 'usernames', userProfile.username.toLowerCase());
        const newUsernameDocRef = doc(firestore, 'usernames', data.username.toLowerCase());
        setDocumentNonBlocking(newUsernameDocRef, { userId: user.uid }, {});
        const { deleteDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
        deleteDocumentNonBlocking(oldUsernameDocRef);
        
        usernameLastChanged = serverTimestamp();
    }

    try {
      setDocumentNonBlocking(userDocRef, { 
        ...data,
        usernameLastChanged,
      }, { merge: true });

      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !userProfile) {
      return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register('username')} disabled={!canChangeUsername || isSubmitting} className="bg-background"/>
        {!canChangeUsername && usernameChangedDate && (
                <p className="text-xs text-muted-foreground">
                You can change your username again in {30 - differenceInDays(new Date(), usernameChangedDate)} days.
            </p>
        )}
        {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" {...register('bio')} placeholder="Tell us about yourself..." className="bg-background"/>
        {errors.bio && <p className="text-destructive text-sm">{errors.bio.message}</p>}
        </div>

        <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <div className="flex gap-2">
            <Input id="location" {...register('location')} placeholder="e.g., New York, USA" className="bg-background"/>
            <Button type="button" variant="outline" size="icon" onClick={handleFindLocation} disabled={isFindingLocation}>
            <Search className={`h-4 w-4 ${isFindingLocation ? 'animate-spin' : ''}`} />
            <span className="sr-only">Find Location</span>
            </Button>
        </div>
        {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
        </div>

        {/* Profile Picture Upload */}
        <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border">
                    {profilePictureUrl ? (
                        <img src={profilePictureUrl} alt="Profile" className="h-full w-full object-cover"/>
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                            <UploadCloud/>
                        </div>
                    )}
                </div>
                <Button type="button" variant="outline" onClick={() => profilePicInputRef.current?.click()}>
                    Upload Image
                </Button>
                <input
                    type="file"
                    ref={profilePicInputRef}
                    onChange={(e) => handleFileChange(e, 'profilePictureUrl')}
                    accept="image/png, image/jpeg, image/gif"
                    className="hidden"
                />
            </div>
        </div>

        {/* Cover Photo Upload */}
        <div className="space-y-2">
            <Label>Cover Photo</Label>
            <div className="relative aspect-video w-full rounded-md overflow-hidden border-2 border-border">
                {coverPhotoUrl ? (
                    <img src={coverPhotoUrl} alt="Cover" className="h-full w-full object-cover"/>
                ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                        <UploadCloud className="h-8 w-8"/>
                    </div>
                )}
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={() => coverPhotoInputRef.current?.click()}>
            Upload Cover Photo
        </Button>
        <input
            type="file"
            ref={coverPhotoInputRef}
            onChange={(e) => handleFileChange(e, 'coverPhotoUrl')}
            accept="image/png, image/jpeg, image/gif"
            className="hidden"
        />
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </Button>
    </form>
  );
}
