
'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

const emailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required to confirm your identity.'),
});
type EmailFormData = z.infer<typeof emailSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ['confirmPassword'],
});
type PasswordFormData = z.infer<typeof passwordSchema>;


export function AccountManagement() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  
  const isPasswordUser = user?.providerData.some(p => p.providerId === 'password');

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onEmailSubmit = async (data: EmailFormData) => {
    if (!user) return;
    setIsEmailSubmitting(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, data.password);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, data.newEmail);
      toast({
        title: 'Verification Email Sent!',
        description: `A verification link has been sent to ${data.newEmail}. Please verify to complete the change.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating email',
        description: error.message,
      });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;
    setIsPasswordSubmitting(true);
     try {
      const credential = EmailAuthProvider.credential(user.email!, data.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, data.newPassword);
      toast({
        title: 'Password Updated!',
        description: 'Your password has been successfully changed.',
      });
      resetPasswordForm();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating password',
        description: error.message,
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
        {isPasswordUser ? (
             <>
                <div>
                    <h3 className="text-lg font-medium text-primary-foreground">Change Email</h3>
                    <p className="text-sm text-muted-foreground">Update the email address associated with your account.</p>
                    <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newEmail">New Email</Label>
                            <Input id="newEmail" type="email" {...registerEmail('newEmail')} className="bg-background"/>
                            {emailErrors.newEmail && <p className="text-destructive text-sm">{emailErrors.newEmail.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Current Password</Label>
                            <Input id="password" type="password" {...registerEmail('password')} className="bg-background"/>
                            {emailErrors.password && <p className="text-destructive text-sm">{emailErrors.password.message}</p>}
                        </div>
                        <Button type="submit" disabled={isEmailSubmitting}>
                            {isEmailSubmitting ? 'Sending Verification...' : 'Change Email'}
                        </Button>
                    </form>
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-medium text-primary-foreground">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
                     <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" {...registerPassword('currentPassword')} className="bg-background"/>
                            {passwordErrors.currentPassword && <p className="text-destructive text-sm">{passwordErrors.currentPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" {...registerPassword('newPassword')} className="bg-background"/>
                             {passwordErrors.newPassword && <p className="text-destructive text-sm">{passwordErrors.newPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} className="bg-background"/>
                             {passwordErrors.confirmPassword && <p className="text-destructive text-sm">{passwordErrors.confirmPassword.message}</p>}
                        </div>
                        <Button type="submit" disabled={isPasswordSubmitting}>
                             {isPasswordSubmitting ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </div>
             </>
        ): (
            <p className="text-muted-foreground">Your account is connected via a social provider. You can manage your password through them.</p>
        )}
    </div>
  );
}

