# Auth Coding Standards

## Provider

**This app uses [Clerk](https://clerk.com/) for authentication — do NOT implement any custom auth.**

- Do NOT use NextAuth, Auth.js, JWT libraries, or any other auth solution
- Do NOT store passwords, sessions, or tokens manually
- All auth state, session management, and user identity come exclusively from Clerk

The installed package is `@clerk/nextjs` (v7+).

## Getting the Current User

**Always use Clerk's server-side helpers to resolve the current user. Never trust user identity from client-supplied input.**

In Server Components and server actions, use `auth()` from `@clerk/nextjs/server`:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

`userId` is `null` when the user is not signed in. Guard against this before accessing protected data:

```ts
const { userId } = await auth();
if (!userId) redirect("/sign-in");
```

Do NOT use `currentUser()` when only the ID is needed — `auth()` is lighter and preferred.

## Protecting Pages

Use Clerk middleware to protect routes at the edge. The middleware config lives in `src/middleware.ts`:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte|ttf|woff2?|png|jpg|jpeg|gif|webp|svg|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

- Public routes (marketing pages, sign-in, sign-up) must be explicitly listed in `isPublicRoute`
- Every other route is protected by default

## Sign-In and Sign-Up Pages

Use Clerk's hosted UI components — do NOT build custom sign-in/sign-up forms:

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

```tsx
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

The catch-all `[[...sign-in]]` / `[[...sign-up]]` segment is required for Clerk's multi-step flow routing.

## User Identity in Data Helpers

Per the data-fetching standards, `userId` must always be derived server-side — never from URL params or request bodies.

Resolve `userId` at the top of a Server Component and pass it into `/data` helpers:

```ts
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForUser } from "@/data/workouts";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const workouts = await getWorkoutsForUser(userId);
  return <WorkoutList workouts={workouts} />;
}
```

See [`/docs/data-fetching.md`](/docs/data-fetching.md) for the full data isolation requirement.

## Client-Side Auth State

For UI-only concerns (showing a user avatar, conditionally rendering a sign-out button), use Clerk's client hooks:

```tsx
"use client";
import { useAuth, useUser } from "@clerk/nextjs";

const { isSignedIn } = useAuth();
const { user } = useUser();
```

**Never use client-side auth state to gate data access.** Client state can be spoofed. All data access decisions must happen server-side.

## Sign-Out

Use Clerk's `<UserButton />` component, which includes sign-out built in:

```tsx
import { UserButton } from "@clerk/nextjs";

<UserButton />
```

Do NOT implement a custom sign-out button that calls `signOut()` manually unless there is a specific UX requirement that `<UserButton />` cannot satisfy.

## Environment Variables

Clerk requires these variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Optional redirect overrides (defaults are `/` and `/`):

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

Do NOT commit `.env.local` or any file containing these keys.
