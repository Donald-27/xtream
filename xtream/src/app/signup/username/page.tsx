'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSupabaseClient } from '@/lib/supabase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { OnboardingModal } from '@/components/onboarding-modal';

export default function SetUsernamePage() {
  const { user, isUserLoading } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedUsername, setSavedUsername] = useState('');

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const checkProfile = async () => {
      const { data: existingUser } = await supabase
        .from('users')
        .select('username, has_seen_onboarding')
        .eq('id', user.id)
        .single() as { data: { username: string; has_seen_onboarding: boolean } | null };

      if (existingUser?.username) {
        if (!existingUser.has_seen_onboarding) {
          setSavedUsername(existingUser.username);
          setShowOnboarding(true);
        } else {
          router.replace('/');
        }
      }
    };
    checkProfile();
  }, [user, isUserLoading, router, supabase]);

  const handleSetUsername = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in.' });
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .single() as { data: { id: string } | null };

      if (existingUsername) {
        setError('This username is already taken. Please choose another one.');
        setIsLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        username: username.toLowerCase(),
        display_name: username,
        is_verified: user.email_confirmed_at ? true : false,
        created_at: new Date().toISOString(),
        username_last_changed: new Date().toISOString(),
        follower_ids: [],
        following_ids: [],
        bio: '',
        location: '',
        profile_picture_url: user.user_metadata?.avatar_url || '',
        cover_photo_url: '',
        has_seen_onboarding: false,
        lifetime_gold: 0,
        blocked_user_ids: [],
        discovery_radius: 50,
        is_discoverable: true,
      } as any);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Username set!',
        description: `Welcome to the community, ${username}!`,
      });

      setSavedUsername(username);
      setShowOnboarding(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    if (user) {
      try {
        await supabase
          .from('users')
          .update({ has_seen_onboarding: true } as any)
          .eq('id', user.id);
      } catch (err) {
        console.error('Error updating onboarding status:', err);
      }
    }

    setShowOnboarding(false);
    router.push('/');
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        username={savedUsername}
      />

      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Choose your Username</CardTitle>
            <CardDescription>
              This is how other users will see you on Xtream. You can change it later.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g., stream_master"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handleSetUsername()}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSetUsername} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Confirm Username & Finish Setup'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
