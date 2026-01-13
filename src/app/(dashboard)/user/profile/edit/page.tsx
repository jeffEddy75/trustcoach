import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserProfileForm } from "@/components/features/user/UserProfileForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modifier mon profil | TrustCoach",
  description: "Modifiez vos informations personnelles",
};

export default async function EditUserProfilePage() {
  const currentUser = await getCurrentDbUser();

  if (!currentUser) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">Modifier mon profil</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos informations personnelles et votre sécurité.
        </p>
      </div>

      {/* Formulaire */}
      <UserProfileForm user={user} />
    </div>
  );
}
