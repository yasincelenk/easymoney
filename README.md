# Signloop – Contract Lifecycle Management SaaS

Signloop is a multi-tenant contract lifecycle management platform built with Next.js 14, Prisma and PostgreSQL. It implements end-to-end flows for template driven drafting, collaborative versioning, signing and billing.

## Features

- **Multi-tenant & RBAC** – Users belong to organisations with OWNER/ADMIN/MEMBER/VIEWER roles and per-account isolation.
- **Templates & Drafting** – Filterable template gallery, stepper-driven contract creation, AI clause suggestions (stub).
- **Contract Workspace** – Version history with diff viewer, activity log, party & signature tracking, manual file uploads.
- **E-sign providers** – Provider selector with stubs for MANUAL, EGüven and TURKTRUST plus webhook endpoints.
- **Billing** – Stripe checkout/webhook stubs with plan enforcement for FREE / STARTER / PRO tiers.
- **Internationalisation** – Turkish (default) and English locales via next-intl.
- **Testing** – Vitest unit tests and Playwright skeleton for end-to-end coverage.

## Prerequisites

- Node.js 18.18+ (or 20+)
- pnpm 8+
- PostgreSQL 15+
- Stripe CLI (optional for local webhook forwarding)

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Environment configuration** – copy `.env.example` to `.env` and update values.
   ```bash
   cp .env.example .env
   ```
3. **Database migrations & seed**
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```
4. **Start development server**
   ```bash
   pnpm dev
   ```
   The application is served at [http://localhost:3000](http://localhost:3000).

### Stripe Webhooks (optional)

Forward test events to the local webhook handler with the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## File Storage

Uploaded PDFs are saved to the local path defined by `STORAGE_DIR` (defaults to `./public/storage`). Replace `lib/storage.ts` with an object-storage implementation (S3, GCS, etc.) for production deployments.

## Testing

- Unit tests (Vitest):
  ```bash
  pnpm test
  ```
- Playwright E2E tests live under `tests/e2e` and are currently marked `skip` pending full browser automation.

## Deployment

- **Frontend**: Deploy the Next.js app on Vercel (ensure environment variables and Prisma generate step are configured).
- **Database**: Host PostgreSQL on Railway, Supabase, Fly.io or similar.
- **Environment Variables**: replicate `.env` values in the deployment platform (NEXTAUTH, Stripe keys, Google OAuth, etc.).
- **Prisma**: Run `prisma migrate deploy` on deploy to apply schema changes.

## Security Notes

- Strict org isolation by `accountId` across all queries and mutations.
- RBAC helpers ensure role-appropriate access to sensitive actions (billing, team management, signing).
- Rate limiting utilities are provided for auth and webhook endpoints.
- Audit logs capture authentication, contract and billing activities for compliance.
- Personally identifiable information is minimised to essential contract metadata.

## Extending

- Implement real e-sign adapters inside `app/api/webhooks/esign/[provider]/route.ts` and server actions for provider specific flows.
- Replace the AI stub in `lib/ai.ts` with calls to the preferred LLM service.
- Hook analytics by toggling the `configureAnalytics` helper in `lib/analytics.ts`.

## Scripts

- `pnpm dev` – Next.js development server
- `pnpm build` – Production build
- `pnpm start` – Start production server
- `pnpm lint` – ESLint checks
- `pnpm test` – Vitest unit tests
- `pnpm test:e2e` – Playwright (requires running `pnpm dev` in parallel)

Enjoy building on top of Signloop!
