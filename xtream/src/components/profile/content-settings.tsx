
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';


const contentSettingsSchema = z.object({
  defaultStreamCategory: z.string().max(50, "Category can't be more than 50 characters.").optional(),
  discoveryRadius: z.number().min(1).max(500),
});

type ContentSettingsFormData = z.infer<typeof contentSettingsSchema>;

export function ContentSettings() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [radius, setRadius] = useState(50);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading } = useDoc<User>(userDocRef);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContentSettingsFormData>({
    resolver: zodResolver(contentSettingsSchema),
    defaultValues: {
      discoveryRadius: 50,
    }
  });

  const discoveryRadius = watch('discoveryRadius');

  useEffect(() => {
    if (userProfile) {
      setValue('defaultStreamCategory', userProfile.defaultStreamCategory || '');
      setValue('discoveryRadius', userProfile.discoveryRadius || 50);
      setRadius(userProfile.discoveryRadius || 50);
    }
  }, [userProfile, setValue]);
  
  const onSubmit = async (data: ContentSettingsFormData) => {
    if (!userDocRef) return;
    setIsSubmitting(true);
    try {
        await setDocumentNonBlocking(userDocRef, data, { merge: true });
        toast({
            title: 'Settings Saved',
            description: 'Your content and discovery preferences have been updated.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Saving Settings',
            description: 'Could not update your preferences. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="defaultStreamCategory">Default Stream Category</Label>
        <Input 
          id="defaultStreamCategory" 
          {...register('defaultStreamCategory')}
          placeholder="e.g., Gaming, IRL, Music"
          className="bg-background"
        />
        {errors.defaultStreamCategory && <p className="text-destructive text-sm">{errors.defaultStreamCategory.message}</p>}
        <p className="text-xs text-muted-foreground">Set a category that will be automatically applied when you go live.</p>
      </div>

       <div className="space-y-4">
        <div className='flex justify-between items-center'>
            <Label htmlFor="discoveryRadius">Discovery Radius</Label>
            <span className='text-sm font-medium text-primary'>{discoveryRadius} km</span>
        </div>
        <Slider
          id="discoveryRadius"
          min={1}
          max={500}
          step={1}
          value={[discoveryRadius]}
          onValueChange={(value) => setValue('discoveryRadius', value[0])}
        />
        <p className="text-xs text-muted-foreground">Set the maximum distance for streams, events, and users shown to you.</p>
      </div>

       <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save Preferences'}
      </Button>
    </form>
  );
}
