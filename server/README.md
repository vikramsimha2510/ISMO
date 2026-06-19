# ISMO Server — Express + Supabase Backend

Express REST API for the ISMO project management system. Supabase handles authentication (password hashing, JWT issuance), and Supabase-hosted Postgres is the database, accessed via Prisma ORM.

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** project (free tier works)

## Database Setup Instructions (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. **Settings → Database** → copy the connection string into `DATABASE_URL` in `.env` (use the pooled "Transaction" string for serverless hosts).
3. **Settings → API** → copy the **Project URL** and the **`service_role` key** into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` respectively.
4. **Auth → Providers → Email** → **turn off "Confirm email"** so test accounts work immediately.
5. Apply the migration: `npx prisma migrate dev --name init`
6. Seed the database: `npm run db:seed`
## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Push the Prisma schema to Supabase Postgres
npx prisma db push

# 4. Generate the Prisma client
npx prisma generate

# 5. (Optional) Seed the database with demo data
npm run db:seed

# 6. Start the dev server
npm run dev
```

The server starts on `http://localhost:5000` by default.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | `development` / `production` / `test` |
| `DATABASE_URL` | Supabase Postgres connection string |
| `SUPABASE_URL` | Supabase project URL (`https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-side only) |
| `FRONTEND_ORIGIN` | Allowed CORS origin (default: `http://localhost:5173`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production server |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed the database with demo data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run lint` | Type-check without emitting |

## Demo Account

After seeding:
- **Email**: `demo@ismo.app`
- **Password**: `demo1234`

## Architecture

```
server/
  prisma/
    schema.prisma  # multiSchema, references auth.users
    seed.ts        # Seed script
  ER_DIAGRAM.dbml  # DBML diagram for dbdiagram.io
  src/
    config/        # env validation, Prisma client, Supabase admin client, logger
    middleware/    # auth, validation, rate limiting, error handling
    modules/
      auth/        # register, login, logout (wraps Supabase Auth)
      projects/    # CRUD, ownership-scoped to req.user.id
      tasks/       # CRUD, verifies project ownership
      dashboard/   # aggregate stats via Prisma count queries
    utils/         # AppError, asyncHandler
    types/         # Express type augmentation
    app.ts         # Express app assembly
    server.ts      # Entry point, graceful shutdown
```

## Security

- `SUPABASE_SERVICE_ROLE_KEY` is **server-side only** — never sent to the frontend
- CORS locked to `FRONTEND_ORIGIN`
- Helmet security headers enabled
- Rate limiting on auth endpoints (10 req / 15 min / IP)
- Every database query filtered by `userId` — ownership enforced in Express, not via RLS
- No `$queryRawUnsafe` — all queries through Prisma's parameterized API
- No stack traces or internal error details sent to the client
