'use client';

import { BottomNav } from "@/components/layout/bottom-nav";
import { useUser } from "@/lib/supabase/provider";
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
      return;
    }

    if (!user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  if (pathname.startsWith('/stream/') || pathname.startsWith('/connect/') || pathname.startsWith('/play/')) {
    return <>{children}</>;
  }

  if (isUserLoading || !user) {
    return <FullPageLoader />;
  }

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
