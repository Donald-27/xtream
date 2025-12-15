
'use client';

import { BottomNav } from "@/components/layout/bottom-nav";
import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FullPageLoader() {
  return (
    <div className="flex flex-col min-h-svh bg-background p-4 sm:p-6 gap-4">
      <div className="flex items-center justify-between h-16">
         <Skeleton className="h-8 w-24" />
         <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
         </div>
      </div>
      <Skeleton className="w-full h-48" />
      <Skeleton className="w-full h-24" />
      <Skeleton className="w-full flex-1" />
    </div>
  );
}


export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user state is resolved
    }

    if (!user) {
      // If no user, redirect to login
      router.replace("/login");
    } else if (!user.emailVerified) {
      // If user exists but email is not verified, redirect to verification page
      router.replace("/signup/verify-email");
    }
    // If user exists and is verified, they can access the content.

  }, [user, isUserLoading, router]);

  // The stream detail page should not have the bottom nav
  if (pathname.startsWith('/stream/') || pathname.startsWith('/connect/') || pathname.startsWith('/play/')) {
    return <>{children}</>;
  }


  // While checking for user authentication or if redirect is in progress
  if (isUserLoading || !user || !user.emailVerified) {
    return <FullPageLoader />;
  }
  
  // If user is authenticated and verified, render the layout
  return (
    <div className="flex flex-col min-h-svh bg-background">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
