
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { signInWithCustomToken, updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { OnboardingModal } from '@/components/onboarding-modal';

export default function SetUsernamePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedUsername, setSavedUsername] = useState('');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('pendingEmail');
    if (storedEmail) {
      setPendingEmail(storedEmail);
      return;
    }

    if (isUserLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }
    
    const checkProfile = async () => {
        if(firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data()?.username) {
                if (!userDoc.data()?.hasSeenOnboarding) {
                  setSavedUsername(userDoc.data()?.username);
                  setShowOnboarding(true);
                } else {
                  router.replace('/');
                }
            }
        }
    }
    checkProfile();

  }, [user, isUserLoading, router, firestore]);

  const handleSetUsernameForPendingUser = async () => {
    if (!pendingEmail) return;
    
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
      const response = await fetch('/api/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, username }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete registration.');
      }

      await signInWithCustomToken(auth, result.customToken);

      sessionStorage.removeItem('pendingEmail');

      toast({
        title: 'Welcome to Xtream!',
        description: `Your account is ready, ${username}!`,
      });
      
      setSavedUsername(username);
      setShowOnboarding(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSetUsernameForExistingUser = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in or database unavailable.' });
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

    const usernameDocRef = doc(firestore, 'usernames', username.toLowerCase());
    const usernameDoc = await getDoc(usernameDocRef);
    
    if (usernameDoc.exists()) {
      setError('This username is already taken. Please choose another one.');
      setIsLoading(false);
      return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);

    try {
      const batch = writeBatch(firestore);

      const userProfileData = {
        id: user.uid,
        email: user.email,
        username: username,
        displayName: username,
        isVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        usernameLastChanged: serverTimestamp(),
        followerIds: [],
        followingIds: [],
        bio: '',
        location: '',
        profilePictureUrl: user.photoURL || '',
        coverPhotoUrl: '',
        hasSeenOnboarding: false,
      };
      batch.set(userDocRef, userProfileData, { merge: true });

      batch.set(usernameDocRef, { userId: user.uid });

      await batch.commit();

      await updateProfile(user, { displayName: username });

      toast({
        title: 'Username set!',
        description: `Welcome to the community, ${username}!`,
      });
      
      setSavedUsername(username);
      setShowOnboarding(true);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving your profile. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSetUsername = () => {
    if (pendingEmail) {
      handleSetUsernameForPendingUser();
    } else {
      handleSetUsernameForExistingUser();
    }
  };

  const handleOnboardingComplete = async () => {
    if (firestore && user) {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const batch = writeBatch(firestore);
        batch.update(userDocRef, { hasSeenOnboarding: true });
        await batch.commit();
      } catch (err) {
        console.error('Error updating onboarding status:', err);
      }
    }
    
    setShowOnboarding(false);
    router.push('/');
  };
  
  if (isUserLoading && !pendingEmail) {
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
