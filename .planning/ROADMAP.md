# Roadmap: JL Taxes

**Created:** 2026-01-17
**Phases:** 6
**Depth:** Standard
**Coverage:** 62/62 v1 requirements mapped

---

## Overview

JL Taxes delivers tax filing for non-residents in Spain (Modelo 210) with a core promise: "Rellenas una vez, sirve para siempre." The roadmap progresses from authentication through data entry, tax calculations, payments, and finally AEAT submission. Cross-cutting concerns (accessibility for elderly users, 4-language support) are built into every phase from the start.

---

## Phase 1: Foundation

**Goal:** Users can create accounts and access the platform in their preferred language with an accessible interface.

**Dependencies:** None (first phase)

**Requirements:**
- AUTH-01: Usuario puede registrarse con email y contrasena
- AUTH-02: Usuario puede iniciar sesion y mantener sesion activa
- AUTH-03: Usuario puede recuperar contrasena via email
- AUTH-04: Usuario puede seleccionar idioma preferido (ES/EN/DE/FR)
- AUTH-05: Sesion persiste minimo 30 dias (elderly-friendly)

**Cross-cutting applied:**
- A11Y-01 to A11Y-09: Design system with 18px+ fonts, 48px touch targets, WCAG 2.1 AA contrast, keyboard navigation, screen reader support
- I18N-01 to I18N-06: 4 languages from day one, proper locale formats

**Success Criteria:**
1. User can register with email/password in any of 4 languages
2. User can log in and remain logged in for 30+ days without re-authentication
3. User can recover forgotten password via email link
4. User can switch language at any time and all interface text updates immediately
5. All text is minimum 18px, buttons are minimum 48x48px, contrast meets WCAG 2.1 AA

**Notes:**
- Initiate Colaborador Social application with AEAT immediately (6+ month process)
- Design system must be established here for all subsequent phases
- Data model includes many-to-many Owner-Property relationship from start

---

## Phase 2: Owner and Property Data

**Goal:** Users can register their family of owners and properties with all required fiscal data, ready for declaration generation.

**Dependencies:** Phase 1 (authentication required)

**Requirements:**
- OWNER-01: Usuario puede registrar propietario persona fisica
- OWNER-02: Usuario puede registrar propietario empresa
- OWNER-03: Usuario puede introducir NIE/NIF con validacion checksum
- OWNER-04: Usuario puede introducir datos de residencia fiscal (pais, direccion)
- OWNER-05: Usuario puede introducir datos bancarios (IBAN para devoluciones)
- OWNER-06: Sistema valida formato NIE/NIF (X/Y/Z + digitos + letra control)
- OWNER-07: Datos del propietario se reutilizan en anos siguientes
- PROP-01: Usuario puede registrar propiedad residencial en Espana
- PROP-02: Usuario puede introducir direccion completa (tipo via, nombre, numero, piso, etc.)
- PROP-03: Usuario puede introducir referencia catastral (20 caracteres)
- PROP-04: Usuario puede introducir valor catastral (con guia visual del IBI)
- PROP-05: Sistema valida formato de referencia catastral
- PROP-06: Usuario puede asignar multiples propietarios a una propiedad con % titularidad
- PROP-07: Sistema valida que % titularidad sume 100%
- PROP-08: Datos de propiedad se reutilizan en anos siguientes

**Success Criteria:**
1. User can register physical person owner with validated NIE and fiscal residence
2. User can register company owner with validated NIF
3. User can register property with complete address and validated cadastral reference
4. User can assign 2+ owners to a property with ownership percentages that sum to 100%
5. Visual guidance shows exactly where to find cadastral value on IBI receipt
6. All entered data persists and is available for reuse in future years

**Notes:**
- NIE validation: X/Y/Z prefix + 7 digits + control letter (checksum algorithm)
- NIF validation: 8 digits + control letter
- Cadastral reference: 20 alphanumeric characters
- Critical: Track cadastral revision TYPE (collective vs individual) for 1.1% vs 2% rate

---

## Phase 3: Imputed Income Declarations

**Goal:** Users can generate complete imputed income declarations for all co-owners of a vacant/personal-use property with a single data entry.

**Dependencies:** Phase 2 (owners and properties must exist)

**Requirements:**
- IMP-01: Usuario puede crear declaracion de renta imputada para una propiedad
- IMP-02: Sistema calcula base imponible (valor catastral x 1.1% o 2%)
- IMP-03: Sistema aplica tasa correcta segun tipo revision catastral (colectiva vs individual)
- IMP-04: Sistema aplica tipo impositivo segun pais residencia (19% UE/EEE, 24% resto)
- IMP-05: Sistema genera declaracion separada por cada copropietario automaticamente
- IMP-06: Sistema calcula impuesto proporcional al % de titularidad
- IMP-07: Usuario puede ver resumen de todas las declaraciones generadas
- IMP-08: Sistema prorratea dias de uso si propiedad no estuvo vacia todo el ano
- MULTI-01: Sistema genera N declaraciones para N copropietarios automaticamente
- MULTI-02: Cada declaracion generada tiene datos consistentes y proporcionales
- MULTI-03: Usuario puede revisar todas las declaraciones antes de pagar
- MULTI-04: Sistema muestra claramente que declaracion corresponde a que propietario

**Success Criteria:**
1. User enters property data once and system generates separate declaration per co-owner
2. Each declaration shows correct proportional tax based on ownership percentage
3. Tax rate correctly applies 19% for EU/EEA residents, 24% for others
4. Cadastral rate correctly applies 1.1% or 2% based on revision type
5. User can see summary of all generated declarations with clear owner attribution
6. Partial year occupancy is correctly prorated in calculations

**Notes:**
- This is the core value proposition: single entry generates multiple declarations
- Rules engine should be configurable for tax rates without code changes
- Tax year selection required (declarations are for previous year)

---

## Phase 4: Rental Income Declarations

**Goal:** Users can generate complete rental income declarations with proper EU/EEA deductions applied automatically.

**Dependencies:** Phase 3 (extends declaration logic)

**Requirements:**
- RENT-01: Usuario puede crear declaracion de renta de alquiler
- RENT-02: Usuario puede introducir ingresos por alquiler del periodo
- RENT-03: Usuario UE/EEE puede introducir gastos deducibles (IBI, comunidad, seguros, reparaciones)
- RENT-04: Sistema calcula base imponible (ingresos - gastos para UE, ingresos brutos para resto)
- RENT-05: Sistema aplica tipo impositivo segun pais residencia (19% UE/EEE, 24% resto)
- RENT-06: Sistema genera declaracion separada por cada copropietario
- RENT-07: Sistema calcula impuesto proporcional al % de titularidad
- RENT-08: Usuario puede declarar periodos parciales de alquiler

**Success Criteria:**
1. User can enter rental income for a property
2. EU/EEA residents can enter deductible expenses (IBI, community fees, insurance, repairs)
3. System correctly calculates net income for EU (income - expenses) vs gross for non-EU
4. Correct tax rate applied based on residence country
5. Separate declaration generated per co-owner with proportional amounts
6. Partial rental periods correctly supported

**Notes:**
- EU/EEA deduction is a key differentiator - must be clear in UI
- Non-EU residents cannot deduct expenses (gross income taxed)
- Same multi-owner splitting logic as Phase 3

---

## Phase 5: Payment and Annual Renewal

**Goal:** Users can pay for declarations and returning users can renew with minimal effort when nothing has changed.

**Dependencies:** Phase 3 or 4 (declarations must exist to pay)

**Requirements:**
- PAY-01: Usuario puede ver precio del servicio antes de pagar
- PAY-02: Usuario puede pagar con tarjeta via Stripe
- PAY-03: Usuario puede pagar con SEPA Direct Debit
- PAY-04: Sistema confirma pago exitoso
- PAY-05: Declaraciones pagadas se encolan para presentacion a AEAT
- RENEW-01: Sistema pre-carga datos de propietarios del ano anterior
- RENEW-02: Sistema pre-carga datos de propiedades del ano anterior
- RENEW-03: Usuario puede confirmar "nada ha cambiado" y proceder a pago
- RENEW-04: Sistema detecta y muestra cambios respecto al ano anterior
- RENEW-05: Usuario puede modificar datos pre-cargados si algo cambio
- NOTIF-01: Sistema envia email de bienvenida al registrarse
- NOTIF-02: Sistema envia confirmacion de pago
- NOTIF-03: Sistema envia confirmacion cuando declaracion es presentada
- NOTIF-04: Sistema envia recordatorio de plazo (30, 14, 7 dias antes)

**Success Criteria:**
1. User sees clear pricing before payment
2. User can pay with credit card via Stripe checkout
3. User can pay with SEPA Direct Debit
4. Returning user sees pre-loaded data from previous year
5. Returning user can confirm "nothing changed" and proceed directly to payment
6. System highlights any detected changes from previous year for review
7. User receives email confirmation after payment
8. User receives deadline reminders at 30, 14, and 7 days before filing deadline

**Notes:**
- This phase delivers the "sirve para siempre" promise
- Stripe handles PCI compliance
- SEPA support critical for European bank accounts
- Notifications can leverage n8n for workflow automation

---

## Phase 6: AEAT Submission and Admin

**Goal:** Paid declarations are submitted to AEAT automatically, and admin can manage the platform and submission queue.

**Dependencies:** Phase 5 (paid declarations required), Colaborador Social approval from AEAT

**Requirements:**
- AEAT-01: Sistema genera XML valido segun especificacion Modelo 210
- AEAT-02: Sistema presenta declaraciones en batch via API Colaborador Social
- AEAT-03: Sistema almacena referencia/CSV de AEAT por cada declaracion
- AEAT-04: Usuario puede ver estado de presentacion (pendiente, presentada, error)
- AEAT-05: Sistema notifica al usuario cuando declaracion es presentada exitosamente
- ADMIN-01: Admin puede ver lista de todas las declaraciones
- ADMIN-02: Admin puede filtrar por estado (borrador, pagada, presentada)
- ADMIN-03: Admin puede actualizar tasas impositivas por ano fiscal
- ADMIN-04: Admin puede actualizar formulas de calculo
- ADMIN-05: Admin puede ver declaraciones pendientes de presentar
- ADMIN-06: Admin puede disparar presentacion batch a AEAT

**Success Criteria:**
1. System generates valid Modelo 210 XML per AEAT specification
2. Admin can trigger batch submission to AEAT
3. Each submitted declaration stores AEAT reference number (CSV)
4. User can see declaration status (draft, paid, submitted, error)
5. User receives notification when declaration is successfully submitted
6. Admin can update tax rates and calculation formulas without code deployment
7. Admin can view and filter all declarations by status

**Notes:**
- Blocked by Colaborador Social approval (initiated in Phase 1)
- If approval delayed, consider Playwright automation as fallback
- Queue-based submission with retry and dead-letter queue
- P12 certificate storage in encrypted vault

---

## Cross-Cutting Concerns

### Accessibility (A11Y-01 to A11Y-09)

Applied to all phases from Phase 1 onward:

| Requirement | Description | Application |
|-------------|-------------|-------------|
| A11Y-01 | 18px+ base typography | Design system |
| A11Y-02 | 48x48px minimum touch targets | All buttons/links |
| A11Y-03 | WCAG 2.1 AA contrast (4.5:1) | All text/backgrounds |
| A11Y-04 | Visible labels (not just placeholders) | All form fields |
| A11Y-05 | Clear inline error messages | All form validation |
| A11Y-06 | Full keyboard navigation | All interactive elements |
| A11Y-07 | Screen reader compatible | Semantic HTML + ARIA |
| A11Y-08 | Visible progress indicators | Multi-step forms |
| A11Y-09 | Auto-save forms | All data entry forms |

### Internationalization (I18N-01 to I18N-06)

Applied to all phases from Phase 1 onward:

| Requirement | Description | Application |
|-------------|-------------|-------------|
| I18N-01 | Spanish interface | All UI text |
| I18N-02 | English interface | All UI text |
| I18N-03 | German interface | All UI text |
| I18N-04 | French interface | All UI text |
| I18N-05 | Correct fiscal terminology | Tax-specific translations |
| I18N-06 | Locale-appropriate formats | Dates, numbers, currency |

---

## Progress

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Foundation | AUTH-01 to AUTH-05, A11Y-*, I18N-* | Pending |
| 2 | Owner and Property Data | OWNER-01 to OWNER-07, PROP-01 to PROP-08 | Pending |
| 3 | Imputed Income Declarations | IMP-01 to IMP-08, MULTI-01 to MULTI-04 | Pending |
| 4 | Rental Income Declarations | RENT-01 to RENT-08 | Pending |
| 5 | Payment and Annual Renewal | PAY-01 to PAY-05, RENEW-01 to RENEW-05, NOTIF-01 to NOTIF-04 | Pending |
| 6 | AEAT Submission and Admin | AEAT-01 to AEAT-05, ADMIN-01 to ADMIN-06 | Pending |

---

## Coverage Summary

**Total v1 requirements:** 62

| Category | Count | Phase |
|----------|-------|-------|
| AUTH | 5 | Phase 1 |
| OWNER | 7 | Phase 2 |
| PROP | 8 | Phase 2 |
| IMP | 8 | Phase 3 |
| MULTI | 4 | Phase 3 |
| RENT | 8 | Phase 4 |
| PAY | 5 | Phase 5 |
| RENEW | 5 | Phase 5 |
| NOTIF | 4 | Phase 5 |
| AEAT | 5 | Phase 6 |
| ADMIN | 6 | Phase 6 |
| A11Y | 9 | All (from Phase 1) |
| I18N | 6 | All (from Phase 1) |

**Mapped:** 62/62
**Orphaned:** 0

---

*Roadmap created: 2026-01-17*
*Last updated: 2026-01-17*
