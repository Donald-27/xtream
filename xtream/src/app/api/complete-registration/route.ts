
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import crypto from 'crypto';

function decryptPassword(encryptedPassword: string, ivBase64: string): string {
  const key = process.env.PASSWORD_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('PASSWORD_ENCRYPTION_KEY environment variable is required');
  }
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', 
    crypto.createHash('sha256').update(key).digest().slice(0, 32),
    iv
  );
  let decrypted = decipher.update(encryptedPassword, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function POST(request: Request) {
  const { email, username } = await request.json();

  if (!email || !username) {
    return NextResponse.json({ error: 'Email and username are required.' }, { status: 400 });
  }

  if (username.length < 3) {
    return NextResponse.json({ error: 'Username must be at least 3 characters.' }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores.' }, { status: 400 });
  }

  try {
    const pendingDocRef = adminDb.collection('pending_registrations').doc(email.toLowerCase());
    const pendingDoc = await pendingDocRef.get();

    if (!pendingDoc.exists) {
      return NextResponse.json({ error: 'No pending registration found. Please start over.' }, { status: 404 });
    }

    const pendingData = pendingDoc.data();
    
    if (!pendingData?.emailVerified) {
      return NextResponse.json({ error: 'Email not verified. Please verify your email first.' }, { status: 400 });
    }

    if (!pendingData?.encryptedPassword || !pendingData?.passwordIv) {
      return NextResponse.json({ error: 'Invalid registration data. Please start over.' }, { status: 400 });
    }

    const usernameDocRef = adminDb.collection('usernames').doc(username.toLowerCase());
    const usernameDoc = await usernameDocRef.get();
    
    if (usernameDoc.exists) {
      return NextResponse.json({ error: 'This username is already taken.' }, { status: 400 });
    }

    const password = decryptPassword(pendingData.encryptedPassword, pendingData.passwordIv);
    
    const userRecord = await adminAuth.createUser({
      email: email.toLowerCase(),
      password: password,
      emailVerified: true,
      displayName: username,
    });

    const batch = adminDb.batch();

    const userDocRef = adminDb.collection('users').doc(userRecord.uid);
    batch.set(userDocRef, {
      id: userRecord.uid,
      email: email.toLowerCase(),
      username: username,
      displayName: username,
      isVerified: true,
      createdAt: new Date(),
      usernameLastChanged: new Date(),
      followerIds: [],
      followingIds: [],
      bio: '',
      location: '',
      profilePictureUrl: '',
      coverPhotoUrl: '',
      hasSeenOnboarding: false,
    });

    batch.set(usernameDocRef, { userId: userRecord.uid });

    batch.delete(pendingDocRef);

    await batch.commit();

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({ 
      message: 'Registration completed successfully.',
      customToken,
      userId: userRecord.uid,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error completing registration:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete registration.' }, { status: 500 });
  }
}
