# 邀請碼大全

「邀請碼大全」是一個 MGM 推薦碼分享平台。訪客可以搜尋或隨機取得各平台邀請碼，會員可以管理自己提供的邀請碼，系統透過使用回報與檢舉機制維持邀請碼品質。

## Current State

This repository is currently a Next.js front-end prototype. Several routes and UI flows already exist, but the product still needs real persistence, authentication, authorization, and admin workflows before it can be treated as a production app.

Important current limitations:

- Login and signup are not backed by a complete auth system.
- Member-only pages currently use mock data and are not protected.
- Invite-code CRUD actions are simulated and do not persist.
- Reports are stored locally or treated as non-persistent events.
- The admin route exists but is not implemented.

See [spec.md](./spec.md) and [docs/spec-requirements.md](./docs/spec-requirements.md) for the fuller product gap list.

## Chosen Technical Direction

The deployment target is Vercel free hosting. The goal is to avoid renting or maintaining an EC2/VPS-style server while still having a free database and managed authentication path for the MVP.

Recommended stack:

| Layer | Choice |
| --- | --- |
| Hosting | Vercel Hobby |
| Database | Neon Postgres |
| Auth | Neon Auth |
| ORM / migrations | Drizzle ORM |
| App backend | Next.js Route Handlers / Server Actions |

## Why This Stack

### Vercel

The app is already a Next.js project, so Vercel is the lowest-friction deployment target. The MVP can run without a separate long-lived backend server.

### Neon Postgres

Neon is a better fit than Supabase for this project because idle behavior matters. Supabase free projects may pause after inactivity and require manual restoration from the dashboard. Neon can scale compute to zero when idle and automatically wake on incoming database queries, which is a better fit for a small referral-code site that may be quiet for stretches.

The initial referral data has been moved out of the repository and seeded into Neon Postgres. Runtime referral search and platform APIs now read from the remote database through `DATABASE_URL`.

### Neon Auth

Neon Auth keeps auth on the same platform as the database, without requiring a self-hosted auth server. It is built on Better Auth, stores auth data in Neon Postgres, and should fit Vercel preview deployments better than a separate auth service.

### Drizzle ORM

Drizzle gives the project explicit schema definitions, migrations, and type-safe database access without being too heavy for a small Next.js app.

## First Database Tables

Start with these core tables:

- `profiles`
- `platforms`
- `invite_codes`
- `reports`
- `usage_events`
- `admin_actions`

Neon Auth manages its own auth tables in the database. Application-owned user metadata should live in `profiles` and reference the Neon Auth user id.

## First Implementation Milestones

1. Add Neon Postgres connection and environment variables.
2. Add Drizzle schema and migrations.
3. Replace the unfinished NextAuth usage with Neon Auth.
4. Implement email/password signup and login.
5. Protect `/profile`, `/manageCode`, and `/admin`.
6. Move platform and invite-code data out of JSON/mock state into Postgres.
7. Implement real invite-code CRUD for logged-in users.
8. Persist usage and report events server-side.
9. Implement automatic report thresholds and admin review flows.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

The future backend work should use environment variables like:

```bash
DATABASE_URL=
```

Production values should be configured in Vercel project settings.
