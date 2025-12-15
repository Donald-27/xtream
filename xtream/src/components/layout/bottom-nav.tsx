
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Users, User, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/play", label: "Play", icon: Sparkles },
  { href: "/connect", label: "Connect", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-secondary border-t border-border/80 z-50">
      <nav className="flex items-center justify-around h-full max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200 w-16 text-center",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6 transition-colors", isActive ? "gradient-icon-active" : "text-inherit")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
