# 🎬 CineTube — Backend

A full-featured RESTful API backend for **CineTube**, a streaming platform that supports movies and series with subscription plans, pay-per-view purchases, user reviews, comments, watchlists, and admin management.

---

## 🌐 Live URLs

## 🌐 Live URLs
---

| Service | URL |
|---|---|
| 🖥️ Frontend | [https://cinetube-jet.vercel.app](https://cinetube-jet.vercel.app) |
| ⚙️ Backend API | [https://cinetube-server-psi.vercel.app](https://cinetube-server-psi.vercel.app) |
| 🖥️ ER Diagram | [https://drawsql.app/teams/shakib-hasan/diagrams/cinetube](https://drawsql.app/teams/shakib-hasan/diagrams/cinetube) |

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js (ESM, targeting Node 20) |
| Framework | Express.js v5 |
| Language | TypeScript |
| ORM | Prisma v7 (multi-file schema) |
| Database | PostgreSQL (via `pg` adapter) |
| Authentication | better-auth + custom JWT (access/refresh tokens) |
| OAuth | Google OAuth 2.0 |
| File Storage | Cloudinary (via Multer) |
| Payments | Stripe + SSLCommerz |
| Email | Nodemailer (SMTP) |
| Validation | Zod |
| Build Tool | tsup |

---

## ✨ Features

- **Authentication** — Register, login, logout, email verification, password reset, token refresh, and Google OAuth
- **Media Management** — CRUD for Movies and Series with genre, cast, director, platform, trailer, and thumbnail support
- **Pricing System** — Free and Premium content with per-title purchase (Buy/Rent) or subscription access
- **Subscriptions** — Monthly and Yearly subscription plans managed via Stripe webhooks
- **Payments** — Dual payment gateway support: Stripe (USD) and SSLCommerz (BDT)
- **Reviews & Comments** — Authenticated users can post, edit, and delete reviews and comments
- **Watchlist** — Users can add/remove media to their personal watchlist
- **Likes** — Like/unlike support on media content
- **Admin Panel** — Admin-only routes for managing users, media, and platform stats
- **Newsletter** — Newsletter subscription with email management
- **Stats** — Platform-level statistics endpoint for the admin dashboard
- **Global Error Handling** — Centralized error handler with Zod validation support
- **Query Builder** — Advanced filtering, sorting, pagination, and search utility

---

## 📁 Project Structure

```
src/
├── app.ts                   # Express app setup, CORS, middleware
├── server.ts                # Server entry point
├── config/
│   ├── env.ts               # Environment variable loader & validator
│   ├── cloudinary.config.ts # Cloudinary setup
│   ├── multer.config.ts     # Multer file upload config
│   └── stripe.config.ts     # Stripe client setup
├── lib/
│   ├── auth.ts              # better-auth config (Google OAuth, sessions)
│   └── prisma.ts            # Prisma client singleton
├── middleware/
│   ├── checkAuth.ts         # JWT auth + role-based guard
│   ├── globalErrorHandler.ts
│   ├── notFound.ts
│   └── validateRequest.ts   # Zod request validation middleware
├── modules/
│   ├── auth/                # Register, login, OAuth, password reset
│   ├── user/                # User profile management
│   ├── media/               # Movies & series CRUD
│   ├── admin/               # Admin controls
│   ├── review/              # Reviews with ratings
│   ├── comments/            # Comments on media
│   ├── watchlist/           # User watchlists
│   ├── subscription/        # Stripe subscription plans + webhook
│   ├── purchase/            # Buy/Rent with Stripe & SSLCommerz
│   ├── stats/               # Admin dashboard statistics
│   └── newsletter/          # Email newsletter subscriptions
├── routes/
│   └── index.ts             # Route aggregator
├── utils/
│   ├── QueryBuilder.ts      # Filtering, pagination, search utility
│   ├── jwt.ts               # JWT sign/verify helpers
│   ├── email.ts             # Nodemailer email sender
│   ├── cookie.ts            # Cookie helpers
│   ├── token.ts             # Token generation utilities
│   └── seed.ts              # Admin seeder script
├── interfaces/              # TypeScript interfaces
├── enum/                    # Shared enums
├── errorHelpers/            # AppError class, Zod error handler
└── shared/
    ├── catchAsync.ts        # Async error wrapper
    └── sendResponse.ts      # Standard API response helper
prisma/
├── schema/
│   ├── schema.prisma        # Datasource, generator, User, Session
│   ├── auth.prisma          # Auth models (Account, Verification)
│   ├── media.prisma         # Media, MediaType, Platform, PricingType
│   ├── subscription.prisma  # Subscription plans & status
│   ├── purchase.prisma      # Purchase, PaymentGateway, Currency
│   ├── review.prisma        # Reviews
│   ├── comment.prisma       # Comments
│   ├── like.prisma          # Likes
│   ├── watchlist.prisma     # Watchlist
│   ├── admin.prisma         # Admin model
│   └── newsletter.prisma    # Newsletter
└── migrations/              # Prisma migration history
```

---

## 🔌 API Endpoints

All routes are prefixed with `/api/v1`.

| Module | Base Path | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Register, login, OAuth, token refresh, password reset |
| User | `/api/v1/user` | Profile, update user info |
| Media | `/api/v1/media` | List, create, update, delete movies/series |
| Admin | `/api/v1/admin` | Admin-only management routes |
| Reviews | `/api/v1/reviews` | CRUD for user reviews |
| Comments | `/api/v1/comments` | CRUD for comments |
| Watchlist | `/api/v1/watchlist` | Add/remove/get watchlist items |
| Subscription | `/api/v1/subscription` | Subscribe, cancel, Stripe webhook |
| Purchase | `/api/v1/purchase` | Buy/rent individual media |
| Stats | `/api/v1/stats` | Platform statistics (admin) |
| Newsletter | `/api/v1/newsletter` | Subscribe/unsubscribe newsletter |
| better-auth | `/api/auth/*` | better-auth managed OAuth routes |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# better-auth
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=7d
BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=1d

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/callback/google

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (SMTP)
EMAIL_SENDER_SMTP_HOST=smtp.gmail.com
EMAIL_SENDER_SMTP_PORT=587
EMAIL_SENDER_SMTP_USER=your_email@gmail.com
EMAIL_SENDER_SMTP_PASS=your_app_password
EMAIL_SENDER_SMTP_FROM="CineTube <your_email@gmail.com>"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SSLCommerz
SSLCZ_STORE_ID=your_store_id
SSLCZ_STORE_PASSWD=your_store_password

# Default Admin
ADMIN_NAME=your Admin name for seeding
ADMIN_EMAIL= your Admin email for seeding
ADMIN_PASSWORD= your Admin password for seeding
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL database
- Cloudinary account
- Stripe account
- SSLCommerz account (for BDT payments)
- Google OAuth credentials
- SMTP email credentials

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/shakib071/CineTube-Backend.git
cd CineTube-Backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in all the values in .env

# 4. Run database migrations
npm run migrate

# 5. Generate Prisma client
npm run generate

# 6. Seed the admin user
npm run seed:admin

# 7. Start the development server
npm run dev
```

The server will start on `http://localhost:5000`.

---

## 📦 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload (`tsx watch`) |
| `npm run build` | Build for production (Prisma generate + tsup) |
| `npm start` | Start production server (`node dist/server.js`) |
| `npm run migrate` | Run Prisma migrations |
| `npm run generate` | Generate Prisma client |
| `npm run seed:admin` | Seed the default admin user |
| `npm run studio` | Open Prisma Studio |
| `npm run push` | Push schema changes directly to DB (no migration) |
| `npm run stripe:webhook` | Forward Stripe webhook to localhost |
| `npm run lint` | Run ESLint |

---

## 🗄️ Database Models

| Model | Description |
|---|---|
| `User` | Core user with role (`USER`/`ADMIN`) and status |
| `Session` / `Account` | Managed by better-auth |
| `Media` | Movies and series with type, platform, pricing |
| `Review` | Star ratings and text reviews per user per media |
| `Comment` | User comments on media |
| `Like` | Likes on media |
| `Watchlist` | Personal watchlist entries |
| `Subscription` | Monthly/Yearly subscription with status tracking |
| `Purchase` | Buy or Rent transactions via Stripe or SSLCommerz |
| `Admin` | Admin-specific profile linked to a User |
| `Newsletter` | Email newsletter subscriptions |

---

## 🔐 Authentication Flow

1. **Standard** — Email/password registration with email OTP verification
2. **Google OAuth** — `/api/v1/auth/login/google` → redirects through Google → `/api/v1/auth/google/success`
3. **Tokens** — Access token (short-lived) + Refresh token (long-lived, stored in HTTP-only cookie)
4. **Password Reset** — OTP sent to email, verified before allowing password change

---

## 💳 Payment Flow

### Stripe (USD)
- Subscription plans and USD purchases go through Stripe Checkout
- Webhook endpoint: `POST /api/v1/subscription/webhook`
- Locally test with: `npm run stripe:webhook`

### SSLCommerz (BDT)
- Handles BDT-denominated purchases for Bangladeshi users
- Configured via `SSLCZ_STORE_ID` and `SSLCZ_STORE_PASSWD`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---


