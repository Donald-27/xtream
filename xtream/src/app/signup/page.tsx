
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Chrome, Facebook } from 'lucide-react';
import Link from 'next/link';
import { handleSocialSignIn } from '@/lib/auth-helpers';
import { LogoIcon } from '@/components/icons/logo';
import { FeaturesSection } from '@/components/features-section';


const signupSchema = z
  .object({
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleEmailSignUp = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register.');
      }

      sessionStorage.setItem('pendingEmail', data.email.toLowerCase());

      toast({
        title: 'Verification Code Sent!',
        description: "We've sent a 6-digit code to your email.",
      });
      router.push('/signup/verify-email');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
 const onSocialSignIn = async (providerName: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      const isNewUser = await handleSocialSignIn(auth, providerName);
      toast({
        title: "Sign In Successful",
        description: "Welcome to Xtream!",
      });
       if (isNewUser) {
        router.push('/signup/username');
      } else {
        router.push('/');
      }
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center min-h-screen bg-background">
      <FeaturesSection />
      
      <div className="w-full max-w-sm p-4 pb-8">
        <Card>
          <CardHeader>
            <LogoIcon width={48} height={48} className="mx-auto mb-4" />
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">Join the community. It's quick and easy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit(handleEmailSignUp)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} disabled={isLoading} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} disabled={isLoading} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
               <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register('confirmPassword')} disabled={isLoading} />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending Code...' : 'Create Account'}
              </Button>
            </form>
            <Separator className="my-2" />
             <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => onSocialSignIn('google')} disabled={isLoading}>
                <Chrome className="mr-2 h-4 w-4" /> Google
              </Button>
              <Button variant="outline" onClick={() => onSocialSignIn('facebook')} disabled={isLoading}>
                <Facebook className="mr-2 h-4 w-4" /> Facebook
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-center">
             <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
             <p className="text-xs text-muted-foreground px-4">
              By signing up, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
