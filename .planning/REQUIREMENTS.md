# Requirements: JL Taxes

**Defined:** 2025-01-17
**Core Value:** Rellenas una vez, sirve para siempre. Una familia entra datos una vez, se generan todas las declaraciones.

## v1 Requirements

Requirements para el lanzamiento inicial. Cada uno mapea a fases del roadmap.

### Autenticación y Usuarios

- [ ] **AUTH-01**: Usuario puede registrarse con email y contraseña
- [ ] **AUTH-02**: Usuario puede iniciar sesión y mantener sesión activa
- [ ] **AUTH-03**: Usuario puede recuperar contraseña via email
- [ ] **AUTH-04**: Usuario puede seleccionar idioma preferido (ES/EN/DE/FR)
- [ ] **AUTH-05**: Sesión persiste mínimo 30 días (elderly-friendly)

### Gestión de Propietarios

- [ ] **OWNER-01**: Usuario puede registrar propietario persona física
- [ ] **OWNER-02**: Usuario puede registrar propietario empresa
- [ ] **OWNER-03**: Usuario puede introducir NIE/NIF con validación checksum
- [ ] **OWNER-04**: Usuario puede introducir datos de residencia fiscal (país, dirección)
- [ ] **OWNER-05**: Usuario puede introducir datos bancarios (IBAN para devoluciones)
- [ ] **OWNER-06**: Sistema valida formato NIE/NIF (X/Y/Z + dígitos + letra control)
- [ ] **OWNER-07**: Datos del propietario se reutilizan en años siguientes

### Gestión de Propiedades

- [ ] **PROP-01**: Usuario puede registrar propiedad residencial en España
- [ ] **PROP-02**: Usuario puede introducir dirección completa (tipo vía, nombre, número, piso, etc.)
- [ ] **PROP-03**: Usuario puede introducir referencia catastral (20 caracteres)
- [ ] **PROP-04**: Usuario puede introducir valor catastral (con guía visual del IBI)
- [ ] **PROP-05**: Sistema valida formato de referencia catastral
- [ ] **PROP-06**: Usuario puede asignar múltiples propietarios a una propiedad con % titularidad
- [ ] **PROP-07**: Sistema valida que % titularidad sume 100%
- [ ] **PROP-08**: Datos de propiedad se reutilizan en años siguientes

### Declaración Renta Imputada

- [ ] **IMP-01**: Usuario puede crear declaración de renta imputada para una propiedad
- [ ] **IMP-02**: Sistema calcula base imponible (valor catastral × 1.1% o 2%)
- [ ] **IMP-03**: Sistema aplica tasa correcta según tipo revisión catastral (colectiva vs individual)
- [ ] **IMP-04**: Sistema aplica tipo impositivo según país residencia (19% UE/EEE, 24% resto)
- [ ] **IMP-05**: Sistema genera declaración separada por cada copropietario automáticamente
- [ ] **IMP-06**: Sistema calcula impuesto proporcional al % de titularidad
- [ ] **IMP-07**: Usuario puede ver resumen de todas las declaraciones generadas
- [ ] **IMP-08**: Sistema prorratea días de uso si propiedad no estuvo vacía todo el año

### Declaración Renta de Alquiler

- [ ] **RENT-01**: Usuario puede crear declaración de renta de alquiler
- [ ] **RENT-02**: Usuario puede introducir ingresos por alquiler del período
- [ ] **RENT-03**: Usuario UE/EEE puede introducir gastos deducibles (IBI, comunidad, seguros, reparaciones)
- [ ] **RENT-04**: Sistema calcula base imponible (ingresos - gastos para UE, ingresos brutos para resto)
- [ ] **RENT-05**: Sistema aplica tipo impositivo según país residencia (19% UE/EEE, 24% resto)
- [ ] **RENT-06**: Sistema genera declaración separada por cada copropietario
- [ ] **RENT-07**: Sistema calcula impuesto proporcional al % de titularidad
- [ ] **RENT-08**: Usuario puede declarar períodos parciales de alquiler

### Multi-Propietario

- [ ] **MULTI-01**: Sistema genera N declaraciones para N copropietarios automáticamente
- [ ] **MULTI-02**: Cada declaración generada tiene datos consistentes y proporcionales
- [ ] **MULTI-03**: Usuario puede revisar todas las declaraciones antes de pagar
- [ ] **MULTI-04**: Sistema muestra claramente qué declaración corresponde a qué propietario

### Renovación Anual

- [ ] **RENEW-01**: Sistema pre-carga datos de propietarios del año anterior
- [ ] **RENEW-02**: Sistema pre-carga datos de propiedades del año anterior
- [ ] **RENEW-03**: Usuario puede confirmar "nada ha cambiado" y proceder a pago
- [ ] **RENEW-04**: Sistema detecta y muestra cambios respecto al año anterior
- [ ] **RENEW-05**: Usuario puede modificar datos pre-cargados si algo cambió

### Pago y Presentación

- [ ] **PAY-01**: Usuario puede ver precio del servicio antes de pagar
- [ ] **PAY-02**: Usuario puede pagar con tarjeta via Stripe
- [ ] **PAY-03**: Usuario puede pagar con SEPA Direct Debit
- [ ] **PAY-04**: Sistema confirma pago exitoso
- [ ] **PAY-05**: Declaraciones pagadas se encolan para presentación a AEAT

### Integración AEAT

- [ ] **AEAT-01**: Sistema genera XML válido según especificación Modelo 210
- [ ] **AEAT-02**: Sistema presenta declaraciones en batch via API Colaborador Social
- [ ] **AEAT-03**: Sistema almacena referencia/CSV de AEAT por cada declaración
- [ ] **AEAT-04**: Usuario puede ver estado de presentación (pendiente, presentada, error)
- [ ] **AEAT-05**: Sistema notifica al usuario cuando declaración es presentada exitosamente

### Accesibilidad (Elderly-Optimized)

- [ ] **A11Y-01**: Tipografía base mínimo 18px en toda la aplicación
- [ ] **A11Y-02**: Botones con área de toque mínimo 48x48px
- [ ] **A11Y-03**: Contraste cumple WCAG 2.1 AA (4.5:1 para texto normal)
- [ ] **A11Y-04**: Labels siempre visibles (no solo placeholders)
- [ ] **A11Y-05**: Errores de formulario claros e inline
- [ ] **A11Y-06**: Navegación completa por teclado
- [ ] **A11Y-07**: Compatible con lectores de pantalla
- [ ] **A11Y-08**: Progreso de formulario siempre visible
- [ ] **A11Y-09**: Guardado automático de formularios

### Internacionalización

- [ ] **I18N-01**: Interfaz disponible en español
- [ ] **I18N-02**: Interfaz disponible en inglés
- [ ] **I18N-03**: Interfaz disponible en alemán
- [ ] **I18N-04**: Interfaz disponible en francés
- [ ] **I18N-05**: Terminología fiscal traducida correctamente (no literal)
- [ ] **I18N-06**: Formatos de fecha y número según locale del usuario

### Notificaciones

- [ ] **NOTIF-01**: Sistema envía email de bienvenida al registrarse
- [ ] **NOTIF-02**: Sistema envía confirmación de pago
- [ ] **NOTIF-03**: Sistema envía confirmación cuando declaración es presentada
- [ ] **NOTIF-04**: Sistema envía recordatorio de plazo (30, 14, 7 días antes)

### Panel Admin (Cliente)

- [ ] **ADMIN-01**: Admin puede ver lista de todas las declaraciones
- [ ] **ADMIN-02**: Admin puede filtrar por estado (borrador, pagada, presentada)
- [ ] **ADMIN-03**: Admin puede actualizar tasas impositivas por año fiscal
- [ ] **ADMIN-04**: Admin puede actualizar fórmulas de cálculo
- [ ] **ADMIN-05**: Admin puede ver declaraciones pendientes de presentar
- [ ] **ADMIN-06**: Admin puede disparar presentación batch a AEAT

## v2 Requirements

Diferidos para futuras versiones. Tracked pero no en roadmap actual.

### Plusvalía

- **PLUS-01**: Usuario puede declarar venta de inmueble
- **PLUS-02**: Sistema calcula ganancia patrimonial
- **PLUS-03**: Sistema gestiona retención del 3%
- **PLUS-04**: Wizard para solicitar devolución del 3%

### Automatización Avanzada

- **AUTO-01**: OCR para extracción de datos de recibo IBI
- **AUTO-02**: OCR para extracción de NIE/pasaporte
- **AUTO-03**: Recordatorios via WhatsApp
- **AUTO-04**: Recordatorios via SMS

### Asistente TAXIA

- **TAXIA-01**: Chatbot para dudas fiscales
- **TAXIA-02**: Guía por voz del proceso
- **TAXIA-03**: Detección de frustración → escalado humano

### Admin Avanzado

- **ADMIN-07**: Dashboard con métricas (usuarios, declaraciones, ingresos)
- **ADMIN-08**: Gestión de usuarios (activar/desactivar)
- **ADMIN-09**: Exportación de datos

## Out of Scope

Explícitamente excluido. Documentado para prevenir scope creep.

| Feature | Reason |
|---------|--------|
| App móvil | Web responsive suficiente; target usa desktop/tablet |
| Certificado digital del usuario | Cliente presenta como representante fiscal |
| Otros modelos fiscales (714, 720) | Solo Modelo 210 para v1 |
| Login social (Google, Apple) | Usuarios mayores no suelen tenerlo; añade confusión |
| Multi-currency | Todos los impuestos españoles son en EUR |
| Integración bancaria PSD2 | Complejidad regulatoria innecesaria |
| Optimización fiscal automática | Riesgo regulatorio |
| Videollamadas con asesor | Producto debe ser self-service |

## Traceability

Qué fases cubren qué requirements. Se actualiza durante creación del roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 to AUTH-05 | Phase 1 | Pending |
| OWNER-01 to OWNER-07 | Phase 2 | Pending |
| PROP-01 to PROP-08 | Phase 2 | Pending |
| IMP-01 to IMP-08 | Phase 3 | Pending |
| MULTI-01 to MULTI-04 | Phase 3 | Pending |
| RENT-01 to RENT-08 | Phase 4 | Pending |
| RENEW-01 to RENEW-05 | Phase 5 | Pending |
| PAY-01 to PAY-05 | Phase 5 | Pending |
| AEAT-01 to AEAT-05 | Phase 6 | Pending |
| A11Y-01 to A11Y-09 | All Phases | Pending |
| I18N-01 to I18N-06 | All Phases | Pending |
| NOTIF-01 to NOTIF-04 | Phase 5 | Pending |
| ADMIN-01 to ADMIN-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 62 total
- Mapped to phases: 62
- Unmapped: 0 ✓

---
*Requirements defined: 2025-01-17*
*Last updated: 2025-01-17 after initial definition*
