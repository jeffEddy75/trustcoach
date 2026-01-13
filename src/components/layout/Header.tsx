"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { Menu, X, User, LogOut, Settings, LayoutDashboard, Users, Briefcase } from "lucide-react";
import { useState } from "react";

const publicNavItems = [
  { href: "/coaches", label: "Trouver un coach" },
  { href: "/about", label: "Comment ça marche" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, isCoach } = useAuth();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardHref = isCoach ? "/coach" : "/user";

  function handleLogout() {
    signOut({ redirectUrl: "/" });
  }

  return (
    <header className="nav-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-xl font-bold text-primary"
          >
            TrustCoach
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(user.name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(user.name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {/* Si l'utilisateur est coach, afficher les deux espaces */}
                  {isCoach ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/coach" className="cursor-pointer">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Espace coach
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/user" className="cursor-pointer">
                          <Users className="mr-2 h-4 w-4" />
                          Espace client
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/user" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${dashboardHref}/profile`}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${dashboardHref}/settings`}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost">Connexion</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>S&apos;inscrire</Button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <div className="h-px bg-border my-2" />
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted text-left"
                    >
                      Connexion
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground text-center"
                    >
                      S&apos;inscrire
                    </button>
                  </SignUpButton>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
