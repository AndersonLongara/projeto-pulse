# Copilot Instructions - Projeto Pulse

## Project Overview

Pulse is an HR-focused SuperApp (Férias, Folha, Benefícios, Ponto) built with intricate minimalism and engineering precision. The design philosophy is "warmth + approachability" for users, "precision + density" for admin interfaces.

## Tech Stack (Core 2026)

- **Frontend:** Next.js 15 (App Router), React 19 (Server Actions + RSC)
- **Styling:** Tailwind CSS + Shadcn/UI (Radix UI primitives only)
- **Icons:** `@phosphor-icons/react` (mandatory - no other icon libraries)
- **State:** TanStack Query (server state) + Zustand (client state)
- **Database:** PostgreSQL + Prisma ORM
- **PWA:** next-pwa for offline support
- **Validation:** Zod (required for all Server Actions and form inputs)

## Critical Design Engineering Rules

### The 4px Grid System (NON-NEGOTIABLE)
All spacing MUST follow this scale:
- `4px` - Micro spacing (icon gaps)
- `8px` - Tight (within inputs/components)
- `12px` - Standard (between related elements)
- `16px` - Comfortable (card/section padding)
- `24px` - Generous (group separation)
- `32px+` - Major sections

**Golden Rule:** Padding must be symmetric (Top=Bottom, Left=Right). Use Tailwind classes: `p-4`, `gap-3`, `space-y-6`.

### Typography Constraints
- **Headlines:** `font-semibold` (600), `tracking-tight` (-0.02em)
- **Body:** `font-normal` to `font-medium` (400-500)
- **Data (CPF, IDs, dates, currency):** `font-mono tabular-nums` (mandatory)
- **Scale:** 11px, 12px, 13px, 14px (base), 16px, 18px, 24px, 32px

### Component Standards
- **FORBIDDEN:** Raw HTML elements (`<button>`, `<input>`, `<select>`). Use Shadcn/Radix wrappers only.
- **FORBIDDEN:** Decorative gradients. Color communicates status/action/error only.
- **FORBIDDEN:** Dramatic shadows (`> 20px`) or bouncy/spring animations.
- **Depth Strategy:**
  - **Admin UI:** Borders first (`border-[0.5px] border-slate-200/50`), minimal shadows.
  - **SuperApp UI:** Layered shadows: `shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)]`.
  - **Surface Hierarchy:** Use subtle background shifts (`bg-slate-50` vs `bg-white`).

### Animation Standards
- **Duration:** `duration-150` (micro-interactions), `duration-250` (page transitions)
- **Easing:** `cubic-bezier(0.25, 1, 0.5, 1)` (custom or `ease-in-out`)
- **Dark Mode:** Prioritize subtle borders (`border-white/10`) over shadows.

## Security Protocols (Zero Trust)

1. **Auth:** JWT in HttpOnly, Secure, SameSite=Strict cookies.
2. **Validation:** Zod schemas on 100% of Server Actions and API routes.
3. **PII Protection:** Mask CPF, salary data in BFF layer. Never send raw to client.
4. **Headers:** CSP, HSTS, X-Frame-Options in `middleware.ts`.

## Code Organization

```
app/                    # Next.js 15 App Router
  (admin)/             # Admin routes (precision UI)
  (superapp)/          # User-facing routes (warm UI)
components/
  ui/                  # Shadcn components only
lib/
  services/
    senior-mock.ts     # Centralized mock data service
  validations/         # Zod schemas
prisma/
  schema.prisma
```

## Development Workflow

```powershell
# Setup
pnpm install
pnpm prisma generate

# Development
pnpm dev

# Build
pnpm build
pnpm start
```

## Self-Validation Checklist (Before Delivery)

Every component must pass:
- [ ] All spacing is multiples of 4px (`p-4`, `gap-3`, not `gap-[13px]`)
- [ ] Padding is symmetric (check `px-*` + `py-*` separately)
- [ ] Numeric data uses `font-mono tabular-nums`
- [ ] Touch targets ≥ 44px (`min-h-11` minimum for buttons)
- [ ] Keyboard accessible (tab navigation works)
- [ ] Uses Shadcn/Radix components (no raw `<input>`)
- [ ] Server Actions have Zod validation

## Business Domain Context

- **Persona:** Human, young, objective, empathetic language (Brazilian Portuguese).
- **Scope:** Employee self-service (vacation requests, payslips, benefits enrollment, time tracking).
- **Mock Data:** Use `services/senior-mock.ts` for prototyping before API integration.

## Important Notes

- **Project Root:** `c:\Users\Wesley\OneDrive\Documentos\Laboratorio\projeto-pulse`
- **Design Philosophy:** Every pixel decision must serve clarity or functionality—no decoration.
- **Component Creation:** Start with Shadcn CLI (`pnpm dlx shadcn-ui@latest add [component]`), then customize.

---

**Updated:** January 15, 2026 | **Status:** Setup phase
