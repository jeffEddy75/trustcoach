"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/validations/auth.schema";
import type { ActionResult } from "@/types";
import { AuthError } from "next-auth";

export async function loginAction(
  formData: FormData
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    console.log("[LOGIN] Attempting login for:", rawData.email);

    const validated = loginSchema.parse(rawData);

    const result = await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    console.log("[LOGIN] SignIn result:", result);

    return { data: { success: true }, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("[LOGIN_AUTH_ERROR]", error.type, error.message);
      return { data: null, error: "Email ou mot de passe incorrect" };
    }
    console.error("[LOGIN_ERROR]", error);
    return { data: null, error: "Erreur lors de la connexion" };
  }
}

export async function registerAction(
  formData: FormData
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validated = registerSchema.parse(rawData);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { data: null, error: "Cet email est déjà utilisé" };
    }

    // Créer l'utilisateur
    const hashedPassword = await hash(validated.password, 12);

    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
      },
    });

    // Connecter automatiquement après inscription
    await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return { data: null, error: "Erreur lors de l'inscription" };
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false });
}

export async function loginWithGoogleAction(): Promise<void> {
  await signIn("google", { redirectTo: "/user" });
}
