import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent, HANDLED_EVENTS } from "@/services/stripe";
import { upgradeConversationToActiveAction } from "@/actions/messaging.actions";
import type Stripe from "stripe";

/**
 * Webhook Stripe pour traiter les événements de paiement
 *
 * Événements gérés :
 * - checkout.session.completed : Paiement réussi
 * - payment_intent.payment_failed : Échec de paiement
 * - charge.refunded : Remboursement effectué
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[STRIPE_WEBHOOK] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[STRIPE_WEBHOOK] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[STRIPE_WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Vérifier que c'est un événement que nous gérons
  if (!HANDLED_EVENTS.includes(event.type as typeof HANDLED_EVENTS[number])) {
    console.log(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`);
    return NextResponse.json({ received: true });
  }

  console.log(`[STRIPE_WEBHOOK] Processing event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`[STRIPE_WEBHOOK] No handler for event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK] Error processing event:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

/**
 * Gérer un checkout réussi
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    console.error("[STRIPE_WEBHOOK] No bookingId in session metadata");
    return;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      coach: { include: { user: true } },
    },
  });

  if (!booking) {
    console.error(`[STRIPE_WEBHOOK] Booking not found: ${bookingId}`);
    return;
  }

  // Mettre à jour le statut de la réservation
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      paidAt: new Date(),
    },
  });

  console.log(`[STRIPE_WEBHOOK] Booking ${bookingId} confirmed after payment`);

  // Upgrader la conversation en ACTIVE si elle existe
  const upgradeResult = await upgradeConversationToActiveAction(
    booking.userId,
    booking.coachId
  );
  if (upgradeResult.data) {
    console.log(`[STRIPE_WEBHOOK] Conversation upgraded to ACTIVE for user ${booking.userId}`);
  }

  // TODO: Envoyer email de confirmation au client et au coach
  // await sendBookingConfirmationEmail(booking);
}

/**
 * Gérer un échec de paiement
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    console.log("[STRIPE_WEBHOOK] No bookingId in payment intent metadata");
    return;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "PAYMENT_FAILED",
    },
  });

  console.log(`[STRIPE_WEBHOOK] Booking ${bookingId} marked as payment failed`);
}

/**
 * Gérer un remboursement
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    console.log("[STRIPE_WEBHOOK] No payment_intent in charge");
    return;
  }

  // Trouver la réservation par payment intent
  const booking = await prisma.booking.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!booking) {
    console.log(`[STRIPE_WEBHOOK] No booking found for payment intent: ${paymentIntentId}`);
    return;
  }

  // Vérifier si c'est un remboursement total ou partiel
  const isFullRefund = charge.amount_refunded === charge.amount;

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
      refundedAt: new Date(),
    },
  });

  console.log(
    `[STRIPE_WEBHOOK] Booking ${booking.id} ${isFullRefund ? "fully" : "partially"} refunded`
  );
}
