"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SidebarItem } from "./Sidebar";

interface MobileNavProps {
  items: SidebarItem[];
}

export function MobileNav({ items }: MobileNavProps) {
  const pathname = usePathname();

  // Afficher max 5 items sur mobile
  const visibleItems = items.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-background border-t z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {visibleItems.map((item) => {
          // Pour les dashboards racine (/user, /coach), seule l'égalité exacte compte
          const isRootDashboard = item.href === "/user" || item.href === "/coach";
          const isActive = isRootDashboard
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-2 py-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium truncate max-w-[60px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
