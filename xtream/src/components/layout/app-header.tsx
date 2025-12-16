'use client';

import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/icons/logo";
import { Search, Bell, Video, LogOut } from "lucide-react";
import Link from "next/link";
import { useSupabaseClient } from "@/lib/supabase/provider";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
      <Link href="/" passHref>
        <div className="flex items-center gap-2 cursor-pointer">
          <LogoIcon width={40} height={40} />
          <span className="text-2xl font-headline gradient-text">
            Xtream
          </span>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign Out</span>
        </Button>
        <Link href="/go-live" passHref>
          <Button variant="hot" className="hidden sm:flex" size="sm">
            <Video className="mr-2 h-4 w-4" />
            Go Live
          </Button>
        </Link>
        <Link href="/go-live" passHref>
          <Button variant="hot" size="icon" className="sm:hidden">
            <Video className="h-5 w-5" />
            <span className="sr-only">Go Live</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
