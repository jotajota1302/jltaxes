---
phase: 02-owner-property-data
plan: 02
subsystem: validation
tags: [better-dni, ibantools, nie-nif, iban, cadastral, validators, spanish-tax]

# Dependency graph
requires:
  - phase: 02-01
    provides: Database schema with owners, properties tables
provides:
  - NIE/NIF validation with checksum verification
  - IBAN validation with i18n-ready error codes
  - Cadastral reference validation (20-character checksum)
  - Ownership percentage validation using basis points
affects: [02-03-owner-forms, 02-04-property-forms, 03-imputed-income]

# Tech tracking
tech-stack:
  added: [better-dni@4.4.2, ibantools@4.5.1]
  patterns: [validator-module-pattern, basis-points-for-percentages]

key-files:
  created:
    - src/lib/validators/nie-nif.ts
    - src/lib/validators/iban.ts
    - src/lib/validators/cadastral.ts
    - src/lib/validators/ownership.ts
    - src/lib/validators/index.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Use better-dni library for NIE/NIF (checksum verification, not regex)"
  - "Use ibantools for IBAN (error codes for i18n)"
  - "Custom cadastral validation (no reliable npm library exists)"
  - "Basis points for ownership percentages (avoid floating point issues)"

patterns-established:
  - "Validator module pattern: src/lib/validators/{domain}.ts with index.ts barrel export"
  - "i18n-ready error codes: return errorCode strings instead of hardcoded messages"
  - "Basis points for percentages: multiply by 100 and work with integers"

# Metrics
duration: 4min
completed: 2026-01-17
---

# Phase 02 Plan 02: Validation Library Setup Summary

**Spanish tax ID, IBAN, cadastral, and ownership validators using better-dni and ibantools libraries**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-17T16:00:00Z
- **Completed:** 2026-01-17T16:04:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed better-dni (NIE/NIF) and ibantools (IBAN) validation libraries
- Created 5 validator modules with proper TypeScript exports
- Implemented cadastral reference checksum algorithm (custom, 20-char format)
- Ownership percentage validation using basis points to avoid floating point errors
- All validators handle empty/null input gracefully with early returns

## Task Commits

Each task was committed atomically:

1. **Task 1: Install validation libraries** - `acad881` (chore)
2. **Task 2: Create validation utility modules** - `cb58913` (feat)

## Files Created/Modified
- `src/lib/validators/nie-nif.ts` - NIE/NIF validation using better-dni library
- `src/lib/validators/iban.ts` - IBAN validation with error codes for i18n
- `src/lib/validators/cadastral.ts` - Custom cadastral reference checksum validation
- `src/lib/validators/ownership.ts` - Ownership percentage validation with basis points
- `src/lib/validators/index.ts` - Barrel export for all validators
- `package.json` - Added better-dni and ibantools dependencies
- `package-lock.json` - Lockfile updated

## Decisions Made
- **better-dni over custom regex:** Library handles NIE X/Y/Z prefix mapping and checksum correctly
- **ibantools over iban:** Better TypeScript support and detailed error codes for i18n
- **Custom cadastral validator:** No reliable npm library exists; implemented documented algorithm
- **Basis points for percentages:** Avoids floating point precision issues (33.33 + 33.33 + 33.34 = 100.00)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All validators ready for integration with Zod schemas
- Can import from `@/lib/validators` via barrel export
- Error codes designed for i18n (return string keys, not hardcoded messages)
- Next: 02-03-PLAN.md (Owner Forms) will use these validators in form schemas

---
*Phase: 02-owner-property-data*
*Completed: 2026-01-17*
