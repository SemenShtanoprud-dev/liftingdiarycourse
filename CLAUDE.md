# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **IMPORTANT:** Before writing any code, always read the relevant documentation file in the `/docs` directory first. These files are the authoritative reference for this project's conventions and requirements. Currently available docs:
> - `/docs/ui.md` — UI conventions and component guidelines
> - `/docs/data-fetching.md` — Data fetching conventions and database query requirements

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Architecture

Next.js 16 App Router project with React 19, TypeScript 5, and Tailwind CSS v4.

**Key conventions:**
- All source code lives under `src/app/` (App Router file-based routing)
- Path alias `@/*` maps to `./src/*`
- Components default to Server Components; add `"use client"` only when needed (event handlers, browser APIs, hooks)
- Tailwind CSS v4 is configured via PostCSS (`@tailwindcss/postcss`), not a `tailwind.config.*` file
- Theming uses CSS custom properties (`--background`, `--foreground`) defined in `globals.css` with `prefers-color-scheme` dark mode — not Tailwind's `dark:` class strategy
- Fonts loaded via `next/font/google` (Geist Sans/Mono), injected as CSS variables on `<html>`
