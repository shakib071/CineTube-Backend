import { SubscriptionPlan } from "../../../generated/prisma/enums";

export interface ICreateStripeSubscriptionPayload {
  plan: SubscriptionPlan; // MONTHLY | YEARLY
}

export interface ICreateSSLSubscriptionPayload {
  plan: SubscriptionPlan;
}
