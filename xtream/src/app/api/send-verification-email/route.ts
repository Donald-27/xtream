
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  // Ensure environment variables are set
  if (!process.env.GMAIL_SENDER_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Missing GMAIL_SENDER_EMAIL or GMAIL_APP_PASSWORD environment variables.');
    return NextResponse.json({ error: 'Server is not configured for sending emails.' }, { status: 500 });
  }

  try {
    // Generate the email verification link using Firebase Admin SDK
    const actionCodeSettings = {
      url: `${request.headers.get('origin')}/login`, // Redirect here after verification
      handleCodeInApp: true,
    };
    const link = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);

    // Set up Nodemailer transporter using your Gmail App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_SENDER_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Define email options
    const mailOptions = {
      from: `"Xtream" <${process.env.GMAIL_SENDER_EMAIL}>`,
      to: email,
      subject: 'Verify your email for Xtream',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to Xtream!</h2>
          <p>Please click the link below to verify your email address and activate your account.</p>
          <p>
            <a href="${link}" style="background-color: #15803d; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Your Email</a>
          </p>
          <p>If you did not create an account, you can safely ignore this email.</p>
          <br>
          <p>Best,</p>
          <p>The Xtream Team</p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Verification email sent successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send verification email.' }, { status: 500 });
  }
}
