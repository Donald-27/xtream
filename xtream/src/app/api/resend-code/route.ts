
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  if (!process.env.GMAIL_SENDER_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Missing GMAIL_SENDER_EMAIL or GMAIL_APP_PASSWORD environment variables.');
    return NextResponse.json({ error: 'Server is not configured for sending emails.' }, { status: 500 });
  }

  try {
    const docRef = adminDb.collection('pending_registrations').doc(email.toLowerCase());
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'No pending registration found. Please start over.' }, { status: 404 });
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await docRef.update({
      verificationCode,
      expiresAt,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_SENDER_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Xtream" <${process.env.GMAIL_SENDER_EMAIL}>`,
      to: email,
      subject: 'Your Xtream Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to Xtream!</h2>
          <p>Your new verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
            ${verificationCode}
          </div>
          <p>This code will expire in 1 hour.</p>
          <p>If you did not request this code, you can safely ignore this email.</p>
          <br>
          <p>Best,</p>
          <p>The Xtream Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Verification code resent successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error resending code:', error);
    return NextResponse.json({ error: error.message || 'Failed to resend code.' }, { status: 500 });
  }
}
