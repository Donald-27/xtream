
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { AccountManagement } from '@/components/profile/account-management';
import { PrivacySettings } from '@/components/profile/privacy-settings';
import { ContentSettings } from '@/components/profile/content-settings';

export default function SettingsPage() {

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/profile" passHref>
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Manage Your Account</CardTitle>
            <CardDescription>Update your profile, account, privacy, and content settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="profile">
              <AccordionItem value="profile">
                <AccordionTrigger className="text-lg font-semibold">Edit Profile</AccordionTrigger>
                <AccordionContent>
                    <p className="text-muted-foreground mb-6">Make changes to your public profile information.</p>
                    <EditProfileForm />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="account">
                <AccordionTrigger className="text-lg font-semibold">Account Management</AccordionTrigger>
                <AccordionContent>
                    <p className="text-muted-foreground mb-6">Update your sign-in and account security details.</p>
                    <AccountManagement />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="content">
                <AccordionTrigger className="text-lg font-semibold">Content & Discovery</AccordionTrigger>
                <AccordionContent>
                    <p className="text-muted-foreground mb-6">Customize how you discover content on Parallel Lives.</p>
                    <ContentSettings />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="privacy">
                <AccordionTrigger className="text-lg font-semibold">Privacy & Safety</AccordionTrigger>
                <AccordionContent>
                     <p className="text-muted-foreground mb-6">Manage who can interact with you.</p>
                    <PrivacySettings />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
