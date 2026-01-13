import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { Pencil } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil | TrustCoach",
  description: "Gérez votre profil TrustCoach",
};

export default async function UserProfilePage() {
  const currentUser = await getCurrentDbUser();

  if (!currentUser) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      organizations: {
        include: { organization: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Mon profil</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos informations personnelles.
          </p>
        </div>
        <Button asChild>
          <Link href="/user/profile/edit">
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      {/* Profil card */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="font-heading">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(user.name || user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.name || "—"}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-2">
                {user.role === "USER"
                  ? "Utilisateur"
                  : user.role === "COACH"
                    ? "Coach"
                    : "Admin"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membre depuis</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organisation B2B */}
      {user.organizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Mon entreprise</CardTitle>
          </CardHeader>
          <CardContent>
            {user.organizations.map((membership) => (
              <div
                key={membership.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{membership.organization.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {membership.role === "ADMIN"
                      ? "Administrateur"
                      : membership.role === "MANAGER"
                        ? "Manager"
                        : "Collaborateur"}
                  </p>
                </div>
                {membership.sessionsAllowed && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Séances utilisées
                    </p>
                    <p className="font-medium">
                      {membership.sessionsUsed} / {membership.sessionsAllowed}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
