import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { subscriptionService } from "./subscription.service";

// POST /api/v1/subscription/stripe
const createStripeSession = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.createStripeSubscriptionSession(
    req.user,
    req.body.plan
  );
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Stripe checkout session created",
    data: result,
  });
});



// POST /api/v1/subscription/webhook  (Stripe webhook — raw body required)
const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const result = await subscriptionService.handleStripeWebhook(req.body as Buffer, sig);
  res.json(result);
});

// GET /api/v1/subscription/me
const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getMySubscription(req.user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Subscription fetched successfully",
    data: result,
  });
});

export const subscriptionController = {
  createStripeSession,
  stripeWebhook,
  getMySubscription,
};
