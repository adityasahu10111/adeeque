# Phase 1 — Project Setup & Infrastructure
## Complete Technical Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Dependencies](#4-dependencies)
5. [Environment Variables](#5-environment-variables)
6. [Authentication — Clerk](#6-authentication--clerk)
7. [Database — Drizzle + NeonDB](#7-database--drizzle--neondb)
8. [Background Jobs — BullMQ](#8-background-jobs--bullmq)
9. [Design System](#9-design-system)
10. [NPM Scripts](#10-npm-scripts)
11. [How to Run Locally](#11-how-to-run-locally)
12. [What's Next (Phase 2)](#12-whats-next-phase-2)

---

## 1. Project Overview

**Adeeque** is a Social Copilot SaaS — a multi-platform post scheduler, publisher, and AI-powered auto-reply engine. Phase 1 bootstraps the entire infrastructure layer before any user-facing features are built.

| Attribute | Value |
|---|---|
| Framework | Next.js 16.2.7 (App Router) |
| Runtime | React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Package Manager | npm |

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | Next.js 16 (App Router) | Full-stack React framework |
| Authentication | Clerk | User auth, OAuth, session management |
| Database | NeonDB (PostgreSQL) + Drizzle ORM | Serverless Postgres with type-safe queries |
| Background Jobs | BullMQ | Queue-based job processing (scheduling, publishing) |
| AI | Groq SDK | Fast LLM inference for auto-reply generation |
| File Storage | @imagekit/next | Media upload, CDN, image optimization |
| Payments | Stripe | Subscription billing |
| UI Components | shadcn/ui (New York style) | Accessible, unstyled-base component library |
| State Management | @tanstack/react-query v5 | Server state, caching, background refetch |
| Styling Utilities | Tailwind CSS v4 + tailwind-merge + clsx | Utility-first CSS with conflict resolution |
| Icons | lucide-react | Icon library |
| Dates | date-fns v4 | Date formatting and arithmetic |
| Themes | next-themes | Dark/light mode toggle support |
| Webhook Verification | svix | Verifies Clerk webhook signatures |

---

## 3. Directory Structure

```
adeeque/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/
│   │   │   └── page.tsx              # Clerk SignIn page
│   │   └── sign-up/[[...sign-up]]/
│   │       └── page.tsx              # Clerk SignUp page
│   ├── api/
│   │   └── webhooks/
│   │       └── clerk/
│   │           └── route.ts          # Clerk webhook handler (user sync)
│   ├── globals.css                   # Design tokens + Tailwind v4 theme
│   ├── layout.tsx                    # Root layout: ClerkProvider + fonts
│   └── page.tsx                      # Home page (placeholder)
│
├── components/
│   └── ui/                           # shadcn/ui components (11 total)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── toggle.tsx
│
├── lib/
│   ├── bullmq/
│   │   ├── queues.ts                 # 4 BullMQ queue definitions
│   │   ├── worker-runner.ts          # Worker process entry point
│   │   └── workers/
│   │       ├── auto-reply.ts         # Auto-reply worker stub
│   │       ├── comment-poller.ts     # Comment polling worker stub
│   │       ├── media-processor.ts    # Media processing worker stub
│   │       └── post-publisher.ts     # Post publishing worker stub
│   ├── db/
│   │   ├── index.ts                  # Drizzle client (NeonDB)
│   │   ├── schema.ts                 # All table + enum definitions
│   │   └── migrations/
│   │       └── 0000_white_lockjaw.sql # Generated SQL migration
│   └── utils.ts                      # cn() utility (clsx + tailwind-merge)
│
├── .env.local                        # All environment variables (fill in)
├── components.json                   # shadcn/ui configuration
├── drizzle.config.ts                 # drizzle-kit configuration
├── middleware.ts                     # Clerk auth middleware
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies + scripts
└── tsconfig.json                     # TypeScript configuration
```

---

## 4. Dependencies

### Production

| Package | Version | Purpose |
|---|---|---|
| `@clerk/nextjs` | ^7.4.3 | Authentication provider and hooks |
| `@imagekit/next` | ^2.1.5 | Image upload and CDN delivery |
| `@neondatabase/serverless` | ^1.1.0 | NeonDB HTTP driver for serverless |
| `@tanstack/react-query` | ^5.101.0 | Async state management |
| `bullmq` | ^5.78.0 | Redis-backed job queue |
| `class-variance-authority` | ^0.7.1 | Variant-based component styling |
| `clsx` | ^2.1.1 | Conditional className utility |
| `date-fns` | ^4.4.0 | Date manipulation library |
| `drizzle-orm` | ^0.45.2 | Type-safe SQL ORM |
| `groq-sdk` | ^1.2.1 | Groq AI inference client |
| `ioredis` | ^5.11.1 | Redis client (app-level caching) |
| `lucide-react` | ^1.17.0 | SVG icon library |
| `next-themes` | ^0.4.6 | Theme switching |
| `radix-ui` | ^1.5.0 | Accessible UI primitives (shadcn dep) |
| `react-day-picker` | ^10.0.1 | Calendar picker (shadcn dep) |
| `stripe` | ^22.2.0 | Stripe Payments SDK |
| `svix` | ^1.95.1 | Webhook signature verification |
| `tailwind-merge` | ^3.6.0 | Merge Tailwind classes without conflicts |

### Dev

| Package | Version | Purpose |
|---|---|---|
| `drizzle-kit` | ^0.31.10 | Schema migrations and Drizzle Studio |
| `tsx` | ^4.22.4 | Run TypeScript files directly (for workers) |
| `tailwindcss` | ^4 | CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind v4 |
| `typescript` | ^5 | Type checking |

> **Note:** `imagekitio-next` (deprecated) was replaced with `@imagekit/next` during install. BullMQ ships its own internal `ioredis` — the standalone `ioredis` package is only used for app-level Redis access outside of job queues to avoid type conflicts.

---

## 5. Environment Variables

All variables live in `.env.local`. **Never commit this file.** Replace every `REPLACE_ME` before starting the dev server.

### Clerk

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# These control redirect behavior after sign-in/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Get these from: [clerk.com](https://clerk.com) → your app → **API Keys**.
The `CLERK_WEBHOOK_SECRET` comes from **Webhooks → Add Endpoint** in the Clerk dashboard. Point the endpoint at `https://your-domain.com/api/webhooks/clerk` and subscribe to `user.created`, `user.updated`, `user.deleted`.

### Database

```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

Get this from: [neon.tech](https://neon.tech) → your project → **Connection Details** → choose the **Pooled connection** string.

### Redis

```env
REDIS_URL=redis://localhost:6379
```

For local development, run Redis via Docker:
```bash
docker run -d -p 6379:6379 redis:alpine
```
For production, use Upstash or Railway Redis — they provide a `rediss://` URL (with TLS).

### ImageKit

```env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

Get these from: [imagekit.io](https://imagekit.io) → **Developer** → **API Keys**.

### Groq

```env
GROQ_API_KEY=gsk_...
```

Get this from: [console.groq.com](https://console.groq.com) → **API Keys**.

### Stripe

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Get these from: [dashboard.stripe.com](https://dashboard.stripe.com) → **Developers → API Keys**.
The webhook secret comes from **Developers → Webhooks → Add Endpoint**.

### Platform OAuth Credentials (9 platforms)

Each platform needs a Client ID and Secret from its developer portal:

| Platform | Developer Portal | Env Keys |
|---|---|---|
| Twitter / X | developer.twitter.com | `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` |
| LinkedIn | linkedin.com/developers | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` |
| Facebook | developers.facebook.com | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` |
| Instagram | developers.facebook.com | `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` |
| TikTok | developers.tiktok.com | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` |
| YouTube | console.cloud.google.com | `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` |
| Pinterest | developers.pinterest.com | `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET` |
| Reddit | reddit.com/prefs/apps | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` |
| Mastodon | your-instance/settings/apps | `MASTODON_CLIENT_ID`, `MASTODON_CLIENT_SECRET`, `MASTODON_INSTANCE_URL` |

---

## 6. Authentication — Clerk

### How It Works

Clerk handles the full auth lifecycle — sign-up, sign-in, session tokens, and OAuth. The app never stores passwords.

### Files

#### `middleware.ts`

```
Route protection logic. Any request to /dashboard/* that lacks a valid
Clerk session is redirected to /sign-in automatically.
```

The matcher also ensures the middleware runs on all non-static routes and all `/api` routes. Static assets (images, fonts, CSS) are excluded.

#### `app/layout.tsx`

`<ClerkProvider>` wraps the entire app so that `useUser()`, `useAuth()`, and server-side `auth()` are available everywhere.

#### `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
#### `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

These use Clerk's hosted `<SignIn />` and `<SignUp />` components. The `[[...sign-in]]` catch-all route is required by Clerk for its multi-step flows (email verification, SSO callbacks, etc.).

#### `app/api/webhooks/clerk/route.ts`

Clerk cannot directly write to your database — it maintains its own user store. This webhook bridges the gap.

**Flow:**
```
User signs up on Clerk
       ↓
Clerk fires POST /api/webhooks/clerk with user data
       ↓
svix verifies the signature using CLERK_WEBHOOK_SECRET
       ↓
Route handler inserts a row into the `users` table
       ↓
User's DB record now exists with clerkId, email, plan: "free"
```

**Events handled:**

| Event | Action |
|---|---|
| `user.created` | INSERT into `users` with `clerkId`, email, name, `plan: "free"` |
| `user.updated` | UPDATE email, name, imageUrl in `users` |
| `user.deleted` | Soft-delete: set `deletedAt` timestamp |

> Soft-delete is used instead of hard-delete to preserve referential integrity with posts, connected accounts, and subscriptions.

---

## 7. Database — Drizzle + NeonDB

### Client (`lib/db/index.ts`)

Uses the NeonDB **HTTP driver** (`neon-http`), which is serverless-safe. Unlike a traditional PostgreSQL connection pool, it doesn't hold open TCP connections — each query is a single HTTP request. This is required for Next.js edge/serverless functions.

```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Schema (`lib/db/schema.ts`)

#### PostgreSQL Enums

| Enum Name | Values |
|---|---|
| `plan` | `free`, `pro`, `agency` |
| `post_status` | `draft`, `scheduled`, `publishing`, `published`, `failed`, `cancelled` |
| `platform` | `twitter`, `linkedin`, `facebook`, `instagram`, `tiktok`, `youtube`, `pinterest`, `reddit`, `mastodon` |
| `platform_result_status` | `pending`, `published`, `failed` |
| `auto_reply_trigger` | `mention`, `comment`, `dm` |
| `subscription_status` | `active`, `cancelled`, `past_due`, `trialing` |

#### Table: `users`

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | Same value as `clerk_id` |
| `clerk_id` | text (UNIQUE) | Clerk's user ID |
| `email` | text (UNIQUE) | Primary email from Clerk |
| `name` | text | First + last name joined |
| `image_url` | text | Avatar URL from Clerk |
| `plan` | enum | Default: `free` |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |
| `deleted_at` | timestamptz | Null unless soft-deleted |

#### Table: `connected_accounts`

Stores OAuth tokens for each social platform a user connects.

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | |
| `user_id` | text (FK → users) | Cascades on delete |
| `platform` | enum | Which social network |
| `platform_user_id` | text | The user's ID on that platform |
| `platform_username` | text | Handle (e.g. `@adeeque`) |
| `access_token` | text | OAuth access token |
| `refresh_token` | text | OAuth refresh token (nullable) |
| `token_expires_at` | timestamptz | When to refresh |
| `scopes` | text[] | Granted OAuth scopes |
| `metadata` | jsonb | Platform-specific extra data |

#### Table: `posts`

One record per post a user creates. A single post can target multiple platforms.

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | |
| `user_id` | text (FK → users) | Cascades on delete |
| `content` | text | The post body |
| `media_urls` | text[] | Array of ImageKit URLs |
| `platforms` | platform[] | Which platforms to publish to |
| `status` | enum | `draft` → `scheduled` → `publishing` → `published` |
| `scheduled_at` | timestamptz | When to publish (null = immediate) |
| `published_at` | timestamptz | When publishing finished |
| `metadata` | jsonb | Extra data (e.g. per-platform content overrides) |

#### Table: `post_platform_results`

One record per platform per post. Tracks individual publish status and engagement metrics.

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | |
| `post_id` | text (FK → posts) | Cascades on delete |
| `platform` | enum | |
| `connected_account_id` | text (FK → connected_accounts) | Which account published it |
| `status` | enum | `pending` → `published` / `failed` |
| `platform_post_id` | text | The ID assigned by the platform |
| `platform_post_url` | text | Direct link to the published post |
| `error_message` | text | If status is `failed` |
| `likes` | integer | Synced by comment-poller worker |
| `comments` | integer | |
| `shares` | integer | |
| `impressions` | integer | |
| `last_polled_at` | timestamptz | When metrics were last fetched |

#### Table: `auto_reply_rules`

Rules that drive the AI auto-reply system.

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | |
| `user_id` | text (FK → users) | |
| `connected_account_id` | text (FK → connected_accounts) | Which account monitors & replies |
| `name` | text | User-defined rule label |
| `trigger` | enum | `mention`, `comment`, or `dm` |
| `keywords` | text[] | Match filter — null means match everything |
| `prompt_template` | text | Groq prompt template for generating replies |
| `is_active` | boolean | Toggle without deleting the rule |
| `reply_count` | integer | Lifetime replies sent by this rule |

#### Table: `subscriptions`

Mirrors Stripe subscription state.

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | |
| `user_id` | text (FK → users, UNIQUE) | One subscription per user |
| `stripe_customer_id` | text (UNIQUE) | Stripe customer object ID |
| `stripe_subscription_id` | text (UNIQUE) | Stripe subscription object ID |
| `stripe_price_id` | text | Which price/plan tier |
| `plan` | enum | `pro` or `agency` |
| `status` | enum | `active`, `cancelled`, `past_due`, `trialing` |
| `current_period_start` | timestamptz | Billing cycle start |
| `current_period_end` | timestamptz | Billing cycle end / renewal date |
| `cancel_at_period_end` | boolean | Scheduled cancellation flag |

### Foreign Key Relationships

```
users
  ├── connected_accounts   (user_id → users.id, CASCADE DELETE)
  ├── posts                (user_id → users.id, CASCADE DELETE)
  ├── auto_reply_rules     (user_id → users.id, CASCADE DELETE)
  └── subscriptions        (user_id → users.id, CASCADE DELETE)

posts
  └── post_platform_results  (post_id → posts.id, CASCADE DELETE)

connected_accounts
  ├── auto_reply_rules       (connected_account_id → connected_accounts.id, CASCADE DELETE)
  └── post_platform_results  (connected_account_id → connected_accounts.id, CASCADE DELETE)
```

### Migration

The generated migration lives at [lib/db/migrations/0000_white_lockjaw.sql](lib/db/migrations/0000_white_lockjaw.sql).

To apply it to your NeonDB instance:
```bash
npm run db:migrate
```

To regenerate after schema changes:
```bash
npm run db:generate
```

To browse data visually:
```bash
npm run db:studio
```

### Drizzle Config (`drizzle.config.ts`)

```ts
{
  schema: "./lib/db/schema.ts",
  out:    "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! }
}
```

---

## 8. Background Jobs — BullMQ

### Architecture

BullMQ uses Redis as its backing store. Jobs are placed on named queues by the Next.js app (e.g. "schedule this post at 3pm"). Separate worker processes consume from those queues and do the actual work (API calls, DB writes). This decouples slow/async work from the HTTP request lifecycle.

```
Next.js App                Redis               Worker Process
─────────────             ────────            ───────────────
postPublisherQueue   →→→  [queue]  →→→   createPostPublisherWorker()
commentPollerQueue   →→→  [queue]  →→→   createCommentPollerWorker()
autoReplyQueue       →→→  [queue]  →→→   createAutoReplyWorker()
mediaProcessorQueue  →→→  [queue]  →→→   createMediaProcessorWorker()
```

### Queues (`lib/bullmq/queues.ts`)

| Queue Name | Purpose |
|---|---|
| `post-publisher` | Publishes a scheduled post to one or more platforms |
| `comment-poller` | Fetches updated engagement metrics for published posts |
| `auto-reply` | Generates and sends AI replies to mentions/comments/DMs |
| `media-processor` | Optimizes uploaded media via ImageKit before publishing |

The connection uses a parsed plain-object config (not an IORedis instance) to avoid type conflicts between BullMQ's bundled ioredis and the standalone package.

### Workers (`lib/bullmq/workers/`)

Each worker is currently a **typed stub** — the job type is defined and the handler logs to console. Implementation follows in Phase 2+.

#### `post-publisher.ts`

```ts
type PostPublisherJob = { postId: string; userId: string; }
```

Will: load the post + platform credentials from DB → call each platform's publish API → write results to `post_platform_results`.

#### `comment-poller.ts`

```ts
type CommentPollerJob = {
  postPlatformResultId: string;
  platform: string;
  platformPostId: string;
}
```

Will: call the platform's stats API → update `likes`, `comments`, `shares`, `impressions` on the `post_platform_results` row.

#### `auto-reply.ts`

```ts
type AutoReplyJob = {
  ruleId: string;
  triggerType: "mention" | "comment" | "dm";
  platformPostId: string;
  inboundText: string;
  platform: string;
  connectedAccountId: string;
}
```

Will: load the matching `auto_reply_rules` row → call Groq with the prompt template + inbound text → post the generated reply via platform API → increment `reply_count`.

#### `media-processor.ts`

```ts
type MediaProcessorJob = { postId: string; fileKeys: string[]; }
```

Will: receive raw uploaded files → apply ImageKit transformations (resize, format conversion) → update `posts.media_urls` with optimized CDN URLs.

### Running Workers

Workers run in a **separate process** from Next.js:

```bash
npm run worker
```

This executes `tsx lib/bullmq/worker-runner.ts`, which starts all four workers. Graceful shutdown on `SIGTERM`/`SIGINT` waits for in-flight jobs to complete before exiting.

> In production: run this as a separate Dockerfile/service or a background worker on Railway/Fly.io alongside your Next.js deployment.

---

## 9. Design System

### Philosophy

Bold editorial — typography IS the design. Extreme size contrast, asymmetric layouts, sharp edges. One accent color per section only. Never more than 2 typeface styles.

### Palette

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#F5F0E8` | Page background (warm off-white cream) |
| `--foreground` | `#000000` | Body text, borders |
| `--accent` | `#CCFF00` | Chartreuse — the single accent color |
| `--primary` | `#000000` | Primary buttons, headings |
| `--primary-foreground` | `#F5F0E8` | Text on black buttons |
| `--secondary` | `#E8E3DB` | Secondary surfaces |
| `--muted-foreground` | `#555555` | Captions, labels |
| `--destructive` | `#FF2D2D` | Error states |

All tokens are exposed as both CSS custom properties and Tailwind v4 color utilities (e.g. `bg-accent`, `text-foreground`).

### Typography

| Variable | Font | Use |
|---|---|---|
| `--font-sans` (`--font-inter`) | Inter | UI elements, body, navigation |
| `--font-serif` (`--font-playfair`) | Playfair Display | Hero headlines, editorial moments |

Both are loaded via `next/font/google` in [app/layout.tsx](app/layout.tsx) — no external font requests, no layout shift.

### Utility Classes

```css
/* Hero headline — use font-serif for editorial moments */
.headline-hero {
  font-size: clamp(60px, 10vw, 120px);
  line-height: 0.9;
  font-weight: 900;
}

/* Small caps label */
.label-caps {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

/* Thick editorial divider */
.rule-bold  →  border-top: 5px solid black
```

### Border Radius

Set to `0rem` across all radius scales. Every element is sharp-cornered. No rounded cards, no pill buttons.

### shadcn/ui Integration

shadcn components are configured in [components.json](components.json) with:
- Style: **New York**
- Base color: **Neutral**
- CSS Variables: **enabled**
- Icon library: **lucide**

Component files live in [components/ui/](components/ui/) and are fully editable source files (not node_modules).

---

## 10. NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Start Next.js dev server on port 3000 |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint |
| `npm run worker` | `tsx lib/bullmq/worker-runner.ts` | Start all BullMQ workers |
| `npm run db:generate` | `drizzle-kit generate` | Generate SQL migration from schema changes |
| `npm run db:migrate` | `drizzle-kit migrate` | Apply pending migrations to NeonDB |
| `npm run db:studio` | `drizzle-kit studio` | Open Drizzle Studio (DB GUI) |

---

## 11. How to Run Locally

### Prerequisites

- Node.js 20+
- A Redis instance (Docker: `docker run -d -p 6379:6379 redis:alpine`)
- A NeonDB project
- A Clerk application

### Steps

**1. Fill in environment variables**

Open `.env.local` and replace all `REPLACE_ME` values with real credentials from each service's dashboard.

**2. Apply database migration**

```bash
npm run db:migrate
```

This creates all 6 tables and 6 enums in your NeonDB database.

**3. Configure Clerk webhook**

In the Clerk dashboard:
- Go to **Webhooks → Add Endpoint**
- URL: `https://your-ngrok-or-domain.com/api/webhooks/clerk`
- Subscribe to: `user.created`, `user.updated`, `user.deleted`
- Copy the **Signing Secret** → set as `CLERK_WEBHOOK_SECRET` in `.env.local`

For local development, use [ngrok](https://ngrok.com) to expose port 3000:
```bash
ngrok http 3000
```

**4. Start the Next.js dev server**

```bash
npm run dev
```

**5. Start the worker process** (separate terminal)

```bash
npm run worker
```

**6. Verify**

- Open `http://localhost:3000`
- Visit `http://localhost:3000/sign-up` — Clerk sign-up form should appear
- Sign up → Clerk fires webhook → user row appears in NeonDB
- Visit `http://localhost:3000/dashboard` — should redirect to sign-in if not authenticated

---

## 12. What's Next (Phase 2)

Phase 1 is purely infrastructure. No user-visible features exist yet. Phase 2 will build on this foundation:

- **Dashboard layout** — sidebar navigation, header, user menu
- **Connect Accounts** — OAuth flows for each of the 9 platforms
- **Post Composer** — rich text editor with per-platform previews
- **Scheduler** — calendar UI for picking publish time, enqueuing to `post-publisher`
- **Analytics** — metrics pulled from `post_platform_results`
- **Auto-Reply** — rule builder UI, Groq integration in the worker
- **Billing** — Stripe checkout, webhook handling, plan gating
