
import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

interface Session {
    user: DecodedIdToken | null;
}

/**
 * A helper function to get the current user session on the server-side.
 * It verifies the Authorization header token using Firebase Admin SDK.
 */
export async function getServerSession(): Promise<Session> {
    const authorization = headers().get('Authorization');
    if (authorization) {
        const idToken = authorization.split('Bearer ')[1];
        if (idToken) {
            try {
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                return { user: decodedToken };
            } catch (error) {
                // Token is invalid or expired
                console.warn('Invalid auth token in getServerSession:', error);
                return { user: null };
            }
        }
    }
    // No token provided
    return { user: null };
}

// We also need a way to pass the token from the client to the server.
// This client-side helper function should be used in fetch calls from the client.
export async function getAuthenticatedFetch(auth: any) {
    const user = auth.currentUser;
    if (!user) {
        return fetch;
    }
    const token = await user.getIdToken();
    
    const customFetch = (url: RequestInfo | URL, options?: RequestInit) => {
        const headers = new Headers(options?.headers);
        headers.set('Authorization', `Bearer ${token}`);
        
        const newOptions: RequestInit = {
            ...options,
            headers,
        };
        
        return fetch(url, newOptions);
    };

    return customFetch;
}
