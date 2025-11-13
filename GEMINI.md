# Project Overview

This is a Next.js project bootstrapped with `create-next-app`. It uses a modern tech stack including:

*   **Framework:** [Next.js](https://nextjs.org/) 16 (with React Compiler)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) 4
*   **API:** [tRPC](https://trpc.io/) for end-to-end typesafe APIs
*   **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) for PostgreSQL
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

The project is structured with the Next.js App Router. It includes a basic tRPC setup with a `hello` query and a database schema for a `users` table.

# Building and Running

## Prerequisites

*   Node.js
*   pnpm (based on `pnpm-lock.yaml`)
*   A PostgreSQL database

## Installation

```bash
pnpm install
```

## Running the Development Server

First, you need to set up your environment variables. Create a `.env` file in the root of the project and add your database connection string:

```
DATABASE_URL="your_postgresql_connection_string"
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Other Scripts

*   **Build for production:** `pnpm build`
*   **Start production server:** `pnpm start`
*   **Lint the code:** `pnpm lint`
*   **Generate Drizzle migrations:** `pnpm drizzle:generate`
*   **Apply Drizzle migrations:** `pnpm drizzle:push`

# Development Conventions

*   **Path Aliases:** The project uses the path alias `@/*` to refer to the `src/*` directory.
*   **tRPC:** API routes are defined in `src/trpc/routers/`. The main router is `_app.ts`. Client-side components can use the `useTRPC` hook to interact with the API.
*   **Database:** The database schema is defined in `src/db/schema.ts`. Drizzle Kit is used for generating and applying migrations.
*   **Styling:** Tailwind CSS is used for styling. The main CSS file is `src/app/globals.css`.
*   **Fonts:** The project uses the `Geist` font family.
