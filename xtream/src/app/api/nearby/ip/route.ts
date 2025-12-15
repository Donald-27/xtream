
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getServerSession } from '@/lib/get-server-session';
import { headers } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';
import type { User } from '@/lib/types';

const IP_CACHE_TTL_MINUTES = 5;

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.uid;

  // Get the IP address from the request headers
  const forwarded = headers().get('x-forwarded-for');
  const ip = forwarded ? (forwarded as string).split(/, /)[0] : headers().get('x-real-ip') || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for");
  
  if (!ip) {
    return NextResponse.json({ error: 'Could not determine IP address.' }, { status: 400 });
  }

  try {
    const locationsRef = adminDb.collection('locations');

    // Update the current user's location/heartbeat
    await locationsRef.doc(userId).set({
      ip: ip,
      updatedAt: FieldValue.serverTimestamp(),
      userId: userId,
    }, { merge: true });

    // Calculate the timestamp for TTL
    const fiveMinutesAgo = new Date(Date.now() - IP_CACHE_TTL_MINUTES * 60 * 1000);

    // Query for other users with the same IP address who have been active recently
    const nearbyQuery = locationsRef
        .where('ip', '==', ip)
        .where('updatedAt', '>', fiveMinutesAgo);

    const nearbySnapshot = await nearbyQuery.get();
    
    if (nearbySnapshot.empty) {
        return NextResponse.json({ users: [] }, { status: 200 });
    }

    const nearbyUserIds = nearbySnapshot.docs
        .map(doc => doc.id)
        .filter(id => id !== userId);
    
    if (nearbyUserIds.length === 0) {
        return NextResponse.json({ users: [] }, { status: 200 });
    }
    
    // Fetch the profiles of the nearby users who have discovery enabled
    const usersRef = adminDb.collection('users');
    const profilesQuery = usersRef
        .where('isDiscoverable', '==', true)
        .where('id', 'in', nearbyUserIds);
        
    const profilesSnapshot = await profilesQuery.get();

    const users = profilesSnapshot.docs.map(doc => doc.data() as User);
    
    return NextResponse.json({ users }, { status: 200 });

  } catch (error: any) {
    console.error('Error in nearby IP discovery:', error);
    return NextResponse.json({ error: 'Failed to find nearby users.', details: error.message }, { status: 500 });
  }
}

    