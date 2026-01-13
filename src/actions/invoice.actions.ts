"use server";

import { requireCoach, getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import type { Invoice, User, Booking } from "@prisma/client";

export type InvoiceWithRelations = Invoice & {
  user: User;
  booking: Booking | null;
};

/**
 * Récupérer toutes les factures du coach
 */
export async function getCoachInvoices(): Promise<
  ActionResult<InvoiceWithRelations[]>
> {
  try {
    const { coach } = await requireCoach();

    const invoices = await prisma.invoice.findMany({
      where: { coachId: coach.id },
      include: {
        user: true,
        booking: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { data: invoices, error: null };
  } catch (error) {
    console.error("[GET_COACH_INVOICES_ERROR]", error);
    return { data: null, error: "Erreur lors du chargement des factures" };
  }
}

/**
 * Générer le prochain numéro de facture
 * Format: FAC-YYYY-MM-XXXX
 */
async function generateInvoiceNumber(coachId: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // Compter les factures du coach ce mois-ci
  const count = await prisma.invoice.count({
    where: {
      coachId,
      createdAt: {
        gte: new Date(year, now.getMonth(), 1),
        lt: new Date(year, now.getMonth() + 1, 1),
      },
    },
  });

  const sequence = String(count + 1).padStart(4, "0");
  return `FAC-${year}-${month}-${sequence}`;
}

/**
 * Créer une facture (brouillon)
 */
export async function createInvoice(data: {
  bookingId: string;
  description?: string;
  clientSiret?: string;
  clientCompany?: string;
  clientAddress?: string;
}): Promise<ActionResult<Invoice>> {
  try {
    const { coach, user: coachUser } = await requireCoach();

    // Vérifier que le coach a ses infos légales
    if (!coach.siret || !coach.legalName) {
      return {
        data: null,
        error:
          "Veuillez compléter vos informations légales (SIRET, nom légal) dans votre profil avant de générer une facture.",
      };
    }

    // Vérifier que le legalName contient "EI" ou "Entrepreneur Individuel"
    if (
      !coach.legalName.includes("EI") &&
      !coach.legalName.toLowerCase().includes("entrepreneur individuel")
    ) {
      return {
        data: null,
        error:
          'Votre nom légal doit inclure "EI" ou "Entrepreneur Individuel" (obligatoire depuis mai 2022). Exemple: "Jean Dupont EI"',
      };
    }

    // Récupérer le booking
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { user: true },
    });

    if (!booking) {
      return { data: null, error: "Réservation introuvable" };
    }

    if (booking.coachId !== coach.id) {
      return { data: null, error: "Cette réservation ne vous appartient pas" };
    }

    // Vérifier qu'il n'y a pas déjà une facture pour ce booking
    const existingInvoice = await prisma.invoice.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existingInvoice) {
      return {
        data: existingInvoice,
        error: "Une facture existe déjà pour cette séance",
      };
    }

    // Générer le numéro
    const number = await generateInvoiceNumber(coach.id);

    // Créer la facture avec snapshots
    const invoice = await prisma.invoice.create({
      data: {
        number,
        coachId: coach.id,
        userId: booking.userId,
        bookingId: booking.id,

        // Snapshots coach
        coachLegalName: coach.legalName,
        coachSiret: coach.siret,
        coachAddress: coach.businessAddress ?? "",
        coachVatMention: coach.vatExempt
          ? "TVA non applicable, art. 293 B du CGI"
          : "TVA 20%",

        // Snapshots client
        clientName: booking.user.name ?? "Client",
        clientEmail: booking.user.email,
        clientAddress: data.clientAddress,
        clientSiret: data.clientSiret,
        clientCompany: data.clientCompany,

        // Montants
        description: data.description ?? "Séance de coaching",
        quantity: 1,
        unitPriceHT: booking.price,
        amountHT: booking.price,
        amountTTC: booking.price, // Même montant si franchise TVA

        status: "DRAFT",
      },
    });

    revalidatePath("/coach/invoices");
    revalidatePath("/coach/earnings");

    return { data: invoice, error: null };
  } catch (error) {
    console.error("[CREATE_INVOICE_ERROR]", error);
    return { data: null, error: "Erreur lors de la création de la facture" };
  }
}

/**
 * Finaliser une facture (passe de DRAFT à ISSUED)
 */
export async function issueInvoice(
  invoiceId: string
): Promise<ActionResult<Invoice>> {
  try {
    const { coach } = await requireCoach();

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, coachId: coach.id },
    });

    if (!invoice) {
      return { data: null, error: "Facture introuvable" };
    }

    if (invoice.status !== "DRAFT") {
      return { data: null, error: "Cette facture a déjà été émise" };
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "ISSUED" },
    });

    revalidatePath("/coach/invoices");

    return { data: updated, error: null };
  } catch (error) {
    console.error("[ISSUE_INVOICE_ERROR]", error);
    return { data: null, error: "Erreur lors de l'émission de la facture" };
  }
}

/**
 * Marquer comme envoyée
 */
export async function markInvoiceAsSent(
  invoiceId: string
): Promise<ActionResult<Invoice>> {
  try {
    const { coach } = await requireCoach();

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, coachId: coach.id },
    });

    if (!invoice) {
      return { data: null, error: "Facture introuvable" };
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    revalidatePath("/coach/invoices");

    return { data: updated, error: null };
  } catch (error) {
    console.error("[MARK_INVOICE_SENT_ERROR]", error);
    return { data: null, error: "Erreur lors de la mise à jour de la facture" };
  }
}

/**
 * Supprimer un brouillon
 */
export async function deleteInvoiceDraft(
  invoiceId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const { coach } = await requireCoach();

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, coachId: coach.id },
    });

    if (!invoice) {
      return { data: null, error: "Facture introuvable" };
    }

    if (invoice.status !== "DRAFT") {
      return { data: null, error: "Seuls les brouillons peuvent être supprimés" };
    }

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    revalidatePath("/coach/invoices");

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("[DELETE_INVOICE_DRAFT_ERROR]", error);
    return { data: null, error: "Erreur lors de la suppression" };
  }
}

/**
 * Récupérer une facture par ID
 */
export async function getInvoiceById(
  invoiceId: string
): Promise<ActionResult<InvoiceWithRelations>> {
  try {
    const { coach } = await requireCoach();

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, coachId: coach.id },
      include: {
        user: true,
        booking: true,
      },
    });

    if (!invoice) {
      return { data: null, error: "Facture introuvable" };
    }

    return { data: invoice, error: null };
  } catch (error) {
    console.error("[GET_INVOICE_BY_ID_ERROR]", error);
    return { data: null, error: "Erreur lors du chargement de la facture" };
  }
}
