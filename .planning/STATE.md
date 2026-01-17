# State: JL Taxes

**Last Updated:** 2026-01-17
**Session:** Phase 2 In Progress

---

## Project Reference

**Core Value:** Rellenas una vez, sirve para siempre. Una familia entra datos una vez, se generan todas las declaraciones.

**Current Focus:** Phase 2 Plan 03 Complete - Owner management feature with multi-step wizard

---

## Current Position

**Phase:** 2 of 6 (Owner and Property Data)
**Plan:** 3 of 4 in phase - COMPLETE
**Status:** In Progress
**Last activity:** 2026-01-17 - Completed 02-03-PLAN.md (Owner Forms)

**Progress:**
```
Phase 1: [##########] 100% (4/4 plans) COMPLETE
Phase 2: [#######...] 75% (3/4 plans)
Phase 3: [..........] 0%
Phase 4: [..........] 0%
Phase 5: [..........] 0%
Phase 6: [..........] 0%
```

**Overall:** 1/6 phases complete (7 plans complete)

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Plans executed | 7 |
| Tasks completed | 20 |
| Requirements delivered | AUTH-01 to AUTH-05, A11Y-01 to A11Y-06, I18N-01 to I18N-04, OWNER-01 to OWNER-07 |
| Phases completed | 1/6 |

---

## Phase Status

| Phase | Name | Status | Requirements |
|-------|------|--------|--------------|
| 1 | Foundation | COMPLETE | AUTH-01 to AUTH-05 + A11Y + I18N |
| 2 | Owner and Property Data | In Progress (3/4) | OWNER-01 to OWNER-07, PROP-01 to PROP-08 |
| 3 | Imputed Income Declarations | Pending | IMP-01 to IMP-08, MULTI-01 to MULTI-04 |
| 4 | Rental Income Declarations | Pending | RENT-01 to RENT-08 |
| 5 | Payment and Annual Renewal | Pending | PAY-01 to PAY-05, RENEW-01 to RENEW-05, NOTIF-01 to NOTIF-04 |
| 6 | AEAT Submission and Admin | Pending | AEAT-01 to AEAT-05, ADMIN-01 to ADMIN-06 |

---

## Accumulated Context

### Key Decisions

| Decision | Rationale | Phase |
|----------|-----------|-------|
| Next.js 15 + Supabase stack | SSR, integrated auth, EU data residency | 1 |
| Many-to-many Owner-Property from start | Each co-owner files separate declaration (legal requirement) | 1 |
| Design system with 18px base | Elderly users require larger text | 1 |
| 48px minimum touch targets | Mobile-friendly for elderly users | 1 |
| shadcn/ui new-york style | Modern, accessible component library | 1 |
| oklch color space | Better perceptual uniformity for WCAG contrast | 1 |
| 4 languages from day one | Target market is British, German, French | 1 |
| Colaborador Social for AEAT | No public API, must register as fiscal representative | 1 |
| @supabase/ssr for auth | Official package for App Router, cookie-based auth | 1 |
| Drizzle with prepare: false | Required for Supabase connection pooler | 1 |
| Spanish (es) as default locale | Primary market is Spain-based properties | 1 |
| localePrefix: 'as-needed' | Default locale works without /es prefix | 1 |
| setRequestLocale() pattern | Required for static generation with next-intl | 1 |
| Combined i18n + auth middleware | i18n routing first, then session refresh | 1 |
| Zod schemas as hooks | Required to access translations at call time | 1 |
| getUser() in middleware | More secure than getSession() - validates JWT | 1 |
| Server actions for auth | Not API routes - better security and DX | 1 |
| No direct FK to auth.users | Supabase auth in separate schema, store userId conceptually | 2 |
| Decimal(5,2) for ownership % | Allows precise splits like 33.33% + 33.33% + 33.34% | 2 |
| Cascade delete on junction table | Prevents orphaned ownership records | 2 |
| Street type as enum | Enforces valid Spanish street types | 2 |
| better-dni for NIE/NIF validation | Checksum verification, not just regex; handles X/Y/Z prefix | 2 |
| ibantools for IBAN validation | Error codes for i18n, zero dependencies | 2 |
| Custom cadastral validation | No reliable npm library exists; documented algorithm | 2 |
| Basis points for percentages | Avoids floating point precision issues (33.33+33.33+33.34=100) | 2 |
| Per-step Zod schemas as hooks | Each step has own schema for type-safe, i18n-aware validation | 2 |
| Zustand persist middleware | Form state survives page refreshes and navigation | 2 |
| TaxIdInput as dedicated component | Encapsulates real-time validation UX pattern | 2 |
| Protected layout pattern | Single layout handles auth for all protected routes | 2 |

### Technical Notes

- NIE validation: X/Y/Z + 7 digits + control letter (checksum)
- NIF validation: 8 digits + control letter
- Cadastral reference: 20 alphanumeric characters with control digits at positions 18-19
- Cadastral rate: 1.1% (collective revision) vs 2% (individual revision, or no revision in 10+ years)
- Tax rate: 19% EU/EEA, 24% rest of world
- Supabase server client: async function with cookies() for App Router
- Language enum in DB: es, en, de, fr
- All pages must be under src/app/[locale]/ path
- Use Link from @/i18n/navigation for locale-aware routing
- Translation namespaces: common, nav, auth, validation, home, language, owner
- Button/Input/Label components configured for 48px height (h-12)
- All text uses minimum 18px via `html { font-size: 18px }`
- Focus states: 3px ring with ring-ring/50 color
- Auth forms use react-hook-form + zodResolver pattern
- Server actions return {error: string} or {success: string, owner}
- Language stored in Supabase user metadata during registration
- Zustand with persist middleware for multi-step form state
- ownerProperties junction table pattern: id, ownerId, propertyId, percentage, createdAt
- Drizzle relations: many/one with explicit fields/references
- Validators import from @/lib/validators (barrel export)
- IBAN error codes: ibanRequired, ibanCountryInvalid, ibanLengthInvalid, ibanChecksumInvalid
- Ownership error codes: atLeastOneOwner, percentageUnder100, percentageOver100, percentageMustBePositive
- Owner form: 4 steps (Type, Identity, Residence, Bank)
- TaxIdInput shows green/red validation with checkmark/X icon
- Protected routes: (protected) route group with auth layout redirect

### Blockers

| Blocker | Impact | Status |
|---------|--------|--------|
| Colaborador Social approval | Blocks Phase 6 AEAT submission | Process not started |
| Supabase credentials | Required for db:push and auth testing | User setup needed |

### TODOs

- [x] Initialize Next.js 15 project with dependencies
- [x] Set up Supabase clients for browser and server
- [x] Set up Drizzle ORM with initial schema
- [x] Set up i18n infrastructure with next-intl
- [x] Define design system tokens (colors, typography, spacing)
- [x] Configure accessible UI components (button, input, label, card, form)
- [x] Implement authentication flows (01-04-PLAN.md)
- [x] Create database schema with many-to-many relationships (02-01-PLAN.md)
- [x] Install validation libraries (better-dni, ibantools) - 02-02
- [x] Implement owner data management (02-03)
- [ ] Configure Supabase credentials (user setup)
- [ ] Run drizzle-kit push to apply migration
- [ ] Initiate Colaborador Social application with AEAT
- [ ] Implement property data management (02-04)

---

## Session Continuity

**Previous Session:** 2026-01-17T16:04:00Z - Completed 02-02-PLAN.md

**Last Session:** 2026-01-17T18:59:14Z

**Stopped at:** Completed 02-03-PLAN.md (Owner Forms)

**Resume file:** None

**Handoff Notes:**
- Phase 2 Plan 03 COMPLETE - Owner management feature implemented
- Owner CRUD server actions at src/app/[locale]/(protected)/owners/actions.ts
- Multi-step wizard form at src/components/owners/owner-form.tsx
- Real-time NIE/NIF validation at src/components/owners/tax-id-input.tsx
- Zustand store at src/stores/owner-form.ts (persists to localStorage)
- Zod schemas at src/hooks/useOwnerSchemas.ts (per-step hooks)
- Protected routes under src/app/[locale]/(protected)/
- Owner translations added to all 4 language files
- Build passes successfully
- Next: 02-04-PLAN.md (Property Forms)

**Next Action:** Execute 02-04-PLAN.md - Property data management forms and pages

---

*State updated: 2026-01-17*
