
'use client';

import {
  Auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';

/**
 * Handles the social sign-in process and creates a user profile if one doesn't exist.
 * @param auth The Firebase Auth instance.
 * @param providerName The name of the provider ('google' or 'facebook').
 * @returns {Promise<boolean>} A promise that resolves to true if the user is new, false otherwise.
 */
export const handleSocialSignIn = async (auth: Auth, providerName: 'google' | 'facebook'): Promise<boolean> => {
  const provider =
    providerName === 'google'
      ? new GoogleAuthProvider()
      : new FacebookAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // After sign-in, check if user document exists in Firestore
    const firestore = useFirestore();
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // User is new, create a profile document but without a final username
      const userData = {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        // The username is intentionally left blank to be set on the next page
        username: '', 
        profilePictureUrl: user.photoURL,
        isVerified: true, // Social accounts are considered verified
        createdAt: serverTimestamp(),
        followerIds: [],
        followingIds: [],
      };
      // We use the non-blocking version here to avoid potential UI hangs
      setDocumentNonBlocking(userDocRef, userData, { merge: true });
      return true; // Indicates a new user who needs to set a username
    }

    return false; // Indicates an existing user
  } catch (error: any) {
    console.error(`Error during ${providerName} sign-in:`, error);
    // Re-throw the error to be handled by the calling component
    throw error;
  }
};
