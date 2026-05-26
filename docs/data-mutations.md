# Data Mutation Standards

## Database Mutations via `/data` Helpers

**ALL database mutations MUST go through helper functions in the `src/data` directory.**

- Do NOT write inline Drizzle calls in actions, pages, or component files
- Do NOT use raw SQL — every mutation MUST use [Drizzle ORM](https://orm.drizzle.team/)
- One file per domain area (e.g., `data/workouts.ts`, `data/exercises.ts`) — co-locate read and write helpers in the same domain file

### Example helper

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date }).returning();
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(eq(workouts.id, workoutId) && eq(workouts.userId, userId));
}
```

Always filter mutations by `userId` — a user must never be able to modify or delete another user's data.

## Server Actions via `actions.ts`

**ALL data mutations MUST be performed via Server Actions.**

- Do NOT mutate data in Route Handlers (`app/api/*/route.ts`)
- Do NOT call `/data` mutation helpers directly from Client Components
- Server Actions MUST live in a colocated `actions.ts` file next to the route they serve

```
app/
  workouts/
    page.tsx
    actions.ts   ← server actions for this route
```

Every `actions.ts` file MUST begin with the `"use server"` directive:

```ts
"use server";
```

## Typed Parameters — No FormData

**All Server Action parameters MUST be explicitly typed. Do NOT use `FormData` as a parameter type.**

Pass plain typed objects or primitives instead:

```ts
// ✅ correct
export async function createWorkout(params: CreateWorkoutParams) { ... }

// ❌ wrong
export async function createWorkout(formData: FormData) { ... }
```

This keeps actions fully type-safe and decoupled from HTML form internals.

## Zod Validation

**ALL Server Actions MUST validate their arguments with [Zod](https://zod.dev/) before doing anything else.**

- Define a Zod schema for every action's input
- Call `.safeParse()` and return early on failure — do NOT throw
- Return a typed result object so callers can handle errors without try/catch

### Example action

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

type CreateWorkoutParams = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(params: CreateWorkoutParams) {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: {} };

  const result = createWorkoutSchema.safeParse(params);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  await createWorkout(userId, result.data.name, result.data.date);
  return { success: true };
}
```

### Return shape convention

Actions should return a consistent result shape so Client Components can handle success and error states uniformly:

```ts
// success
return { success: true };

// validation failure
return { success: false, errors: result.error.flatten().fieldErrors };
```

Do NOT throw errors out of Server Actions for expected failure cases (validation, not found). Reserve throws for truly unexpected errors.

## Redirects — Client Side Only

**Do NOT call `redirect()` from `next/navigation` inside a Server Action.**

Redirects must be handled client-side after the action resolves. When an action succeeds, return `{ success: true }` and let the calling Client Component navigate using `useRouter`:

```ts
// ❌ wrong — redirect inside server action
import { redirect } from "next/navigation";

export async function createWorkoutAction(params: CreateWorkoutParams) {
  // ...
  redirect("/dashboard");
}

// ✅ correct — return success, redirect client-side
export async function createWorkoutAction(params: CreateWorkoutParams) {
  // ...
  return { success: true };
}
```

```tsx
// ✅ client component handles the redirect
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { createWorkoutAction } from "./actions";

export function WorkoutForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(...);

  useEffect(() => {
    if (state.success) router.push("/dashboard");
  }, [state.success, router]);

  // ...
}
```

## Data Isolation

**Every mutation MUST be scoped to the authenticated user.**

- Always resolve `userId` from the server-side session via Clerk — never from params, URL segments, or the request body
- Always include a `userId` filter in `UPDATE` and `DELETE` queries so a user cannot affect another user's rows

See [`/docs/auth.md`](/docs/auth.md) for how to resolve `userId` and [`/docs/data-fetching.md`](/docs/data-fetching.md) for the full data isolation requirement.
