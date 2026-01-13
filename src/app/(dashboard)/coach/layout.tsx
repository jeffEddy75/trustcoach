"use client";

import { Sidebar, type SidebarItem } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  User,
  Settings,
  Wallet,
} from "lucide-react";

const coachNavItems: SidebarItem[] = [
  { href: "/coach", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/coach/calendar", label: "Mon calendrier", icon: Calendar },
  { href: "/coach/clients", label: "Mes clients", icon: Users },
  { href: "/coach/messages", label: "Messages", icon: MessageSquare },
  { href: "/coach/earnings", label: "Mes revenus", icon: Wallet },
  { href: "/coach/profile", label: "Mon profil", icon: User },
  { href: "/coach/settings", label: "Paramètres", icon: Settings },
];

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar items={coachNavItems} title="Espace coach" />
      <main className="flex-1 lg:pl-64">
        <div className="py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-6">{children}</div>
      </main>
      <MobileNav items={coachNavItems} />
    </div>
  );
}
