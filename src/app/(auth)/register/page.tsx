import { RegisterForm } from "@/components/features/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription | TrustCoach",
  description: "Créez votre compte TrustCoach et commencez votre parcours",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
