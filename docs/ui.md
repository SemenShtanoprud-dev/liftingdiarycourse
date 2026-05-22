# UI Coding Standards

## Component Library

**All UI components MUST be sourced from [shadcn/ui](https://ui.shadcn.com/).**

- Do NOT create custom UI components. Every button, input, dialog, card, table, dropdown, badge, or other UI element must come from shadcn/ui.
- If a shadcn/ui component does not exist for a use case, check the full component list before concluding one is missing.
- shadcn/ui components live in `src/components/ui/`. Do not modify them — treat them as read-only vendor code.
- Compose pages and features by combining shadcn/ui primitives. Layout, spacing, and typography are handled via Tailwind utilities applied directly in page/feature files.

## Adding shadcn/ui Components

Install new components with the CLI:

```bash
npx shadcn@latest add <component-name>
```

This places the component file in `src/components/ui/` automatically.

## Date Formatting

All dates must be formatted using **[date-fns](https://date-fns.org/)**.

### Required format

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
```

Use `format` from `date-fns` with ordinal day notation:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```

- Day: ordinal (`do`) — `1st`, `2nd`, `3rd`, `4th`, …
- Month: abbreviated (`MMM`) — `Jan`, `Feb`, `Mar`, …
- Year: 4-digit (`yyyy`)

Do not use `Date.prototype.toLocaleDateString`, `Intl.DateTimeFormat`, or any other date library.
