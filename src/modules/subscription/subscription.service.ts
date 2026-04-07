import status from "http-status";
import Stripe from "stripe";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import {
  Currency,
  PaymentGateway,
  PaymentStatus,
  PurchaseType,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../../generated/prisma/enums";

// ── Pricing table ────────────────────────────────────────────────────────────
// Amounts in smallest currency unit: cents (USD) or paisa (BDT)
const PLAN_PRICES: Record<SubscriptionPlan, { usd: number; bdt: number; label: string }> = {
  MONTHLY: { usd: 999,  bdt: 99900,  label: "CineTube Monthly" },
  YEARLY:  { usd: 7999, bdt: 799900, label: "CineTube Yearly"  },
  FREE:    { usd: 0,    bdt: 0,      label: "CineTube Free"    },
};

// Duration helpers
const addMonths = (date: Date, n: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
};

// ── Stripe — create checkout session ─────────────────────────────────────────
const createStripeSubscriptionSession = async (
  user: IRequestUser,
  plan: SubscriptionPlan
) => {
  if (plan === "FREE") {
    throw new AppError(status.BAD_REQUEST, "Cannot create a Stripe session for the free plan");
  }

  const pricing = PLAN_PRICES[plan];

  // Create a pending Purchase record so we can reconcile in the webhook
  const purchase = await prisma.purchase.create({
    data: {
      type: PurchaseType.SUBSCRIPTION,
      amount: pricing.usd / 100,
      status: PaymentStatus.PENDING,
      paymentGateway: PaymentGateway.STRIPE,
      currency: Currency.USD,
      userId: user.userId,
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: pricing.usd,
          product_data: { name: pricing.label },
        },
        quantity: 1,
      },
    ],
    metadata: {
      purchaseId: purchase.id,
      userId: user.userId,
      plan,
      type: "SUBSCRIPTION",
    },
    success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${envVars.FRONTEND_URL}/payment/cancel`,
  });

  // Store stripe session id on the purchase row
  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { stripePaymentId: session.id },
  });

  return { url: session.url, sessionId: session.id };
};



// ── Stripe webhook ────────────────────────────────────────────────────────────
const handleStripeWebhook = async (rawBody: Buffer, sig: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      envVars.STRIPE.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    throw new AppError(status.BAD_REQUEST, "Invalid Stripe webhook signature");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta    = session.metadata ?? {};

    if (meta.type === "SUBSCRIPTION") {
      await _activateSubscription(
        meta.userId as string,
        meta.plan as SubscriptionPlan,
        meta.purchaseId as string,
        session.id,
        session.customer as string | undefined
      );
    }

    if (meta.type === "PURCHASE") {
      await _completePurchase(
        meta.purchaseId as string,
        session.id,
        session.customer as string | undefined
      );
    }
  }

  return { received: true };
};

// ── GET  /subscription/me ─────────────────────────────────────────────────────
const getMySubscription = async (user: IRequestUser) => {
  const sub = await prisma.subscription.findUnique({
    where: { userId: user.userId },
  });
  return sub;
};

// ── Shared helpers ─────────────────────────────────────────────────────────────
const _activateSubscription = async (
  userId: string,
  plan: SubscriptionPlan,
  purchaseId: string,
  transactionId?: string,
  stripeCustomerId?: string
) => {
  const months = plan === "YEARLY" ? 12 : 1;
  const endDate = addMonths(new Date(), months);

  await prisma.$transaction([
    // Mark purchase SUCCESS
    prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: PaymentStatus.SUCCESS,
        transactionId,
        expiresAt: endDate,
        ...(stripeCustomerId && { stripeCustomerId }),
      },
    }),
    // Upsert subscription
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        endDate,
        status: SubscriptionStatus.ACTIVE,
      },
      update: {
        plan,
        startTime: new Date(),
        endDate,
        status: SubscriptionStatus.ACTIVE,
      },
    }),
  ]);
};

const _completePurchase = async (
  purchaseId: string,
  stripeSessionId: string,
  stripeCustomerId?: string
) => {
  await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      status: PaymentStatus.SUCCESS,
      transactionId: stripeSessionId,
      ...(stripeCustomerId && { stripeCustomerId }),
    },
  });
};

export const subscriptionService = {
  createStripeSubscriptionSession,
  handleStripeWebhook,
  getMySubscription,
};
