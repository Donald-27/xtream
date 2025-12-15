
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MailCheck } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

function VerifyEmailSkeleton() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="text-center">
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                     <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('pendingEmail');
    if (!storedEmail) {
      router.replace('/signup');
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerifyCode = async () => {
    if (!email || code.length !== 6) return;

    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed.');
      }

      toast({
        title: 'Email Verified!',
        description: 'Now choose your username.',
      });
      router.push('/signup/username');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to resend code.');
      }

      toast({
        title: 'Code Resent',
        description: 'A new verification code has been sent to your email.',
      });
      setResendCooldown(60);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Code',
        description: error.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    sessionStorage.removeItem('pendingEmail');
    router.push('/signup');
  };

  if (!email) {
    return <VerifyEmailSkeleton />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to <span className="font-bold text-primary-foreground">{email}</span>. Enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => setCode(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button 
            onClick={handleVerifyCode} 
            disabled={isVerifying || code.length !== 6} 
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button 
                variant="outline"
                onClick={handleResendCode} 
                disabled={isResending || resendCooldown > 0} 
                className="w-full"
            >
                {isResending ? 'Sending...' : (resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code')}
            </Button>
            <Button variant="link" size="sm" onClick={handleGoBack} className="text-muted-foreground">
                Wrong email? Go back.
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
