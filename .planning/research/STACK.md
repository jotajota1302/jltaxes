# Technology Stack

**Project:** JL TAXES - Non-Resident Tax Filing Platform (Modelo 210)
**Researched:** 2026-01-17
**Overall Confidence:** MEDIUM-HIGH

---

## Executive Summary

This stack recommendation prioritizes **accessibility for elderly users**, **robust i18n for 4 languages**, and **reliable tax form handling**. The core framework choice is **Next.js 15.x** for its mature ecosystem, excellent i18n support via next-intl, and Server Components for performance. For forms, **React Hook Form + Zod** provides the best TypeScript-first validation experience. The database layer uses **Supabase** (PostgreSQL) for its built-in auth, real-time features, and API generation that accelerates development.

**Critical finding on AEAT integration:** There is no documented public API/web service for Modelo 210 batch submission. The AEAT uses a file-based approach (.210 files with specific registry designs) submitted through their Sede Electronica portal, either manually or by authorized collaborators with certificates. This will require browser automation (Playwright) or certified collaborator status.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Next.js** | 15.5.x | Full-stack React framework | Industry standard for React apps; stable App Router; excellent i18n ecosystem with next-intl; Vercel deployment simplicity; React 19 support. Chose over Remix because Next.js has better i18n tooling and larger community for tax/fintech patterns. | HIGH |
| **React** | 19.x | UI library | Ships with Next.js 15; concurrent features improve form responsiveness | HIGH |
| **TypeScript** | 5.6+ | Type safety | Essential for complex tax calculations; catches errors at compile time | HIGH |

**Why NOT Remix:** While Remix excels at progressive enhancement and has excellent accessibility defaults, its i18n story requires more manual work. For a 4-language tax platform with complex forms, next-intl's tight Next.js integration is more valuable. Remix is better suited for data-heavy apps where you want maximum control over fetching; this platform needs maximum i18n/form tooling.

**Why NOT Nuxt/Vue:** Team presumably has React experience (ASP migration to React is more common path). Vue ecosystem for tax/fintech is smaller. Nuxt was recently acquired by Vercel which may affect direction.

### Internationalization (i18n)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **next-intl** | 4.x | i18n for Next.js | Purpose-built for Next.js App Router; ICU message syntax; type-safe translation keys; built-in routing with localized URLs; 931K weekly downloads. Superior to react-i18next for Next.js-specific features. | HIGH |

**Why NOT react-i18next:** While more flexible and widely used, react-i18next's Next.js integration is less native. The next-i18next wrapper is not compatible with App Router. next-intl provides localized routing out of the box which matters for SEO and user experience.

**Why NOT LinguiJS:** Excellent library with smaller bundle, but requires build-time compilation step. next-intl's developer experience with App Router is more streamlined.

**i18n Setup:**
```typescript
// routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en', 'de', 'fr'],
  defaultLocale: 'es',
  localePrefix: 'always' // URLs like /en/dashboard, /de/dashboard
});
```

**Translation File Structure:**
```
messages/
  es.json  // Spanish (default)
  en.json  // English (UK focus)
  de.json  // German
  fr.json  // French
```

### Form Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **React Hook Form** | 7.60+ | Form state management | Best-in-class performance (40% fewer re-renders than Formik); uncontrolled components minimize re-renders on elderly users' slower devices; 35M+ weekly downloads | HIGH |
| **Zod** | 3.25+ | Schema validation | TypeScript-first; automatic type inference (`z.infer<typeof schema>`); zero dependencies; smaller bundle than Yup; better error messages | HIGH |
| **@hookform/resolvers** | 5.x | RHF + Zod bridge | Official integration; supports Zod v3 and v4 | HIGH |

**Why NOT Formik:** More re-renders, heavier bundle, less TypeScript-native. React Hook Form is the modern standard.

**Why NOT Yup:** Yup requires manual TypeScript type definitions. Zod's automatic type inference eliminates duplication and reduces errors.

**Tax Form Pattern:**
```typescript
import { z } from 'zod';

// Spanish tax form schema with i18n error messages
export const modelo210Schema = z.object({
  nif: z.string()
    .regex(/^[XYZ]?\d{7,8}[A-Z]$/)
    .describe('NIF/NIE validation'),
  ejercicio: z.number()
    .min(2020)
    .max(new Date().getFullYear()),
  tipoRenta: z.enum(['01', '02', '05', '25']), // AEAT rent type codes
  baseImponible: z.number().min(0),
  // ... more fields matching AEAT registry design
});

export type Modelo210Data = z.infer<typeof modelo210Schema>;
```

### UI Components & Accessibility

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **shadcn/ui** | Latest | Component library | Built on Radix UI primitives; fully accessible (WAI-ARIA compliant); copy-paste ownership; Tailwind-based; customizable for large fonts/high contrast | HIGH |
| **Radix UI** | 1.x | Headless primitives | Foundation for shadcn/ui; handles focus management, keyboard navigation, screen reader support automatically | HIGH |
| **Tailwind CSS** | 4.x | Utility CSS | Rust-based engine (faster); built-in sr-only, focus-visible, forced-color utilities; prefers-contrast media query support | HIGH |

**Why NOT MUI/Chakra:** More opinionated styling harder to customize for elderly-specific needs. shadcn/ui gives full control over fonts, spacing, contrast while maintaining accessibility.

**Accessibility Configuration:**
```css
/* globals.css - Elderly-friendly defaults */
:root {
  --font-size-base: 18px;      /* Larger than typical 16px */
  --line-height-base: 1.6;     /* Generous line height */
  --min-touch-target: 48px;    /* WCAG 2.2 target size */
}

/* High contrast mode support */
@media (prefers-contrast: more) {
  :root {
    --foreground: #000000;
    --background: #ffffff;
    --border: #000000;
  }
}
```

### Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Supabase** | - | PostgreSQL + BaaS | Full backend stack (auth, storage, realtime); Row Level Security for multi-tenant isolation; auto-generated REST/GraphQL APIs; EU data residency (Frankfurt); SOC2 compliant | HIGH |
| **Drizzle ORM** | 0.40+ | TypeScript ORM | SQL-like syntax (team can write raw SQL); zero runtime dependencies; no code generation step; excellent for serverless; works with Supabase PostgreSQL | MEDIUM-HIGH |

**Why NOT Neon:** Pure database only - would need separate auth, storage, and API solutions. Supabase's integrated stack accelerates development. Neon better for AI-agent scenarios.

**Why NOT Prisma:** Requires prisma generate step after schema changes; larger bundle size; Drizzle's SQL-like syntax better for team with existing database knowledge.

**Database Schema Pattern:**
```typescript
// schema.ts (Drizzle)
import { pgTable, text, timestamp, decimal, integer } from 'drizzle-orm/pg-core';

export const declarations = pgTable('declarations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  nif: text('nif').notNull(),
  ejercicio: integer('ejercicio').notNull(),
  periodo: text('periodo').notNull(), // '1T', '2T', '3T', '4T', '0A'
  tipoRenta: text('tipo_renta').notNull(),
  baseImponible: decimal('base_imponible', { precision: 12, scale: 2 }),
  cuotaIntegra: decimal('cuota_integra', { precision: 12, scale: 2 }),
  status: text('status').default('draft'), // draft, submitted, paid, error
  aeatReference: text('aeat_reference'), // CSV from AEAT
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Authentication

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Supabase Auth** | - | User authentication | Built into Supabase; supports email/password, magic links (easier for elderly), OAuth; JWT-based | HIGH |

**Authentication Strategy for Elderly Users:**
- **Magic links as primary** - No passwords to remember
- **Email + password as fallback** - For those who prefer it
- **Generous session duration** - 30-day sessions to reduce re-authentication

### Payment Processing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Stripe** | - | Payment processing | Industry standard; PCI compliant; supports SEPA (EU payments); excellent Next.js integration; Checkout handles compliance | HIGH |
| **@stripe/stripe-js** | Latest | Client SDK | Official Stripe.js wrapper | HIGH |
| **stripe** | Latest | Server SDK | Node.js SDK for server-side operations | HIGH |

**Payment Pattern (Server Actions):**
```typescript
// app/actions/payment.ts
'use server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(declarationId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'sepa_debit'], // EU-friendly
    line_items: [{
      price: process.env.STRIPE_PRICE_MODELO_210,
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment/cancelled`,
    metadata: { declarationId },
  });

  return { url: session.url };
}
```

### AEAT Integration (CRITICAL - Requires Research Phase)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Playwright** | 1.50+ | Browser automation | AEAT lacks public API for Modelo 210; file-based submission through Sede Electronica requires automation; Playwright handles complex forms, certificate auth | LOW-MEDIUM |
| **xmlbuilder2** | 3.x | XML generation | Generate .210 files matching AEAT registry design | MEDIUM |

**CRITICAL FINDING:** The AEAT does not provide a documented REST/SOAP API for Modelo 210 submission. The submission process is:

1. **File generation:** Create .210 files matching AEAT's "diseno de registro" (registry design)
2. **Certificate authentication:** Requires electronic certificate (certificado digital)
3. **Portal submission:** Through sede.agenciatributaria.gob.es
4. **Payment:** Obtain NRC (Numero de Referencia Completo) from bank, then submit

**Integration Options (in order of preference):**

1. **Collaborator Registration (RECOMMENDED)**
   - Register as "colaborador social" with AEAT
   - Grants ability to submit on behalf of clients
   - May unlock batch submission capabilities
   - **Action:** Contact AEAT for collaborator registration requirements

2. **Browser Automation (FALLBACK)**
   - Use Playwright with client's certificate
   - Automate Sede Electronica form submission
   - Higher maintenance, but works without special authorization

3. **Existing Library (INVESTIGATE)**
   - `initios/aeat-web-services` (Python) - customs-focused, may not support Modelo 210
   - Would need verification and potential contribution

### Email Service

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Resend** | - | Transactional email | Modern API; React Email integration; better pricing than SendGrid; good deliverability; simpler than AWS SES | MEDIUM-HIGH |
| **React Email** | - | Email templates | JSX-based email templates; preview in browser; integrates with Resend | MEDIUM-HIGH |

**Why NOT SendGrid:** More expensive for transactional-only use case; overkill features for this project; Resend's React integration better matches stack.

### Automation (Leveraging Team Experience)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **n8n** | Self-hosted | Workflow automation | Team has experience; webhook-based integration with Next.js; can orchestrate AEAT submission workflows; SOC2 compliant; EU self-hosting option | HIGH |

**n8n Use Cases:**
- Declaration status change notifications
- Payment confirmation workflows
- AEAT submission orchestration
- Annual reminder campaigns
- Document generation pipelines

**Integration Pattern:**
```typescript
// Trigger n8n workflow from Next.js
await fetch(process.env.N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'declaration_submitted',
    declarationId,
    userId,
    timestamp: new Date().toISOString(),
  }),
});
```

---

## Infrastructure

| Technology | Purpose | Why | Confidence |
|------------|---------|-----|------------|
| **Vercel** | Next.js hosting | Zero-config deployment; edge functions for low latency; preview deployments; EU region available | HIGH |
| **Supabase Cloud** | Database hosting | Managed PostgreSQL; Frankfurt (EU) data center; automatic backups; SOC2 compliant | HIGH |
| **n8n Cloud** or **Self-hosted** | Automation platform | Team experience; can self-host in EU for data residency | HIGH |

---

## Development Dependencies

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.x | Linting with accessibility rules |
| **Prettier** | 3.x | Code formatting |
| **eslint-plugin-jsx-a11y** | Latest | Accessibility linting |
| **@axe-core/react** | Latest | Runtime accessibility testing |
| **Playwright** | 1.50+ | E2E testing + AEAT automation |
| **Vitest** | 2.x | Unit testing |

---

## Installation

```bash
# Create Next.js project
npx create-next-app@latest jl-taxes --typescript --tailwind --app

# Core dependencies
npm install next-intl react-hook-form @hookform/resolvers zod

# UI
npm install @radix-ui/react-* tailwindcss@latest
npx shadcn@latest init

# Database
npm install drizzle-orm @supabase/supabase-js
npm install -D drizzle-kit

# Payments
npm install stripe @stripe/stripe-js

# Email
npm install resend @react-email/components

# AEAT integration
npm install playwright xmlbuilder2

# Dev dependencies
npm install -D @types/node typescript eslint prettier
npm install -D eslint-plugin-jsx-a11y @axe-core/react
npm install -D vitest @playwright/test
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15.x | Remix 2.x | Less native i18n support; smaller ecosystem for tax patterns |
| Framework | Next.js 15.x | Nuxt 3.x | Vue ecosystem; recent Vercel acquisition uncertainty |
| i18n | next-intl | react-i18next | Not App Router native; requires more configuration |
| Forms | React Hook Form | Formik | More re-renders; less TypeScript-native |
| Validation | Zod | Yup | Manual TS types; larger bundle |
| ORM | Drizzle | Prisma | Code generation step; larger bundle; slower DX loop |
| Database | Supabase | Neon | Need auth/storage/APIs that Supabase provides |
| UI | shadcn/ui | MUI | Less customizable for elderly accessibility needs |
| Email | Resend | SendGrid | Overkill; more expensive for transactional-only |

---

## Environment Variables

```bash
# .env.local

# Next.js
NEXT_PUBLIC_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_MODELO_210=price_xxx

# Resend
RESEND_API_KEY=re_xxx

# n8n
N8N_WEBHOOK_URL=https://your-n8n.example.com/webhook/xxx

# AEAT (TBD - depends on integration approach)
# AEAT_CERTIFICATE_PATH=/path/to/cert.p12
# AEAT_CERTIFICATE_PASSWORD=xxx
```

---

## Sources

### Framework & Rendering
- [Next.js 15 Blog](https://nextjs.org/blog/next-15)
- [Next.js 15.5 Release](https://nextjs.org/blog/next-15-5)
- [Remix vs NextJS 2025 comparison](https://merge.rocks/blog/remix-vs-nextjs-2025-comparison)

### Internationalization
- [next-intl GitHub](https://github.com/amannn/next-intl)
- [next-intl App Router Docs](https://next-intl.dev/docs/getting-started/app-router)
- [Best i18n Libraries for Next.js App Router 2025](https://medium.com/better-dev-nextjs-react/the-best-i18n-libraries-for-next-js-app-router-in-2025-21cb5ab2219a)

### Forms & Validation
- [React Hook Form Docs](https://react-hook-form.com/)
- [Best React Form Libraries 2025](https://snappify.com/blog/best-react-form-libraries)
- [Zod vs Yup Complete Comparison 2025](https://generalistprogrammer.com/comparisons/zod-vs-yup)

### Accessibility
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [Color Contrast Accessibility Guide 2025](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025)
- [Tailwind CSS Accessibility](https://kombai.com/tailwind/accessibility/)

### Database
- [Supabase vs Neon Comparison 2025](https://vela.simplyblock.io/neon-vs-supabase/)
- [Drizzle vs Prisma 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/)

### Payments
- [Stripe + Next.js 15 Complete Guide 2025](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)

### AEAT Integration
- [AEAT Modelo 210 Electronic Filing](https://sede.agenciatributaria.gob.es/Sede/en_gb/ayuda/consultas-informaticas/presentacion-declaraciones-ayuda-tecnica/modelo-210.html)
- [AEAT Forms of Presentation](https://sede.agenciatributaria.gob.es/Sede/en_gb/todas-gestiones/impuestos-tasas/impuesto-sobre-renta-no-residentes/modelo-210-irnr______a-no-residentes-permanente_/formas-presentacion-pago-modelo-210.html)
- [aeat-web-services GitHub](https://github.com/initios/aeat-web-services)

### UI Components
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [ShadCN UI vs Radix UI 2025](https://javascript.plainenglish.io/shadcn-ui-vs-radix-ui-vs-tailwind-ui-which-should-you-choose-in-2025-b8b4cadeaa25)

### Email
- [Resend vs SendGrid Comparison](https://forwardemail.net/en/blog/resend-vs-sendgrid-email-service-comparison)

### Automation
- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

---

## Confidence Summary

| Area | Confidence | Notes |
|------|------------|-------|
| Framework (Next.js) | HIGH | Industry standard, verified current versions |
| i18n (next-intl) | HIGH | Purpose-built for Next.js App Router |
| Forms (RHF + Zod) | HIGH | Well-documented, type-safe |
| UI (shadcn/ui) | HIGH | Accessible, customizable |
| Database (Supabase) | HIGH | Full BaaS with EU residency |
| Payments (Stripe) | HIGH | Industry standard |
| AEAT Integration | LOW-MEDIUM | No public API; requires investigation |
| Email (Resend) | MEDIUM-HIGH | Newer service, but well-suited |

---

## Roadmap Implications

Based on this stack research:

1. **Phase 1: Foundation** - Next.js + i18n + Auth setup (straightforward)
2. **Phase 2: Forms & Tax Logic** - Complex multi-step forms with accessibility (moderate complexity)
3. **Phase 3: AEAT Integration** - Requires dedicated research phase before implementation (HIGH RISK - needs early investigation)
4. **Phase 4: Payments** - Stripe integration (straightforward)
5. **Phase 5: Automation** - n8n workflows (team has experience)

**Critical Path Item:** AEAT integration approach must be resolved early. Recommend parallel investigation track during Phase 1 to determine:
- Collaborator registration feasibility
- Registry design specifications for .210 file format
- Certificate requirements and acquisition process
