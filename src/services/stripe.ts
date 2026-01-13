import Stripe from "stripe";

/**
 * Mode Stripe désactivé si pas de clé configurée
 * Permet de tester l'app sans paiement réel
 */
export const STRIPE_ENABLED =
  !!process.env.STRIPE_SECRET_KEY &&
  !process.env.STRIPE_SECRET_KEY.endsWith("...");

// Créer le client Stripe seulement si configuré
export const stripe = STRIPE_ENABLED
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  : null;

/**
 * Configuration des prix par défaut
 */
export const STRIPE_CONFIG = {
  currency: "eur",
  platformFeePercent: parseInt(process.env.STRIPE_PLATFORM_FEE_PERCENT || "15", 10),
};

/**
 * Crée une session Stripe Checkout pour une réservation
 * Retourne null si Stripe n'est pas configuré (mode test)
 */
export async function createCheckoutSession({
  bookingId,
  priceInCents,
  currency = "EUR",
  coachName,
  sessionDate,
  duration,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  bookingId: string;
  priceInCents: number;
  currency?: string;
  coachName: string;
  sessionDate: string;
  duration: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) {
    console.log("[STRIPE] Mode test - pas de checkout créé");
    return null;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Séance de coaching avec ${coachName}`,
            description: `${sessionDate} - ${duration} minutes`,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId,
      type: "coaching_session",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

/**
 * Récupère une session Checkout par ID
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null;
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Crée un remboursement pour un paiement
 */
export async function createRefund({
  paymentIntentId,
  amount,
  reason = "requested_by_customer",
}: {
  paymentIntentId: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}): Promise<Stripe.Refund | null> {
  if (!stripe) {
    console.log("[STRIPE] Mode test - pas de remboursement créé");
    return null;
  }

  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason,
  };

  if (amount) {
    refundParams.amount = amount;
  }

  return stripe.refunds.create(refundParams);
}

/**
 * Vérifie la signature d'un webhook Stripe
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  if (!stripe) return null;
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Types d'événements Stripe que nous gérons
 */
export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
] as const;

export type HandledEvent = (typeof HANDLED_EVENTS)[number];
