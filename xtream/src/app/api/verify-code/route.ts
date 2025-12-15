
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
  }

  try {
    const docRef = adminDb.collection('pending_registrations').doc(email.toLowerCase());
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'No pending registration found for this email.' }, { status: 404 });
    }

    const data = doc.data();
    
    if (!data) {
      return NextResponse.json({ error: 'Invalid registration data.' }, { status: 400 });
    }

    const expiresAt = data.expiresAt.toDate();
    if (new Date() > expiresAt) {
      await docRef.delete();
      return NextResponse.json({ error: 'Verification code has expired. Please register again.' }, { status: 400 });
    }

    if (data.verificationCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    await docRef.update({ emailVerified: true });

    return NextResponse.json({ message: 'Email verified successfully.', verified: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error verifying code:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify code.' }, { status: 500 });
  }
}
