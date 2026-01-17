---
phase: 02-owner-property-data
plan: 03
subsystem: ui, database
tags: [owners, forms, zod, zustand, react-hook-form, validation, nie-nif, iban, multi-step]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Auth, i18n, UI components (Button, Input, Card, Form)
  - phase: 02-01
    provides: Database schema with owners table
  - phase: 02-02
    provides: Validators (validateNieNif, validateIban, etc.)
provides:
  - Owner CRUD server actions
  - Multi-step owner registration wizard
  - Real-time NIE/NIF validation component
  - Protected route layout
  - Zustand store for form state persistence
affects: [02-04-property-forms, 03-imputed-income, 06-aeat-submission]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Multi-step wizard with Zustand persistence
    - Per-step Zod schema validation hooks
    - Real-time validation feedback component
    - Protected route layout pattern

key-files:
  created:
    - src/components/ui/select.tsx
    - src/components/ui/stepper.tsx
    - src/stores/owner-form.ts
    - src/hooks/useOwnerSchemas.ts
    - src/app/[locale]/(protected)/layout.tsx
    - src/app/[locale]/(protected)/owners/actions.ts
    - src/app/[locale]/(protected)/owners/page.tsx
    - src/app/[locale]/(protected)/owners/new/page.tsx
    - src/app/[locale]/(protected)/owners/[id]/page.tsx
    - src/components/owners/owner-form.tsx
    - src/components/owners/owner-card.tsx
    - src/components/owners/tax-id-input.tsx
  modified:
    - src/messages/es.json
    - src/messages/en.json
    - src/messages/de.json
    - src/messages/fr.json

key-decisions:
  - "Per-step Zod schemas with useOwnerStep*Schema hooks for type-safe validation"
  - "Zustand persist middleware for multi-step form state"
  - "TaxIdInput component with real-time validation feedback"
  - "Protected layout redirects to /login if not authenticated"
  - "Server actions validate ownership by userId for security"

patterns-established:
  - "Multi-step form: Stepper + per-step schema + Zustand store"
  - "Real-time validation input: onChange validation with visual feedback"
  - "Protected routes: (protected) route group with auth layout"
  - "CRUD server actions: auth check + userId filtering"

# Metrics
duration: 68min
completed: 2026-01-17
---

# Phase 2 Plan 3: Owner Forms Summary

**Multi-step owner wizard with Zustand persistence, per-step Zod validation, and real-time NIE/NIF feedback**

## Performance

- **Duration:** 68 min
- **Started:** 2026-01-17T17:51:09Z
- **Completed:** 2026-01-17T18:59:14Z
- **Tasks:** 3/3
- **Files modified:** 16

## Accomplishments
- Complete owner management feature with list, create, edit pages
- Multi-step registration wizard (4 steps: Type, Identity, Residence, Bank)
- Real-time NIE/NIF validation with checksum verification using better-dni
- Optional IBAN validation with specific error messages using ibantools
- Form state persists via Zustand localStorage middleware
- Protected routes redirect unauthenticated users to login

## Task Commits

Each task was committed atomically:

1. **Task 1: Add UI components and translations** - `a934b81` (feat)
2. **Task 2: Create Zod schemas and Zustand store** - `6ca5ffc` (feat)
3. **Task 3: Create owner pages and server actions** - `8451a8b` (feat)

## Files Created/Modified

### UI Components
- `src/components/ui/select.tsx` - Accessible Select with 48px touch targets
- `src/components/ui/stepper.tsx` - Multi-step progress indicator

### State Management
- `src/stores/owner-form.ts` - Zustand store with localStorage persistence
- `src/hooks/useOwnerSchemas.ts` - Per-step Zod validation hooks

### Pages and Actions
- `src/app/[locale]/(protected)/layout.tsx` - Auth-protected route layout
- `src/app/[locale]/(protected)/owners/actions.ts` - CRUD server actions
- `src/app/[locale]/(protected)/owners/page.tsx` - Owner list page
- `src/app/[locale]/(protected)/owners/new/page.tsx` - New owner wizard
- `src/app/[locale]/(protected)/owners/[id]/page.tsx` - Edit owner page

### Owner Components
- `src/components/owners/owner-form.tsx` - Multi-step wizard form (535 lines)
- `src/components/owners/owner-card.tsx` - Owner display card with actions
- `src/components/owners/tax-id-input.tsx` - Real-time NIE/NIF validation

### Translations
- `src/messages/es.json` - Spanish owner translations
- `src/messages/en.json` - English owner translations
- `src/messages/de.json` - German owner translations
- `src/messages/fr.json` - French owner translations

## Decisions Made
- **Per-step Zod schemas as hooks:** Each step has its own schema hook for type-safe, i18n-aware validation
- **Zustand with persist middleware:** Form state survives page refreshes and navigation
- **TaxIdInput as dedicated component:** Encapsulates real-time validation UX pattern
- **Protected layout pattern:** Single layout handles auth for all protected routes
- **Server actions with userId filtering:** All CRUD operations validate user owns the record

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Zod 4.x API differences**
- **Found during:** Task 2 (Schema creation)
- **Issue:** Zod 4.x uses `error` instead of `required_error` in enum options
- **Fix:** Updated schema to use Zod 4.x API: `z.enum(['individual', 'company'], { error: t('ownerTypeRequired') })`
- **Files modified:** src/hooks/useOwnerSchemas.ts
- **Verification:** TypeScript check passed
- **Committed in:** 6ca5ffc (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed TypeScript ReturnType inference issue**
- **Found during:** Task 3 (Component creation)
- **Issue:** TypeScript couldn't infer Zustand store return type in Step component props
- **Fix:** Defined explicit `OwnerFormData` interface for step component props
- **Files modified:** src/components/owners/owner-form.tsx
- **Verification:** TypeScript check and build passed
- **Committed in:** 8451a8b (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for TypeScript compilation. No scope creep.

## Issues Encountered
None - plan executed as designed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Owner management complete and ready for use
- Property forms (02-04) can follow same patterns:
  - Multi-step wizard with Stepper
  - Per-step Zod schemas
  - Zustand store for state
  - Server actions for CRUD
- Cadastral reference validation ready from 02-02

---
*Phase: 02-owner-property-data*
*Completed: 2026-01-17*
