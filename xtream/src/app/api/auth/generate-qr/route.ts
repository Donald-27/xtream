
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  const authorization = headers().get('Authorization');
  if (!authorization) {
    return NextResponse.json({ error: 'Authorization header is missing.' }, { status: 401 });
  }

  const idToken = authorization.split('Bearer ')[1];
  if (!idToken) {
    return NextResponse.json({ error: 'Bearer token is missing.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 403 });
  }

  const userId = decodedToken.uid;
  const pairingCode = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();

  const qrCodeData = {
    pairingCode,
    userId, // For simplicity, we can include this. In a real app, encrypt it.
    timestamp,
    purpose: 'device_pairing',
  };

  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.update({
      qrCodeData: JSON.stringify(qrCodeData),
    });

    return NextResponse.json({
      message: 'QR Code data generated successfully',
      qrCodeData: qrCodeData,
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating user with QR code data:', error);
    return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
  }
}
