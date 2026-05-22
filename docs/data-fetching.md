# Data Fetching Standards

## Server Components Only

**ALL data fetching MUST be done exclusively via Server Components.**

- Do NOT fetch data in Client Components (`"use client"`)
- Do NOT fetch data in Route Handlers (`app/api/*/route.ts`)
- Do NOT use `useEffect` + `fetch`, SWR, React Query, or any client-side data fetching pattern
- Do NOT call database helpers from Client Components, even indirectly

Fetch data in a Server Component, then pass the result down as props to any Client Components that need it.

## Database Queries via `/data` Helpers

**ALL database queries MUST go through helper functions in the `/data` directory.**

- Do NOT write inline database queries in page or component files
- Do NOT use raw SQL — every query MUST use [Drizzle ORM](https://orm.drizzle.team/)
- One file per domain area (e.g., `data/workouts.ts`, `data/exercises.ts`)

### Example helper

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### Example Server Component consuming a helper

```tsx
// app/dashboard/page.tsx
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);

  return <WorkoutList workouts={workouts} />;
}
```

## Data Isolation — Users Must Only Access Their Own Data

**Every query that returns user-owned data MUST filter by the authenticated user's ID.**

- Always resolve the current user inside the `/data` helper or pass `userId` in as a parameter
- Never query without a `userId` filter on user-owned tables
- Never trust a `userId` value that comes from client-supplied input (URL params, request body) — always derive it from the server-side session

This is a hard security requirement. A logged-in user must never be able to read, modify, or delete another user's data.
