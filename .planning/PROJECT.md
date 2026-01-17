# JL Taxes

## What This Is

Plataforma web que permite a propietarios extranjeros no residentes en España declarar sus impuestos (Modelo 210) de forma completamente autónoma. Diseñada para personas mayores que necesitan simplicidad extrema, con presentación automática ante Hacienda a través del cliente como representante fiscal.

## Core Value

**Rellenas una vez, sirve para siempre.** Cuando una familia tiene una propiedad con múltiples propietarios, no deberían rellenar el mismo formulario 2, 3, o 4 veces. Entran los datos una vez, se generan todas las declaraciones, y cada año solo confirman que nada cambió.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Gestión de datos:**
- [ ] Usuario puede registrar propiedades con todos los datos catastrales
- [ ] Usuario puede registrar múltiples propietarios por propiedad (con % de titularidad)
- [ ] Usuario puede registrar datos bancarios para pagos/devoluciones
- [ ] Datos se reutilizan automáticamente año tras año
- [ ] Sistema detecta y muestra cambios respecto al año anterior

**Declaraciones Modelo 210:**
- [ ] Usuario puede declarar Renta Imputada (propiedad vacía/uso personal)
- [ ] Usuario puede declarar Renta de Alquiler (con gastos deducibles para UE)
- [ ] Usuario puede declarar Plusvalía (venta de inmueble)
- [ ] Sistema calcula impuesto automáticamente según país de residencia (19% UE vs 24% resto)
- [ ] Sistema genera declaraciones múltiples para copropietarios automáticamente

**Presentación y pago:**
- [ ] Usuario puede pagar el servicio online (Stripe)
- [ ] Declaraciones se presentan en lote vía API AEAT (cliente como representante)
- [ ] Usuario recibe confirmación con número de referencia AEAT

**Experiencia de usuario:**
- [ ] Interfaz en 4 idiomas (ES, EN, DE, FR)
- [ ] Diseño accesible para personas mayores (tipografía grande, alto contraste)
- [ ] Flujo de renovación simplificado ("¿Ha cambiado algo?" → No → Pagar)
- [ ] Progreso guardado automáticamente

**Administración:**
- [ ] Cliente puede actualizar campos obligatorios cuando cambia normativa
- [ ] Cliente puede actualizar fórmulas de cálculo cuando cambian
- [ ] Cliente puede ver/gestionar todas las declaraciones pendientes de presentar
- [ ] Sistema permite presentación en lote ante AEAT

### Out of Scope

- **App móvil** — Web responsive es suficiente para el target
- **Certificado digital del usuario** — Cliente presenta como representante
- **Otros modelos fiscales (714, 720)** — Solo Modelo 210 para v1
- **OCR de documentos** — Simplifica v1, se añade después si hay demanda
- **Asistente de voz TAXIA** — Diferenciador futuro, no crítico para v1
- **Videollamadas con asesor** — El producto debe ser self-service
- **Integración WhatsApp** — Canal futuro, no v1

## Context

**Conocimiento del negocio:**
El cliente lleva años realizando estas gestiones manualmente. Tiene:
- Algoritmos de cálculo de tasas (actualmente en ASP, se migrará)
- Contacto directo con Hacienda para aclarar normativa
- Capacidad de presentar declaraciones en lote como representante fiscal
- Base de clientes existente que atiende manualmente

**Competidor principal:**
IberianTax (iberiantax.com) — 15.000+ usuarios, 4.9/5 en Google. Su debilidad principal es que los usuarios deben reintroducir datos cada año y el proceso para familias con múltiples propietarios es tedioso.

**Infraestructura existente:**
El equipo tiene experiencia con n8n para automatizaciones, lo que puede acelerar desarrollo de flujos de notificaciones y procesos batch.

**Regulación fiscal:**
- Renta Imputada: se presenta año vencido, límite 31 diciembre
- Renta de Alquiler: se presenta año vencido, límite 20 enero
- Plusvalía: 4 meses desde la venta
- Los tipos impositivos y campos obligatorios pueden cambiar anualmente

## Constraints

- **Web only**: No se desarrollará app móvil. La web debe ser responsive pero el target usa principalmente desktop/tablet.
- **4 idiomas desde v1**: ES, EN, DE, FR son obligatorios para cubrir el mercado objetivo.
- **Algoritmo mockeado inicialmente**: El cálculo real está en ASP y se migrará después. Para v1 implementamos la lógica conocida o mockeamos.
- **Cliente como representante**: La presentación a AEAT se hace con el certificado del cliente, no del usuario final.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web only, sin móvil | Target usa desktop/tablet, simplifica desarrollo | — Pending |
| Cliente presenta como representante | Usuarios no necesitan certificado digital, simplifica UX | — Pending |
| 4 idiomas desde v1 | Mercado objetivo es internacional (UK, DE, FR) | — Pending |
| Mockear algoritmo de cálculo | El original está en ASP, migración es esfuerzo separado | — Pending |
| Sin OCR/TAXIA en v1 | Enfoque en core value (no repetición), features premium después | — Pending |

---
*Last updated: 2025-01-17 after initialization*
