import status from "http-status";
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
} from "../../../generated/prisma/enums";
import { ICreatePurchasePayload } from "./purchase.validation";

// Rent expires after 48 hours
const RENT_DURATION_MS = 48 * 60 * 60 * 1000;

const SSLCZ_SANDBOX_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
const SSLCZ_LIVE_URL    = "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

// ── POST /purchase/:mediaId ────────────────────────────────────────────────────
const createPurchase = async (
  user: IRequestUser,
  mediaId: string,
  payload: ICreatePurchasePayload
) => {

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.userId },
  });

  if (
    subscription &&
    subscription.status === "ACTIVE" &&
    subscription.endDate > new Date()
  ) {
    throw new AppError(
      status.CONFLICT,
      "You already have an active subscription. No need to buy or rent."
    );
  }
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new AppError(status.NOT_FOUND, "Media not found");

  if (media.pricingType === "FREE") {
    throw new AppError(status.BAD_REQUEST, "This title is free — no purchase required");
  }

  if (!media.price || media.price <= 0) {
    throw new AppError(status.BAD_REQUEST, "This title has no price set");
  }

  // Prevent duplicate active purchase
  const existingActive = await prisma.purchase.findFirst({
    where: {
      userId: user.userId,
      mediaId,
      status: PaymentStatus.SUCCESS,
      type: payload.type as PurchaseType,
      OR: [
        { expiresAt: null },                           // BUY (no expiry)
        { expiresAt: { gt: new Date() } },             // RENT still valid
      ],
    },
  });
  if (existingActive) {
    throw new AppError(
      status.CONFLICT,
      payload.type === "RENT"
        ? "You already have an active rental for this title"
        : "You have already purchased this title"
    );
  }

  // Amounts: store in USD for Stripe, BDT for SSLCommerz
  // const amountUsd = media.price;          // e.g. 4.99
  // const amountBdt = media.price * 120;    // rough BDT equivalent
  
  // Determine price based on type
    const amountUsd = payload.type === "RENT" ? media.price * 0.4 : media.price;
    const amountBdt = payload.type === "RENT" ? media.price * 0.4 * 120 : media.price * 120;

  if (payload.paymentGateway === "STRIPE") {
    return _createStripePurchaseSession(user, media, mediaId, payload.type as PurchaseType, amountUsd);
  } else {
    return _createSSLPurchaseSession(user, media, mediaId, payload.type as PurchaseType, amountBdt);
  }
};

// ── Stripe ────────────────────────────────────────────────────────────────────
const _createStripePurchaseSession = async (
  user: IRequestUser,
  media: { title: string },
  mediaId: string,
  type: PurchaseType,
  amountUsd: number
) => {
  const expiresAt = type === "RENT" ? new Date(Date.now() + RENT_DURATION_MS) : null;

  const purchase = await prisma.purchase.create({
    data: {
      type,
      amount: amountUsd,
      status: PaymentStatus.PENDING,
      paymentGateway: PaymentGateway.STRIPE,
      currency: Currency.USD,
      userId: user.userId,
      mediaId,
      ...(expiresAt && { expiresAt }),
    },
  });

  const label = `${type === "RENT" ? "Rent" : "Buy"}: ${media.title}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(amountUsd * 100),
          product_data: { name: label },
        },
        quantity: 1,
      },
    ],
    metadata: {
      purchaseId: purchase.id,
      userId: user.userId,
      mediaId,
      type: "PURCHASE",
      purchaseType: type,
    },
    success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${envVars.FRONTEND_URL}/payment/cancel`,
  });

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { stripePaymentId: session.id },
  });

  return { url: session.url, sessionId: session.id };
};

// ── SSLCommerz ────────────────────────────────────────────────────────────────
const _createSSLPurchaseSession = async (
  user: IRequestUser,
  media: { title: string },
  mediaId: string,
  type: PurchaseType,
  amountBdt: number
) => {
  const expiresAt = type === "RENT" ? new Date(Date.now() + RENT_DURATION_MS) : null;

  const purchase = await prisma.purchase.create({
    data: {
      type,
      amount: amountBdt / 100,
      status: PaymentStatus.PENDING,
      paymentGateway: PaymentGateway.SSLCOMMERZ,
      currency: Currency.BDT,
      userId: user.userId,
      mediaId,
      ...(expiresAt && { expiresAt }),
    },
  });

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  if (!dbUser) throw new AppError(status.NOT_FOUND, "User not found");

  const params = new URLSearchParams({
    store_id:         process.env.SSLCZ_STORE_ID    ?? "",
    store_passwd:     process.env.SSLCZ_STORE_PASSWD ?? "",
    total_amount:     (amountBdt / 100).toFixed(2),
    currency:         "BDT",
    tran_id:          purchase.id,
    success_url:      `${envVars.BETTER_AUTH_URL}/api/v1/purchase/ssl/success`,
    fail_url:         `${envVars.BETTER_AUTH_URL}/api/v1/purchase/ssl/fail`,
    cancel_url:       `${envVars.BETTER_AUTH_URL}/api/v1/purchase/ssl/cancel`,
    ipn_url:          `${envVars.BETTER_AUTH_URL}/api/v1/purchase/ssl/ipn`,
    product_name:     `${type === "RENT" ? "Rent" : "Buy"}: ${media.title}`,
    product_category: "media",
    product_profile:  "general",
    cus_name:         dbUser.name,
    cus_email:        dbUser.email,
    cus_add1:         "Dhaka",
    cus_city:         "Dhaka",
    cus_country:      "Bangladesh",
    cus_phone:        "01700000000",
    shipping_method:  "NO",
    num_of_item:      "1",
    value_a:          purchase.id,
    value_b:          type,
    value_c:          user.userId,
  });

  const isLive = envVars.NODE_ENV === "production";
  const sslUrl = isLive ? SSLCZ_LIVE_URL : SSLCZ_SANDBOX_URL;

  const response = await fetch(sslUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = (await response.json()) as { status: string; GatewayPageURL?: string };

  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: PaymentStatus.FAILED },
    });
    throw new AppError(status.BAD_GATEWAY, "SSLCommerz payment initiation failed");
  }

  return { url: data.GatewayPageURL };
};



// ── GET /purchase ─────────────────────────────────────────────────────────────
const getPurchaseHistory = async (user: IRequestUser) => {
  const purchases = await prisma.purchase.findMany({
    where: { userId: user.userId , status: { not: PaymentStatus.PENDING } },
    orderBy: { createdAt: "desc" },
    include: {
      media: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          type: true,
          genre: true,
        },
      },
    },
  });
  return purchases;
};

// ── Helper: check if a user has active access to a media ─────────────────────
const hasActiveAccess = async (userId: string, mediaId: string): Promise<boolean> => {



  
  const sub = await prisma.subscription.findUnique({ where: { userId } });
      // Auto mark expired
  if (sub && sub.status === "ACTIVE" && sub.endDate < new Date()) {
    await prisma.subscription.update({
      where: { userId },
      data: { status: "EXPIRED" }
    });
  }

  // Check active subscription (gives access to all PREMIUM content)

  if (sub && sub.status === "ACTIVE" && sub.endDate > new Date()) return true;

  // Check individual purchase
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      mediaId,
      status: PaymentStatus.SUCCESS,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });


  return !!purchase;
};

export const purchaseService = {
  createPurchase,
  getPurchaseHistory,
  hasActiveAccess,
};
