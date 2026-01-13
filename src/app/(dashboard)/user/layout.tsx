"use client";

import { Sidebar, type SidebarItem } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageSquare,
  User,
  Settings,
} from "lucide-react";

const userNavItems: SidebarItem[] = [
  { href: "/user", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/user/bookings", label: "Mes réservations", icon: Calendar },
  { href: "/user/sessions", label: "Mes séances", icon: FileText },
  { href: "/user/messages", label: "Messages", icon: MessageSquare },
  { href: "/user/profile", label: "Mon profil", icon: User },
  { href: "/user/settings", label: "Paramètres", icon: Settings },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar items={userNavItems} title="Mon espace" />
      <main className="flex-1 lg:pl-64">
        <div className="py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-6">{children}</div>
      </main>
      <MobileNav items={userNavItems} />
    </div>
  );
}
