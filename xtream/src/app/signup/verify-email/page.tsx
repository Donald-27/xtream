'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MailCheck } from 'lucide-react';

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
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  const [email, setEmail] = useState<string | null>(null);
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

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Email Resent',
        description: 'A new confirmation email has been sent.',
      });
      setResendCooldown(60);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Email',
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
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to <span className="font-bold text-primary-foreground">{email}</span>. Click the link in the email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-sm">
            After clicking the link, you'll be redirected back to complete your profile setup.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={isResending || resendCooldown > 0}
            className="w-full"
          >
            {isResending ? 'Sending...' : (resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email')}
          </Button>
          <Button variant="link" size="sm" onClick={handleGoBack} className="text-muted-foreground">
            Wrong email? Go back.
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
