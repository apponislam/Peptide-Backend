# Peptide Backend

A TypeScript Node.js backend for a peptide ecommerce platform. This repository uses Express, Prisma, PostgreSQL, Stripe, Resend email, and ShipStation integrations.

## Key Features

- REST API built with Express and TypeScript
- PostgreSQL database access via Prisma
- Authentication using JWT access and refresh tokens
- Stripe payment flow with webhook support
- Resend email integration for transactional emails
- ShipStation integration for shipping order creation and tracking
- Static file serving and file upload support
- Admin bootstrapping and product seeding on startup

## Tech Stack

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Stripe
- Resend
- ShipStation
- bcryptjs
- zod

## Prerequisites

- Node.js 18+ / 20+
- npm
- PostgreSQL database
- Stripe account / API keys
- Resend account / API key
- ShipStation API credentials

## Getting Started

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update `.env` with your values.

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Apply database migrations or push schema changes:

```bash
npx prisma migrate deploy
```

If you are developing locally and want to create or update the database from the schema, use:

```bash
npx prisma migrate dev --name init
```

6. Start the development server:

```bash
npm run dev
```

7. Build for production:

```bash
npm run build
npm start
```

## Environment Variables

The app loads configuration from `.env` using `src/config/index.ts`. Below are the variables required by the project.

```env
NODE_ENV=development
PORT=5049
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=7d

BCRYPT_SALT_ROUNDS=12

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

FRONTEND_URL=http://localhost:3000

ADMIN_NAME=Jacob Vlance
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=master123

RESEND_API_KEY=key_xxx
RESEND_EMAIL=no-reply@example.com

SHIPSTATION_API_KEY=your_shipstation_api_key
SHIPSTATION_API_SECRET=your_shipstation_api_secret
```

### Notes

- `DATABASE_URL` must point to a PostgreSQL database.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` are used to create the initial admin user during startup if no admin exists.
- The server automatically seeds products and creates an admin user when it starts.
- `STRIPE_WEBHOOK_SECRET` is required for Stripe webhook request validation.

## Project Structure

- `src/server.ts` — application bootstrap, database connection, graceful shutdown
- `src/app.ts` — Express app configuration, middleware, static files, routes
- `src/config/index.ts` — environment configuration loader
- `src/lib/prisma.ts` — Prisma client setup
- `src/app/modules/` — feature modules for auth, orders, payment, products, referrals, admin, ShipStation
- `src/app/script/seed.ts` — admin seeding logic
- `src/app/script/products.ts` — initial product seed data
- `src/errors/` — error handling middleware
- `src/utils/` — helper utilities and email templates
- `uploads/` — local file upload storage for COAs and product images
- `public/` — static front-end assets

## Running the App

- Development: `npm run dev`
- Production build: `npm run build`
- Start built server: `npm start`

The API is mounted under `/api`, and the Stripe webhook route is exposed at `/api/payment/webhook` via raw JSON body parsing.

## API Endpoints

Base URL: `http://localhost:5049/api`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh-token`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/update-referral-code`
- `GET /auth/check-referral-code/:code`
- `POST /auth/forgot-password`
- `POST /auth/verify-otp`
- `POST /auth/reset-password`
- `GET /auth/my-referrals`
- `PATCH /auth/update-profile`
- `PATCH /auth/change-password`
- `POST /auth/admin/login`

### Products

- `GET /products`
- `GET /products/:id`
- `POST /products/get-by-ids`
- `GET /products/admin` (auth required)
- `GET /products/admin/:id` (auth required)
- `POST /products` (auth required)
- `PATCH /products/:id` (auth required)
- `PATCH /products/:id/remove` (auth required)
- `DELETE /products/:id` (auth required)
- `GET /products/admin/deleted` (auth required)
- `PATCH /products/admin/restore/:id` (auth required)
- `PATCH /products/admin/toggle-stock/:id` (auth required)

### Orders

- `GET /orders/:orderId` (auth required)
- `GET /orders` (auth required)

### Order Previews

- `POST /order-previews` (auth required)
- `GET /order-previews/:previewId` (auth required)
- `DELETE /order-previews/:previewId` (auth required)

### Payment

- `POST /payment/checkout`
- `POST /payment/create-payment-intent`
- `POST /payment/refund`
- `GET /payment/session/:sessionId`
- `POST /payment/webhook`

### ShipStation

- `POST /shipment/order/:orderId`
- `GET /shipment/rates/:orderId`
- `POST /shipment/label/:orderId`
- `GET /shipment/orders`
- `PUT /shipment/tracking/:orderId`
- `POST /shipment/ship/:orderId`
- `GET /shipment/carriers`
- `GET /shipment/warehouses`
- `PUT /shipment/delivered/:orderId`
- `POST /shipment/order/:orderId/cancel`

## Stripe CLI Webhook Forwarding

Use the Stripe CLI to forward webhook events from Stripe to your local webhook endpoint:

```bash
stripe listen --forward-to http://localhost:5049/api/payment/webhook
```

After running this command, Stripe CLI will print a webhook signing secret. Copy that value into `STRIPE_WEBHOOK_SECRET` in your `.env`.

## Deployment

1. Build the app: `npm run build`
2. Ensure `.env` is configured in the deployment environment
3. Run `npm start`

## Helpful Tips

- If Prisma fails to connect, confirm `DATABASE_URL` is correct and the database is running.
- Make sure Stripe and ShipStation credentials are valid before creating orders or shipments.
- Adjust CORS origins in `src/app.ts` to match your frontend domains.

## License

This repository does not define a license in `package.json`; add one if you plan to share it publicly.
