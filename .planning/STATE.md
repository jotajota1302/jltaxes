# State: JL Taxes

**Last Updated:** 2026-01-17
**Session:** Initial

---

## Project Reference

**Core Value:** Rellenas una vez, sirve para siempre. Una familia entra datos una vez, se generan todas las declaraciones.

**Current Focus:** Phase 1 - Foundation (authentication, accessibility design system, i18n infrastructure)

---

## Current Position

**Phase:** 1 - Foundation
**Plan:** Not yet created
**Status:** Not Started

**Progress:**
```
Phase 1: [..........] 0%
Phase 2: [..........] 0%
Phase 3: [..........] 0%
Phase 4: [..........] 0%
Phase 5: [..........] 0%
Phase 6: [..........] 0%
```

**Overall:** 0/6 phases complete

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Plans executed | 0 |
| Tasks completed | 0 |
| Requirements delivered | 0/62 |
| Phases completed | 0/6 |

---

## Phase Status

| Phase | Name | Status | Requirements |
|-------|------|--------|--------------|
| 1 | Foundation | Not Started | AUTH-01 to AUTH-05 + A11Y + I18N |
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
| 4 languages from day one | Target market is British, German, French | 1 |
| Colaborador Social for AEAT | No public API, must register as fiscal representative | 1 |

### Technical Notes

- NIE validation: X/Y/Z + 7 digits + control letter (checksum)
- NIF validation: 8 digits + control letter
- Cadastral reference: 20 alphanumeric characters
- Cadastral rate: 1.1% (collective revision) vs 2% (individual revision, or no revision in 10+ years)
- Tax rate: 19% EU/EEA, 24% rest of world

### Blockers

| Blocker | Impact | Status |
|---------|--------|--------|
| Colaborador Social approval | Blocks Phase 6 AEAT submission | Process not started |

### TODOs

- [ ] Initiate Colaborador Social application with AEAT
- [ ] Define design system tokens (colors, typography, spacing)
- [ ] Set up i18n infrastructure with next-intl
- [ ] Create database schema with many-to-many relationships

---

## Session Continuity

**Previous Session:** None (initial state)

**Handoff Notes:**
- Project initialized with 62 v1 requirements
- Roadmap created with 6 phases
- Phase 1 ready for planning
- Critical: Start Colaborador Social process immediately (6+ month timeline)

**Next Action:** Run `/gsd:plan-phase 1` to create executable plan for Foundation phase

---

*State initialized: 2026-01-17*
