# State: JL Taxes

**Last Updated:** 2026-01-17
**Session:** Phase 1 Complete

---

## Project Reference

**Core Value:** Rellenas una vez, sirve para siempre. Una familia entra datos una vez, se generan todas las declaraciones.

**Current Focus:** Phase 1 Complete - Ready for Phase 2 (Owner and Property Data)

---

## Current Position

**Phase:** 1 of 6 (Foundation) - COMPLETE
**Plan:** 4 of 4 in phase - COMPLETE
**Status:** Phase 1 Complete
**Last activity:** 2026-01-17 - Completed 01-04-PLAN.md (Authentication)

**Progress:**
```
Phase 1: [##########] 100% (4/4 plans) COMPLETE
Phase 2: [..........] 0%
Phase 3: [..........] 0%
Phase 4: [..........] 0%
Phase 5: [..........] 0%
Phase 6: [..........] 0%
```

**Overall:** 1/6 phases complete (4 plans complete)

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Plans executed | 4 |
| Tasks completed | 13 |
| Requirements delivered | AUTH-01 to AUTH-05, A11Y-01 to A11Y-06, I18N-01 to I18N-04 (15/62) |
| Phases completed | 1/6 |

---

## Phase Status

| Phase | Name | Status | Requirements |
|-------|------|--------|--------------|
| 1 | Foundation | COMPLETE | AUTH-01 to AUTH-05 + A11Y + I18N |
| 2 | Owner and Property Data | Pending | OWNER-01 to OWNER-07, PROP-01 to PROP-08 |
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

### Technical Notes

- NIE validation: X/Y/Z + 7 digits + control letter (checksum)
- NIF validation: 8 digits + control letter
- Cadastral reference: 20 alphanumeric characters
- Cadastral rate: 1.1% (collective revision) vs 2% (individual revision, or no revision in 10+ years)
- Tax rate: 19% EU/EEA, 24% rest of world
- Supabase server client: async function with cookies() for App Router
- Language enum in DB: es, en, de, fr
- All pages must be under src/app/[locale]/ path
- Use Link from @/i18n/navigation for locale-aware routing
- Translation namespaces: common, nav, auth, validation, home, language
- Button/Input/Label components configured for 48px height (h-12)
- All text uses minimum 18px via `html { font-size: 18px }`
- Focus states: 3px ring with ring-ring/50 color
- Auth forms use react-hook-form + zodResolver pattern
- Server actions return {error: string} or {success: string}
- Language stored in Supabase user metadata during registration

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
- [ ] Configure Supabase credentials (user setup)
- [ ] Initiate Colaborador Social application with AEAT
- [ ] Create database schema with many-to-many relationships (Phase 2)
- [ ] Implement owner data management (Phase 2)
- [ ] Implement property data management (Phase 2)

---

## Session Continuity

**Previous Session:** 2026-01-17T13:03:57Z - Completed 01-03-PLAN.md

**Last Session:** 2026-01-17T14:30:00Z

**Stopped at:** Completed Phase 1 (01-04-PLAN.md)

**Resume file:** None - Phase 1 complete, ready for Phase 2 planning

**Handoff Notes:**
- Phase 1 Foundation COMPLETE with all 4 plans executed
- Authentication flow implemented: login, register, reset-password
- Design system ready with accessible components (18px text, 48px buttons)
- i18n infrastructure ready with 4 languages (es, en, de, fr)
- All pages must be under src/app/[locale]/ path
- User needs to configure Supabase credentials before testing auth
- Critical: Start Colaborador Social process immediately (6+ month timeline)
- Note: Next.js 16 middleware deprecation warning - may need migration to "proxy" in future

**Next Action:** Begin Phase 2 planning - Owner and Property Data management

---

*State updated: 2026-01-17*
