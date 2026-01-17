# Requirements: JL Taxes

**Defined:** 2025-01-17
**Core Value:** Rellenas una vez, sirve para siempre. Una familia entra datos una vez, se generan todas las declaraciones.

## v1 Requirements

Requirements para el lanzamiento inicial. Cada uno mapea a fases del roadmap.

### Autenticacion y Usuarios

- [ ] **AUTH-01**: Usuario puede registrarse con email y contrasena
- [ ] **AUTH-02**: Usuario puede iniciar sesion y mantener sesion activa
- [ ] **AUTH-03**: Usuario puede recuperar contrasena via email
- [ ] **AUTH-04**: Usuario puede seleccionar idioma preferido (ES/EN/DE/FR)
- [ ] **AUTH-05**: Sesion persiste minimo 30 dias (elderly-friendly)

### Gestion de Propietarios

- [ ] **OWNER-01**: Usuario puede registrar propietario persona fisica
- [ ] **OWNER-02**: Usuario puede registrar propietario empresa
- [ ] **OWNER-03**: Usuario puede introducir NIE/NIF con validacion checksum
- [ ] **OWNER-04**: Usuario puede introducir datos de residencia fiscal (pais, direccion)
- [ ] **OWNER-05**: Usuario puede introducir datos bancarios (IBAN para devoluciones)
- [ ] **OWNER-06**: Sistema valida formato NIE/NIF (X/Y/Z + digitos + letra control)
- [ ] **OWNER-07**: Datos del propietario se reutilizan en anos siguientes

### Gestion de Propiedades

- [ ] **PROP-01**: Usuario puede registrar propiedad residencial en Espana
- [ ] **PROP-02**: Usuario puede introducir direccion completa (tipo via, nombre, numero, piso, etc.)
- [ ] **PROP-03**: Usuario puede introducir referencia catastral (20 caracteres)
- [ ] **PROP-04**: Usuario puede introducir valor catastral (con guia visual del IBI)
- [ ] **PROP-05**: Sistema valida formato de referencia catastral
- [ ] **PROP-06**: Usuario puede asignar multiples propietarios a una propiedad con % titularidad
- [ ] **PROP-07**: Sistema valida que % titularidad sume 100%
- [ ] **PROP-08**: Datos de propiedad se reutilizan en anos siguientes

### Declaracion Renta Imputada

- [ ] **IMP-01**: Usuario puede crear declaracion de renta imputada para una propiedad
- [ ] **IMP-02**: Sistema calcula base imponible (valor catastral x 1.1% o 2%)
- [ ] **IMP-03**: Sistema aplica tasa correcta segun tipo revision catastral (colectiva vs individual)
- [ ] **IMP-04**: Sistema aplica tipo impositivo segun pais residencia (19% UE/EEE, 24% resto)
- [ ] **IMP-05**: Sistema genera declaracion separada por cada copropietario automaticamente
- [ ] **IMP-06**: Sistema calcula impuesto proporcional al % de titularidad
- [ ] **IMP-07**: Usuario puede ver resumen de todas las declaraciones generadas
- [ ] **IMP-08**: Sistema prorratea dias de uso si propiedad no estuvo vacia todo el ano

### Declaracion Renta de Alquiler

- [ ] **RENT-01**: Usuario puede crear declaracion de renta de alquiler
- [ ] **RENT-02**: Usuario puede introducir ingresos por alquiler del periodo
- [ ] **RENT-03**: Usuario UE/EEE puede introducir gastos deducibles (IBI, comunidad, seguros, reparaciones)
- [ ] **RENT-04**: Sistema calcula base imponible (ingresos - gastos para UE, ingresos brutos para resto)
- [ ] **RENT-05**: Sistema aplica tipo impositivo segun pais residencia (19% UE/EEE, 24% resto)
- [ ] **RENT-06**: Sistema genera declaracion separada por cada copropietario
- [ ] **RENT-07**: Sistema calcula impuesto proporcional al % de titularidad
- [ ] **RENT-08**: Usuario puede declarar periodos parciales de alquiler

### Multi-Propietario

- [ ] **MULTI-01**: Sistema genera N declaraciones para N copropietarios automaticamente
- [ ] **MULTI-02**: Cada declaracion generada tiene datos consistentes y proporcionales
- [ ] **MULTI-03**: Usuario puede revisar todas las declaraciones antes de pagar
- [ ] **MULTI-04**: Sistema muestra claramente que declaracion corresponde a que propietario

### Renovacion Anual

- [ ] **RENEW-01**: Sistema pre-carga datos de propietarios del ano anterior
- [ ] **RENEW-02**: Sistema pre-carga datos de propiedades del ano anterior
- [ ] **RENEW-03**: Usuario puede confirmar "nada ha cambiado" y proceder a pago
- [ ] **RENEW-04**: Sistema detecta y muestra cambios respecto al ano anterior
- [ ] **RENEW-05**: Usuario puede modificar datos pre-cargados si algo cambio

### Pago y Presentacion

- [ ] **PAY-01**: Usuario puede ver precio del servicio antes de pagar
- [ ] **PAY-02**: Usuario puede pagar con tarjeta via Stripe
- [ ] **PAY-03**: Usuario puede pagar con SEPA Direct Debit
- [ ] **PAY-04**: Sistema confirma pago exitoso
- [ ] **PAY-05**: Declaraciones pagadas se encolan para presentacion a AEAT

### Integracion AEAT

- [ ] **AEAT-01**: Sistema genera XML valido segun especificacion Modelo 210
- [ ] **AEAT-02**: Sistema presenta declaraciones en batch via API Colaborador Social
- [ ] **AEAT-03**: Sistema almacena referencia/CSV de AEAT por cada declaracion
- [ ] **AEAT-04**: Usuario puede ver estado de presentacion (pendiente, presentada, error)
- [ ] **AEAT-05**: Sistema notifica al usuario cuando declaracion es presentada exitosamente

### Accesibilidad (Elderly-Optimized)

- [ ] **A11Y-01**: Tipografia base minimo 18px en toda la aplicacion
- [ ] **A11Y-02**: Botones con area de toque minimo 48x48px
- [ ] **A11Y-03**: Contraste cumple WCAG 2.1 AA (4.5:1 para texto normal)
- [ ] **A11Y-04**: Labels siempre visibles (no solo placeholders)
- [ ] **A11Y-05**: Errores de formulario claros e inline
- [ ] **A11Y-06**: Navegacion completa por teclado
- [ ] **A11Y-07**: Compatible con lectores de pantalla
- [ ] **A11Y-08**: Progreso de formulario siempre visible
- [ ] **A11Y-09**: Guardado automatico de formularios

### Internacionalizacion

- [ ] **I18N-01**: Interfaz disponible en espanol
- [ ] **I18N-02**: Interfaz disponible en ingles
- [ ] **I18N-03**: Interfaz disponible en aleman
- [ ] **I18N-04**: Interfaz disponible en frances
- [ ] **I18N-05**: Terminologia fiscal traducida correctamente (no literal)
- [ ] **I18N-06**: Formatos de fecha y numero segun locale del usuario

### Notificaciones

- [ ] **NOTIF-01**: Sistema envia email de bienvenida al registrarse
- [ ] **NOTIF-02**: Sistema envia confirmacion de pago
- [ ] **NOTIF-03**: Sistema envia confirmacion cuando declaracion es presentada
- [ ] **NOTIF-04**: Sistema envia recordatorio de plazo (30, 14, 7 dias antes)

### Panel Admin (Cliente)

- [ ] **ADMIN-01**: Admin puede ver lista de todas las declaraciones
- [ ] **ADMIN-02**: Admin puede filtrar por estado (borrador, pagada, presentada)
- [ ] **ADMIN-03**: Admin puede actualizar tasas impositivas por ano fiscal
- [ ] **ADMIN-04**: Admin puede actualizar formulas de calculo
- [ ] **ADMIN-05**: Admin puede ver declaraciones pendientes de presentar
- [ ] **ADMIN-06**: Admin puede disparar presentacion batch a AEAT

## v2 Requirements

Diferidos para futuras versiones. Tracked pero no en roadmap actual.

### Plusvalia

- **PLUS-01**: Usuario puede declarar venta de inmueble
- **PLUS-02**: Sistema calcula ganancia patrimonial
- **PLUS-03**: Sistema gestiona retencion del 3%
- **PLUS-04**: Wizard para solicitar devolucion del 3%

### Automatizacion Avanzada

- **AUTO-01**: OCR para extraccion de datos de recibo IBI
- **AUTO-02**: OCR para extraccion de NIE/pasaporte
- **AUTO-03**: Recordatorios via WhatsApp
- **AUTO-04**: Recordatorios via SMS

### Asistente TAXIA

- **TAXIA-01**: Chatbot para dudas fiscales
- **TAXIA-02**: Guia por voz del proceso
- **TAXIA-03**: Deteccion de frustracion -> escalado humano

### Admin Avanzado

- **ADMIN-07**: Dashboard con metricas (usuarios, declaraciones, ingresos)
- **ADMIN-08**: Gestion de usuarios (activar/desactivar)
- **ADMIN-09**: Exportacion de datos

## Out of Scope

Explicitamente excluido. Documentado para prevenir scope creep.

| Feature | Reason |
|---------|--------|
| App movil | Web responsive suficiente; target usa desktop/tablet |
| Certificado digital del usuario | Cliente presenta como representante fiscal |
| Otros modelos fiscales (714, 720) | Solo Modelo 210 para v1 |
| Login social (Google, Apple) | Usuarios mayores no suelen tenerlo; anade confusion |
| Multi-currency | Todos los impuestos espanoles son en EUR |
| Integracion bancaria PSD2 | Complejidad regulatoria innecesaria |
| Optimizacion fiscal automatica | Riesgo regulatorio |
| Videollamadas con asesor | Producto debe ser self-service |

## Traceability

Que fases cubren que requirements. Actualizado con roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 to AUTH-05 | Phase 1: Foundation | Pending |
| OWNER-01 to OWNER-07 | Phase 2: Owner and Property Data | Pending |
| PROP-01 to PROP-08 | Phase 2: Owner and Property Data | Pending |
| IMP-01 to IMP-08 | Phase 3: Imputed Income Declarations | Pending |
| MULTI-01 to MULTI-04 | Phase 3: Imputed Income Declarations | Pending |
| RENT-01 to RENT-08 | Phase 4: Rental Income Declarations | Pending |
| PAY-01 to PAY-05 | Phase 5: Payment and Annual Renewal | Pending |
| RENEW-01 to RENEW-05 | Phase 5: Payment and Annual Renewal | Pending |
| NOTIF-01 to NOTIF-04 | Phase 5: Payment and Annual Renewal | Pending |
| AEAT-01 to AEAT-05 | Phase 6: AEAT Submission and Admin | Pending |
| ADMIN-01 to ADMIN-06 | Phase 6: AEAT Submission and Admin | Pending |
| A11Y-01 to A11Y-09 | All Phases (from Phase 1) | Pending |
| I18N-01 to I18N-06 | All Phases (from Phase 1) | Pending |

**Coverage:**
- v1 requirements: 62 total
- Mapped to phases: 62
- Unmapped: 0

---
*Requirements defined: 2025-01-17*
*Last updated: 2026-01-17 after roadmap creation*
