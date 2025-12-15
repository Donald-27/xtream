
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// A new client-side fetcher that includes the auth token
async function authenticatedFetch(url: RequestInfo | URL, options?: RequestInit) {
  const { getAuth } = await import('firebase/auth');
  const { getApp } = await import('firebase/app');

  const auth = getAuth(getApp());
  const user = auth.currentUser;

  const headers = new Headers(options?.headers);
  if (user) {
    try {
      const token = await user.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (error) {
      console.error("Error getting ID token:", error);
    }
  }

  const newOptions: RequestInit = {
    ...options,
    headers,
  };

  return fetch(url, newOptions);
}


// Override the global fetch
const originalFetch = global.fetch;
global.fetch = (url, options) => {
    // Only intercept API calls, not external requests
    if (typeof url === 'string' && url.startsWith('/api/')) {
        return authenticatedFetch(url, options);
    }
    return originalFetch(url, options);
};


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
