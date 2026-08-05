# Medra — Physical AI Scientist Platform (UI)

A modular rebuild of the Medra interface: a token-driven design system, a
library of composable primitives, and pages assembled entirely from those
pieces with placeholder data.

## Getting started

```bash
npm install
npm run dev
```

## Architecture

The codebase is layered so each level only depends on the one below it:

```
src/
├── design-system/          The component library
│   ├── tokens.css          Design tokens — the single source of truth
│   ├── primitives/         Button, Badge, Card, Input, Avatar, Progress,
│   │                       DataTable, EmptyState, Kicker, IconButton
│   └── index.ts            Public API (import from '@/design-system' only)
│
├── components/             Product components composed from primitives
│   ├── layout/             AppShell, Sidebar, ContextPanel, PageContainer
│   ├── campaign/           CampaignPanel, ActionCard, FileBrowser, status badge
│   └── nav/                ProximityPill (shared hover highlight)
│
├── data/                   Placeholder data layer
│   ├── types.ts            Domain types (the future API contract)
│   ├── campaigns.ts        Campaigns, runs, current user
│   └── navigation.ts       Sidebar navigation as data
│
├── views/                  Route-level composition only — no bespoke UI
│
└── app/                    Next.js App Router entries (layouts + pages)
```

### Design tokens (`src/design-system/tokens.css`)

Two layers of CSS custom properties:

1. **Primitive tokens** — raw palettes and scales (`--medra-ink-900`,
   `--medra-paper-50`, type scale, radii, shadows).
2. **Semantic tokens** — role-based aliases components actually use
   (`--surface-app`, `--text-secondary`, `--action-primary-bg`).

Tailwind utilities map to the semantic layer in `src/index.css` via `@theme`,
so `bg-raised`, `text-secondary`, `border-edge`, etc. all resolve to tokens.
Retheming (or adding dark mode) means editing `tokens.css` only — no
component changes.

### Rules of the system

- **Components never hard-code values.** Colors, type sizes, radii, and
  shadows come from tokens.
- **Primitives are variant-driven.** Behavior is configured through typed
  props (`variant`, `size`, `tone`), not overridden with ad-hoc classes.
- **Pages compose; they don't invent.** If a page needs new UI, it gets
  added as a primitive or a product component first.
- **Data is injected.** Everything renders from `src/data/*`. Swapping in a
  real API means implementing the types in `data/types.ts` — no UI changes.

## Stack

- React 19 + TypeScript (strict)
- Next.js 16 (App Router, Turbopack)
- Tailwind CSS 4 (tokens mapped via `@theme`)
- lucide-react icons
