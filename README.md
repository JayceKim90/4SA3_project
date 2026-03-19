# HobbyHop

A Next.js app to discover hobby meetups, join group sessions, and host your own—search by interest, location, and time, with map and list views.

## Features

- **Discover**: Search sessions by tags, subject or area, and filter by date.
- **Map view**: See what’s happening near you on an interactive map.
- **Host**: Create a session and manage join requests.
- **Sorting**: Rank by distance, relevance, or start time.

## Stack

- **Next.js 15** (App Router), **TypeScript**
- **PostgreSQL** (via `@vercel/postgres` / `pg`)
- **Tailwind CSS 4**, **shadcn/ui**, **Lucide**

## Getting started

**Prerequisites:** Node.js 18+ and pnpm (or npm).

1. Clone and enter the project:

   ```bash
   git clone <repository-url>
   cd hobbyhop
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Add a `.env` in the project root with your database URL and any API keys your deployment needs (see `.env.example` if present).

4. Initialize the database:

   ```bash
   pnpm db:init
   ```

5. Run the app:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## API docs

With the dev server running, open `/api-docs` for interactive Swagger UI.

## Production: database SSL

If you see SSL errors in production, set `DATABASE_SSL` to `false` or `true` depending on your provider, then redeploy.

## License

Private / all rights reserved unless otherwise noted.

---

Questions or feedback? Open an issue on the repository.
