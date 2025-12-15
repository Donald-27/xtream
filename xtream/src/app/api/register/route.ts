
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

function encryptPassword(password: string): { encrypted: string; iv: string } {
  const key = process.env.PASSWORD_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('PASSWORD_ENCRYPTION_KEY environment variable is required');
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', 
    crypto.createHash('sha256').update(key).digest().slice(0, 32),
    iv
  );
  let encrypted = cipher.update(password, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return { encrypted, iv: iv.toString('base64') };
}

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  if (!process.env.GMAIL_SENDER_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Missing GMAIL_SENDER_EMAIL or GMAIL_APP_PASSWORD environment variables.');
    return NextResponse.json({ error: 'Server is not configured for sending emails.' }, { status: 500 });
  }

  if (!process.env.PASSWORD_ENCRYPTION_KEY) {
    console.error('Missing PASSWORD_ENCRYPTION_KEY environment variable.');
    return NextResponse.json({ error: 'Server is not configured properly.' }, { status: 500 });
  }

  try {
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const { encrypted: encryptedPassword, iv: passwordIv } = encryptPassword(password);
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await adminDb.collection('pending_registrations').doc(email.toLowerCase()).set({
      email: email.toLowerCase(),
      encryptedPassword,
      passwordIv,
      verificationCode,
      expiresAt,
      createdAt: new Date(),
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
          <p>Your verification code is:</p>
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

    return NextResponse.json({ message: 'Verification code sent successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error creating pending registration:', error);
    return NextResponse.json({ error: error.message || 'Failed to create registration.' }, { status: 500 });
  }
}
