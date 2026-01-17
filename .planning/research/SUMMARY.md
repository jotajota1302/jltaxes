# Research Summary: JL Taxes Platform

**Project:** Tax filing platform for non-residents in Spain (Modelo 210)
**Researched:** 2026-01-17

---

## Key Findings

### Stack Recomendado

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 15 + TypeScript | SSR, App Router, ecosistema maduro |
| i18n | next-intl | Diseñado para App Router, URLs localizadas |
| Forms | React Hook Form + Zod | Performance, type-safe validation |
| UI | shadcn/ui + Tailwind | Accesible (Radix), customizable para elderly |
| Database | Supabase (PostgreSQL) | Auth integrado, RLS, EU data residency |
| ORM | Drizzle | SQL-like, sin code generation |
| Payments | Stripe | SEPA support, bien documentado |

### AEAT Integration (CRÍTICO)

**AEAT no tiene API pública para Modelo 210.** Las opciones son:

1. **Colaborador Social (RECOMENDADO)** — Registrarse con AEAT para poder presentar en nombre de clientes. Proceso de 6+ meses.
2. **Automatización con Playwright** — Automatizar el portal Sede Electrónica. Más mantenimiento.

**Acción inmediata:** Iniciar proceso de registro como Colaborador Social con AEAT.

### Features Table Stakes

- Declaración Renta Imputada (propiedad vacía)
- Declaración Renta de Alquiler (con deducciones para UE)
- Declaración Plusvalía (venta con retención 3%)
- Multi-propietario: cada copropietario DEBE presentar declaración separada
- Múltiples propiedades por usuario
- Diferenciación tasas 19% UE vs 24% no-UE
- Multi-idioma (ES, EN, DE, FR)
- Recordatorios de plazos
- Validación NIE/NIF con checksum

### Diferenciadores Clave

1. **Zero re-entry** — Datos se reutilizan año tras año
2. **Single entry → Multiple declarations** — Una familia entra datos una vez, sistema genera N declaraciones
3. **Elderly-optimized UX** — Tipografía grande (18px+), alto contraste, un campo por pantalla

### Anti-Features (NO construir)

- App móvil — Web responsive suficiente
- Chatbot IA — Usuarios mayores prefieren soporte humano
- Integración bancaria — Complejidad regulatoria innecesaria
- API directa AEAT por usuario — El cliente presenta como representante
- Optimización fiscal — Riesgo regulatorio

---

## Pitfalls Críticos

| ID | Pitfall | Prevención | Fase |
|----|---------|------------|------|
| CP-1 | AEAT no tiene API pública | Aplicar para Colaborador Social YA | Phase 1 |
| CP-2 | Cada copropietario = declaración separada | Data model many-to-many desde inicio | Phase 1 |
| CP-3 | Confusión valor catastral vs otros valores | Pedir específicamente "Valor Catastral" con imagen IBI | Phase 2 |
| CP-4 | Tasa 1.1% vs 2% (revisión colectiva vs individual) | Trackear TIPO de revisión, no solo fecha | Phase 2 |
| CP-5 | Accesibilidad para mayores | WCAG 2.1 AA desde inicio, testing con 65+ | Todas |

---

## Arquitectura Recomendada

**Modular monolith** con:

1. **Rules Engine** para cálculos fiscales — Admin puede actualizar tasas/fórmulas sin deploy
2. **Database-driven i18n** — Labels de formularios actualizables sin código
3. **Queue-based AEAT submission** — Batch processing con retry y dead-letter queue
4. **Certificate management** — P12 del cliente en vault encriptado

### Data Model Core

```
User → Owner (many)
Owner ↔ Property (many-to-many con %)
Property → Declaration (per tax year)
Declaration → DeclarationOwner (one per owner, proportional tax)
```

### Build Order Sugerido

1. **Foundation:** Database + Auth + User/Owner
2. **Core Entities:** Property + multi-owner
3. **Tax Logic:** Rules Engine + calculations
4. **Declarations:** Form wizard + multi-owner splitting
5. **Payments:** Stripe integration
6. **AEAT:** Batch submission (requiere Colaborador Social)
7. **Automation:** n8n workflows (notificaciones, recordatorios)

---

## Implicaciones para Roadmap

**Fase 1 (Foundation):**
- Aplicar para Colaborador Social INMEDIATAMENTE (blocking dependency)
- Data model many-to-many para Property↔Owner
- Design system accesible (18px base, 48px touch targets)

**Fase 2 (MVP Imputed Income):**
- Solo Renta Imputada primero (caso más común, más simple)
- Multi-owner splitting funcional
- 4 idiomas

**Fase 3 (Rental Income):**
- Añadir Renta de Alquiler
- Deducciones para UE/EEE

**Fase 4 (Integration):**
- AEAT submission (cuando Colaborador Social aprobado)
- O Playwright como fallback

**Fase 5 (Plusvalía):**
- Capital Gains más complejo
- Wizard para devolución 3%

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js + Supabase bien documentados |
| Features | HIGH | Basado en análisis IberianTax + AEAT |
| Accessibility | HIGH | WCAG 2.1 + EAA compliance |
| AEAT Integration | MEDIUM | Sin API pública, requiere más investigación |
| Data Model | HIGH | Basado en ley española de copropietarios |

---

## Sources

- AEAT Sede Electrónica
- IberianTax competitor analysis
- WCAG 2.1 / European Accessibility Act
- json-rules-engine documentation
- Supabase / Next.js documentation
