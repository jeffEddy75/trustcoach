"use server";

import { compare, hash } from "bcryptjs";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  userProfileSchema,
  changePasswordSchema,
  type UserProfileInput,
  type ChangePasswordInput,
} from "@/validations/user.schema";
import type { ActionResult } from "@/types";
import type { User } from "@prisma/client";

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export async function getUserProfileAction(): Promise<ActionResult<User>> {
  try {
    const user = await requireDbUser();
    return { data: user, error: null };
  } catch (error) {
    console.error("[GET_USER_PROFILE_ERROR]", error);
    return { data: null, error: "Erreur lors de la récupération du profil" };
  }
}

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateUserProfileAction(
  data: UserProfileInput
): Promise<ActionResult<User>> {
  try {
    const currentUser = await requireDbUser();

    // Valider les données
    const validated = userProfileSchema.parse(data);

    // Mettre à jour le profil
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: validated.name,
      },
    });

    return { data: updatedUser, error: null };
  } catch (error) {
    console.error("[UPDATE_USER_PROFILE_ERROR]", error);
    return { data: null, error: "Erreur lors de la mise à jour du profil" };
  }
}

/**
 * Changer le mot de passe
 * Note: Avec Clerk, cette fonction peut être désactivée car Clerk gère les mots de passe
 */
export async function changePasswordAction(
  data: ChangePasswordInput
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const currentUser = await requireDbUser();

    // Valider les données
    const validated = changePasswordSchema.parse(data);

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { password: true },
    });

    if (!user) {
      return { data: null, error: "Utilisateur non trouvé" };
    }

    // Si l'utilisateur n'a pas de mot de passe (OAuth/Clerk), il ne peut pas changer
    if (!user.password) {
      return {
        data: null,
        error: "Vous utilisez une connexion sociale. Le mot de passe ne peut pas être modifié ici.",
      };
    }

    // Vérifier le mot de passe actuel
    const isValid = await compare(validated.currentPassword, user.password);
    if (!isValid) {
      return { data: null, error: "Mot de passe actuel incorrect" };
    }

    // Hasher et mettre à jour le nouveau mot de passe
    const hashedPassword = await hash(validated.newPassword, 12);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("[CHANGE_PASSWORD_ERROR]", error);
    return { data: null, error: "Erreur lors du changement de mot de passe" };
  }
}

/**
 * Supprimer le compte utilisateur
 */
export async function deleteAccountAction(): Promise<ActionResult<{ success: boolean }>> {
  try {
    const currentUser = await requireDbUser();

    // Supprimer l'utilisateur (cascade supprime les relations)
    await prisma.user.delete({
      where: { id: currentUser.id },
    });

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("[DELETE_ACCOUNT_ERROR]", error);
    return { data: null, error: "Erreur lors de la suppression du compte" };
  }
}
