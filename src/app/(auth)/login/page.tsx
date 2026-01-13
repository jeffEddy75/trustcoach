import { Suspense } from "react";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { LoadingSpinner } from "@/components/features/common/LoadingSpinner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | TrustCoach",
  description: "Connectez-vous à votre compte TrustCoach",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginForm />
    </Suspense>
  );
}
