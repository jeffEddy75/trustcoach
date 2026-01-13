import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CoachProfileForm } from "@/components/features/coaches/CoachProfileForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modifier mon profil | TrustCoach",
  description: "Modifiez votre profil de coach",
};

export default async function EditCoachProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const coach = await prisma.coach.findUnique({
    where: { userId: session.user.id },
  });

  if (!coach) {
    redirect("/user");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">Modifier mon profil</h1>
        <p className="text-muted-foreground mt-1">
          Ces informations seront visibles sur votre profil public.
        </p>
      </div>

      {/* Formulaire */}
      <CoachProfileForm coach={coach} />
    </div>
  );
}
