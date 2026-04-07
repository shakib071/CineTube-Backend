
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
// import cron from "node-cron";
// import path from "path";
import qs from "qs";
import { envVars } from "./config/env";
import { auth } from "./lib/auth";
// import { PaymentController } from "./app/module/payment/payment.controller";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { indexRoutes } from "./routes";
import path from "path";
import { subscriptionController } from "./modules/subscription/subscription.controller";

const app: Application = express();
app.set("query parser", (str : string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views",path.resolve(process.cwd(), `src/templates`) )

// app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)

app.use(cors({
    origin : [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders : ["Content-Type", "Authorization"]
}))


app.use("/api/auth", toNodeHandler(auth))

// ── Stripe webhook — raw body MUST be before express.json() ──────────────────
// Stripe signature verification requires the raw Buffer, not the parsed body.
app.post(
  "/api/v1/subscription/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.stripeWebhook
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));



app.use("/api/v1", indexRoutes);

// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.status(201).json({
        success: true,
        message: 'Hello from Cinetube backend',
    })
});

app.use(globalErrorHandler)
app.use(notFound)


export default app;