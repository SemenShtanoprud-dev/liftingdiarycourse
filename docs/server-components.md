# Server Component Coding Standards

## Async Server Components

**All page-level Server Components MUST be declared `async`.**

This is required because Next.js 15 makes several previously synchronous APIs asynchronous — including `params`, `searchParams`, and `cookies()`. You cannot access these values without `await`.

```tsx
// ✅ correct
export default async function WorkoutPage({ params }: Props) { ... }

// ❌ wrong — cannot await inside a sync function
export default function WorkoutPage({ params }: Props) { ... }
```

## Params and SearchParams MUST Be Awaited

In Next.js 15, `params` and `searchParams` are **Promises**. Accessing their properties without `await` returns `undefined`.

**Always type them as `Promise<...>` and await them before use:**

```tsx
// ✅ correct
type Props = {
  params: Promise<{ workoutId: string }>;
  searchParams: Promise<{ date?: string }>;
};

export default async function WorkoutPage({ params, searchParams }: Props) {
  const { workoutId } = await params;
  const { date } = await searchParams;
  // ...
}

// ❌ wrong — params is a Promise, not a plain object
type Props = {
  params: { workoutId: string };
};

export default async function WorkoutPage({ params }: Props) {
  const { workoutId } = params; // undefined at runtime
}
```

Do NOT destructure `params` or `searchParams` in the function signature — always receive them as the full prop and await them inside the function body.

## Route Segment Props Reference

| Prop           | Type                          | Use case                              |
| -------------- | ----------------------------- | ------------------------------------- |
| `params`       | `Promise<{ [key]: string }>`  | Dynamic route segments (`[id]`, etc.) |
| `searchParams` | `Promise<{ [key]?: string }>` | Query string values (`?date=...`)     |

Both follow the same rule: **declare as `Promise`, await before reading.**

## Auth Guard

Every protected page must resolve the current user from Clerk and redirect unauthenticated visitors server-side:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  // ...
}
```

Never rely on middleware alone to protect a page — always guard at the component level too, so the data layer is never reached without a valid `userId`.

## Not Found

Use `notFound()` from `next/navigation` when a resource doesn't exist or doesn't belong to the current user. This renders the nearest `not-found.tsx` boundary:

```tsx
import { notFound } from "next/navigation";

const workout = await getWorkoutById(userId, workoutId);
if (!workout) notFound();
```

Do NOT return `null`, render empty UI, or throw manually — use `notFound()` so Next.js handles the response correctly.
