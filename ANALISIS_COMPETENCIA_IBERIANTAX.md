# Análisis de Competencia: IberianTax
## Proyecto: Plataforma de Declaración de Impuestos para No Residentes en España

**Fecha de análisis:** Enero 2025
**Competidor analizado:** [IberianTax](https://www.iberiantax.com)
**Método:** Web scraping + análisis de dashboard con Playwright

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Análisis del Competidor](#2-análisis-del-competidor)
3. [Estructura del Dashboard](#3-estructura-del-dashboard)
4. [Flujo del Modelo 210](#4-flujo-del-modelo-210)
5. [Análisis de Formularios](#5-análisis-de-formularios)
6. [Debilidades y Oportunidades](#6-debilidades-y-oportunidades)
7. [Propuesta de Valor Diferencial](#7-propuesta-de-valor-diferencial)
8. [Plan de Desarrollo](#8-plan-de-desarrollo)
9. [Stack Tecnológico Recomendado](#9-stack-tecnológico-recomendado)
10. [Arquitectura n8n y Agentización](#10-arquitectura-n8n-y-agentización)
11. [Anexos](#11-anexos)

---

## 1. Resumen Ejecutivo

### 1.1 Objetivo del Proyecto

Desarrollar una plataforma web que permita a propietarios extranjeros de inmuebles en España declarar sus impuestos (Modelo 210) de forma sencilla, con especial foco en:

- **Accesibilidad** para personas mayores
- **Reutilización de datos** año tras año
- **Asistencia virtual** con guía por voz
- **Experiencia de usuario simplificada**

### 1.2 Competidor Principal

| Aspecto | IberianTax |
|---------|------------|
| **URL** | https://www.iberiantax.com |
| **Usuarios** | +15.000 propietarios |
| **Valoración** | 4.9/5 (795 reseñas Google) |
| **Acreditación** | Colaborador oficial AEAT |
| **Idiomas** | Inglés, Alemán, Francés, Español |

### 1.3 Oportunidad de Mercado

IberianTax tiene una buena propuesta pero carece de:
- Accesibilidad real para personas mayores
- Asistente de voz o guía interactiva
- Renovación simplificada (1-click)
- OCR para extracción automática de documentos

**Conclusión:** Existe espacio para una alternativa enfocada en la experiencia del usuario mayor y la simplicidad extrema.

---

## 2. Análisis del Competidor

### 2.1 Modelo de Negocio

IberianTax opera bajo un modelo de **pago por servicio** sin suscripciones:

| Servicio | Precio (IVA inc.) | Descripción |
|----------|-------------------|-------------|
| Cálculo fiscal | **Gratis** | Calculadora sin compromiso |
| Renta Imputada | **€34,95** | Propiedad vacía o uso personal |
| Renta de Alquiler | **€79,95** | Alquileres vacacionales o largo plazo |
| Plusvalía (Capital Gains) | **€149,95** | Venta de inmuebles |
| Garajes/Trasteros | **desde €29,95** | Declaraciones separadas |

**Comparativa con gestorías tradicionales:** €200-500 por servicio similar.

### 2.2 Propuesta de Valor Actual

IberianTax se posiciona con:

1. **Rapidez:** "File your taxes in less than 10 minutes"
2. **Transparencia:** Precios claros sin costes ocultos
3. **Confianza:** Colaborador oficial de la Agencia Tributaria
4. **Multi-idioma:** Soporte en 4 idiomas europeos
5. **Automatización:** Presentación telemática directa ante AEAT

### 2.3 Público Objetivo

- Propietarios no residentes de inmuebles en España
- Principalmente británicos, alemanes, franceses
- Jubilados con segunda residencia
- Inversores inmobiliarios extranjeros

### 2.4 Tipos de Impuestos Gestionados

| Tipo | Descripción | Plazo |
|------|-------------|-------|
| **Renta Imputada** | Propiedad vacía o uso personal. Base: 1.1%-2% del valor catastral | 31 diciembre año siguiente |
| **Renta de Alquiler** | Ingresos por alquiler. Tipo: 19% (UE) / 24% (resto) | 20 enero año siguiente |
| **Plusvalía** | Venta de inmueble. Tipo: 19% sobre ganancia | 4 meses desde venta |

### 2.5 Tasas Impositivas

```
┌─────────────────────────────────────────────────────────────────┐
│  RENTA IMPUTADA                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Base imponible = Valor catastral × 1.1% (o 2% si no revisado) │
│  Impuesto = Base imponible × 19% (UE) o 24% (resto)            │
│                                                                 │
│  Ejemplo: Valor catastral 100.000€                              │
│  Base = 100.000 × 1.1% = 1.100€                                 │
│  Impuesto (UE) = 1.100 × 19% = 209€/año                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  RENTA DE ALQUILER                                              │
│  ─────────────────────────────────────────────────────────────  │
│  Residentes UE/EEE: 19% sobre (ingresos - gastos deducibles)   │
│  Resto del mundo: 24% sobre ingresos brutos (sin deducciones)  │
│                                                                 │
│  Gastos deducibles (solo UE):                                   │
│  • IBI, comunidad, seguros                                      │
│  • Reparaciones y mantenimiento                                 │
│  • Intereses hipotecarios                                       │
│  • Suministros (luz, agua, gas)                                 │
│  • Comisiones de gestión                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PLUSVALÍA (CAPITAL GAINS)                                      │
│  ─────────────────────────────────────────────────────────────  │
│  Impuesto = (Precio venta - Precio compra - Gastos) × 19%      │
│                                                                 │
│  Retención del 3%: El comprador retiene 3% del precio          │
│  y lo ingresa a Hacienda. Se recupera si el impuesto           │
│  final es menor.                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Estructura del Dashboard

### 3.1 Navegación Principal

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  ├── Logo                                                       │
│  ├── Pricing                                                    │
│  ├── Contact                                                    │
│  ├── Help Desk                                                  │
│  ├── Calendar (plazos fiscales)                                 │
│  ├── Selector de idioma (EN/DE/FR/ES)                          │
│  └── My Account                                                 │
├─────────────────────────────────────────────────────────────────┤
│  SIDEBAR                                                        │
│  ├── Get Started (CTA principal)                                │
│  ├── Home                                                       │
│  ├── Forms                                                      │
│  ├── Properties                                                 │
│  ├── Owners                                                     │
│  ├── Rentals                                                    │
│  ├── Referral                                                   │
│  ├── Benefits                                                   │
│  └── Logout                                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Módulos del Dashboard

#### HOME (Dashboard Principal)
- Mensaje de bienvenida personalizado
- Card de "In Progress" con formularios pendientes
- Indicador de progreso (%)
- CTA "Start Modelo 210"
- Programa de referidos
- Accesos rápidos a soporte y otros servicios

#### FORMS (Gestión de Formularios)
- Tabla con todos los formularios creados
- Filtros: Reference, Type, Tax Year, Quarter, Status
- Estados: Not filed, Pending, Filed
- **Automatic Filing:** Pestaña para programar declaraciones anuales automáticas

#### PROPERTIES (Propiedades)
- Lista de propiedades registradas
- Botón para añadir nueva propiedad
- Información catastral y de dirección

#### OWNERS (Propietarios)
- Lista de propietarios registrados
- Soporte para personas y empresas
- Datos personales y bancarios

#### RENTALS (Datos de Alquiler)
- Gestión de períodos de alquiler
- Ingresos y gastos por propiedad

#### HELP DESK (Centro de Ayuda)
- FAQ organizado por categorías
- Buscador de preguntas
- Blog con artículos
- Contacto directo

#### CALENDAR (Plazos Fiscales)
- Selector de año fiscal
- Plazos por tipo de declaración
- Información de períodos de presentación

---

## 4. Flujo del Modelo 210

### 4.1 Selección de Tipo de Ingreso

```
┌─────────────────────────────────────────────────────────────────┐
│  ¿Qué tipo de ingreso desea declarar?                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  IMPUTED    │  │   RENTAL    │  │  CAPITAL    │              │
│  │  INCOME     │  │   INCOME    │  │   GAINS     │              │
│  │             │  │             │  │             │              │
│  │ Propiedad   │  │ Ingresos    │  │ Venta de    │              │
│  │ vacía o     │  │ por         │  │ propiedad   │              │
│  │ uso propio  │  │ alquiler    │  │             │              │
│  │             │  │             │  │             │              │
│  │ [Start]     │  │ [Start]     │  │ [Start]     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  "What info do I need?" (enlace informativo en cada opción)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de 4 Pasos (Imputed Income)

```
PASO 1: Previous Data          PASO 2: Owners
┌────────────────────┐         ┌────────────────────┐
│ • Tax Year         │         │ • Datos personales │
│ • Number of Owners │   ───>  │ • Dirección        │
│                    │         │ • Contacto         │
└────────────────────┘         └────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
PASO 4: Review & Submit        PASO 3: Property
┌────────────────────┐         ┌────────────────────┐
│ • Resumen datos    │         │ • Dirección España │
│ • Cálculo impuesto │   <───  │ • Ref. catastral   │
│ • Método de pago   │         │ • Valor catastral  │
│ • Confirmación     │         │ • Días de uso      │
└────────────────────┘         └────────────────────┘
```

### 4.3 Tiempo Estimado por IberianTax

| Paso | Descripción | Tiempo |
|------|-------------|--------|
| 1 | Register for free | 1-2 min |
| 2 | Fill out your information | 4-5 min |
| 3 | Review, pay & file | 2-3 min |
| **Total** | | **<10 min** |

---

## 5. Análisis de Formularios

### 5.1 Formulario de Propiedad

```yaml
Property Type:
  - Residential Property (default)
  - Garage/Storage Room
  - Commercial Property

Address:
  Type of street: [Dropdown: Calle, Avenida, Plaza, Paseo, etc.]
  Street name: [Text] *
  Type of number: [Number | Kilometer | Without Number]
  Number: [Text] *
  Block: [Text]
  Doorway: [Text]
  Staircase: [Text]
  Floor: [Text]
  Door: [Text]
  Supplementary data: [Text]
  Province: [Dropdown con todas las provincias] *
  Municipality: [Dropdown dependiente de provincia] *
  Postcode: [Text] *

Tax Data:
  Cadastral reference: [Text 20 chars] * (con enlace "What's this?")
  Cadastral value: [Number] € (con enlace "What's this?")
  Purchase date: [Date picker: Month/Day/Year]
  Purchase price: [Number] €

  [ ] I sold the property
```

### 5.2 Formulario de Propietario (Persona)

```yaml
Type of owner:
  - Person (default)
  - Company

Personal details:
  First and Middle Name: [Text] *
  Last Name: [Text] *
  Spanish NIE or NIF: [Text, placeholder: "e.g. X9464187D"] *
  Tax Residence Country: [Dropdown países] *
  Place of Birth (City or Town): [Text] *
  Country of Birth: [Dropdown países] *
  Date of Birth: [Date picker: Month/Day/Year] *
  Email address: [Email]
  Phone Number: [Tel]

Address in country of residence:
  Address Line 1: [Text] *
  Address Line 2: [Text]
  City/Town: [Text] *
  Postcode: [Text] *
  Province/Region/State: [Text] *
  Country: [Dropdown países] *

Bank Account details:
  IBAN: [Text]
  BIC/SWIFT: [Text]
```

### 5.3 Campos Obligatorios Identificados

**Para declarar Renta Imputada se necesita:**

| Categoría | Campos Obligatorios |
|-----------|---------------------|
| **Propietario** | Nombre, Apellidos, NIE/NIF, País residencia, Lugar nacimiento, País nacimiento, Fecha nacimiento, Dirección completa |
| **Propiedad** | Tipo vía, Nombre vía, Número, Provincia, Municipio, CP, Referencia catastral |
| **Declaración** | Año fiscal, Valor catastral, Días de uso/vacío |

---

## 6. Debilidades y Oportunidades

### 6.1 Debilidades de IberianTax

| # | Debilidad | Impacto | Severidad |
|---|-----------|---------|-----------|
| 1 | Formularios largos sin guardado parcial visible | Pérdida de datos, frustración | Alta |
| 2 | Sin asistencia contextual en tiempo real | Abandonos por confusión | Alta |
| 3 | Tipografía pequeña (14px base) | Difícil para mayores | Alta |
| 4 | Sin opción de entrada por voz | Barrera de accesibilidad | Media |
| 5 | Campos técnicos sin explicación clara | Errores de entrada | Media |
| 6 | Sin indicador de tiempo restante | Incertidumbre del usuario | Baja |
| 7 | Múltiples propietarios = duplicar formularios | Tedioso y propenso a errores | Media |
| 8 | Sin OCR para documentos | Entrada manual lenta | Media |
| 9 | Renovación requiere reintroducir datos | Fricción innecesaria | Alta |
| 10 | Sin soporte por videollamada | Limitado para casos complejos | Baja |

### 6.2 Matriz de Oportunidades

```
                    IMPACTO EN USUARIO
                    Bajo         Alto
                ┌───────────┬───────────┐
         Bajo   │ Indicador │ OCR docs  │
    ESFUERZO    │ tiempo    │ Videocall │
    DESARROLLO  ├───────────┼───────────┤
         Alto   │ Más       │ Asistente │
                │ idiomas   │ voz + IA  │
                └───────────┴───────────┘
```

**Quick Wins (Alto impacto, Bajo esfuerzo):**
- Tipografía grande y alto contraste
- Guardado automático de formularios
- Tooltips explicativos en campos técnicos
- Renovación con datos pre-cargados

**Diferenciadores Estratégicos (Alto impacto, Alto esfuerzo):**
- Asistente virtual con voz
- OCR para documentos (IBI, escrituras)
- Integración directa con AEAT

---

## 7. Propuesta de Valor Diferencial

### 7.1 Posicionamiento

> **"La forma más fácil de declarar tus impuestos en España. Diseñada para que cualquiera pueda hacerlo."**

### 7.2 Pilares Diferenciales

#### PILAR 1: Accesibilidad Total

```
┌─────────────────────────────────────────────────────────────────┐
│  MODO ACCESIBLE (Activable con un toggle)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  VISUAL                                                         │
│  ├── Tipografía mínima: 20px (vs 14px competencia)             │
│  ├── Escalable hasta 32px                                       │
│  ├── Contraste WCAG AAA (ratio 7:1)                            │
│  ├── Modo alto contraste                                        │
│  ├── Modo daltonismo (protanopia, deuteranopia)                │
│  └── Reducción de movimiento                                    │
│                                                                 │
│  INTERACCIÓN                                                    │
│  ├── Botones mínimo 64x64px (vs 40px estándar)                 │
│  ├── Áreas de toque generosas                                   │
│  ├── Navegación completa por teclado                           │
│  ├── Compatible con lectores de pantalla                        │
│  └── Skip links para navegación rápida                          │
│                                                                 │
│  SIMPLIFICACIÓN                                                 │
│  ├── Un campo por pantalla (wizard simplificado)               │
│  ├── Progreso siempre visible                                   │
│  ├── Botones grandes "Anterior" / "Siguiente"                  │
│  └── Confirmación clara de cada acción                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### PILAR 2: Asistente Virtual "TAXIA"

```
┌─────────────────────────────────────────────────────────────────┐
│  ASISTENTE VIRTUAL TAXIA                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CAPACIDADES DE VOZ                                             │
│  ├── Text-to-Speech: Lee instrucciones en voz alta             │
│  ├── Speech-to-Text: Dicta datos en lugar de escribir          │
│  ├── Comandos de voz: "Siguiente", "Atrás", "Ayuda"            │
│  └── Pronunciación clara y pausada                              │
│                                                                 │
│  INTELIGENCIA ARTIFICIAL                                        │
│  ├── Respuestas a dudas fiscales en tiempo real                │
│  ├── Explicaciones en lenguaje sencillo                         │
│  ├── Detección de frustración → ofrecer ayuda humana           │
│  └── Sugerencias proactivas                                     │
│                                                                 │
│  COMUNICACIÓN                                                   │
│  ├── Chat en la aplicación                                      │
│  ├── Recordatorios por WhatsApp                                 │
│  ├── Recordatorios por SMS                                      │
│  ├── Recordatorios por email                                    │
│  └── Llamada telefónica automatizada (opcional)                │
│                                                                 │
│  ESCALADO HUMANO                                                │
│  ├── "¿Prefieres hablar con una persona?"                      │
│  ├── Videollamada con asesor                                    │
│  └── Callback programado                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### PILAR 3: Renovación 1-Click

```
┌─────────────────────────────────────────────────────────────────┐
│  EXPERIENCIA AÑO 1 vs AÑO 2+                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AÑO 1 (Primera declaración)                                    │
│  ─────────────────────────────                                  │
│  • Registro completo                                            │
│  • Introducir todos los datos                                   │
│  • ~10-15 minutos                                               │
│  • Se guardan todos los datos para futuro                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  AÑO 2+ (Renovación)                                            │
│  ─────────────────────────────                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │  "Hola María, es hora de tu declaración 2025.          │    │
│  │   Tus datos del año pasado están listos:"              │    │
│  │                                                         │    │
│  │   ✓ Propiedad: Calle Sol 15, Málaga                    │    │
│  │   ✓ Propietarios: María García (50%), Juan López (50%) │    │
│  │   ✓ Valor catastral: 85.000€                           │    │
│  │   ✓ Uso: Personal (365 días)                           │    │
│  │                                                         │    │
│  │   Impuesto estimado: 127,50€                           │    │
│  │   (Igual que 2024)                                      │    │
│  │                                                         │    │
│  │   ¿Ha cambiado algo este año?                          │    │
│  │                                                         │    │
│  │   [NO, TODO IGUAL - PAGAR Y ENVIAR]                    │    │
│  │                                                         │    │
│  │   [Sí, necesito modificar algo]                        │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  • Solo 2-3 minutos                                             │
│  • Solo confirmar o modificar                                   │
│  • Comparativa con año anterior                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### PILAR 4: OCR Inteligente

```
┌─────────────────────────────────────────────────────────────────┐
│  EXTRACCIÓN AUTOMÁTICA DE DOCUMENTOS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DOCUMENTOS SOPORTADOS                                          │
│  ─────────────────────                                          │
│                                                                 │
│  📄 Recibo IBI                                                  │
│     → Extrae: Ref. catastral, Valor catastral, Dirección       │
│                                                                 │
│  📄 Escritura de compraventa                                    │
│     → Extrae: Ref. catastral, Precio compra, Fecha, Dirección  │
│                                                                 │
│  📄 NIE / Pasaporte                                             │
│     → Extrae: Nombre, Apellidos, Número documento, Nacimiento  │
│                                                                 │
│  📄 Contrato de alquiler                                        │
│     → Extrae: Renta mensual, Fechas, Inquilino                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  FLUJO DE USO                                                   │
│  ────────────                                                   │
│                                                                 │
│  1. Usuario sube foto/PDF del documento                         │
│  2. Sistema procesa con OCR + IA                                │
│  3. Muestra datos extraídos para confirmación                   │
│  4. Usuario confirma o corrige                                  │
│  5. Datos se auto-rellenan en formulario                        │
│                                                                 │
│  "Hemos detectado estos datos de tu recibo IBI.                │
│   ¿Son correctos?"                                              │
│                                                                 │
│   Ref. Catastral: 1234567AB1234N0001XX  ✓                      │
│   Valor Catastral: 85.000€              ✓                      │
│   Dirección: Calle Sol 15, Málaga       ✓                      │
│                                                                 │
│   [Confirmar y continuar]  [Corregir manualmente]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Comparativa Final

| Característica | IberianTax | Tu Plataforma |
|----------------|------------|---------------|
| Tipografía base | 14px | **20px (modo accesible)** |
| Botones | 40px | **64px (modo accesible)** |
| Contraste | WCAG AA | **WCAG AAA** |
| Entrada por voz | No | **Sí** |
| Lectura en voz alta | No | **Sí** |
| Asistente IA | No | **Sí (TAXIA)** |
| OCR documentos | No | **Sí** |
| Renovación simplificada | Parcial | **1-click** |
| Soporte WhatsApp | No | **Sí** |
| Videollamada | No | **Sí** |
| Wizard 1 campo/pantalla | No | **Sí (modo accesible)** |

---

## 8. Plan de Desarrollo

### 8.1 Fases del Proyecto

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: MVP CORE                                               │
│  ─────────────────                                              │
│                                                                 │
│  Funcionalidades:                                               │
│  • Autenticación (email + Google + Apple)                       │
│  • CRUD Propiedades                                             │
│  • CRUD Propietarios                                            │
│  • Formulario Modelo 210 - Renta Imputada                       │
│  • Cálculo automático de impuestos                              │
│  • Pasarela de pago (Stripe)                                    │
│  • Dashboard básico con historial                               │
│  • Multi-idioma (ES, EN, DE, FR)                                │
│                                                                 │
│  Entregables:                                                   │
│  • Web app responsive                                           │
│  • Panel de administración básico                               │
│  • Documentación técnica                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FASE 2: ACCESIBILIDAD PREMIUM                                  │
│  ────────────────────────────                                   │
│                                                                 │
│  Funcionalidades:                                               │
│  • Modo accesible (toggle)                                      │
│  • Tipografía escalable (20-32px)                               │
│  • Alto contraste WCAG AAA                                      │
│  • Botones XL (64px)                                            │
│  • Wizard simplificado (1 campo/pantalla)                       │
│  • Navegación por teclado completa                              │
│  • Compatibilidad lectores de pantalla                          │
│                                                                 │
│  Entregables:                                                   │
│  • Auditoría WCAG AAA                                           │
│  • Tests de usabilidad con usuarios mayores                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FASE 3: REUTILIZACIÓN DE DATOS                                 │
│  ─────────────────────────────                                  │
│                                                                 │
│  Funcionalidades:                                               │
│  • Guardado automático de perfiles                              │
│  • Historial de propiedades y propietarios                      │
│  • Renovación con datos pre-cargados                            │
│  • Comparativa año anterior                                     │
│  • Detección de cambios                                         │
│  • Flujo "1-click" para renovaciones                            │
│                                                                 │
│  Entregables:                                                   │
│  • Sistema de plantillas de declaración                         │
│  • Notificaciones de renovación                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FASE 4: ASISTENTE VIRTUAL TAXIA                                │
│  ───────────────────────────────                                │
│                                                                 │
│  Funcionalidades:                                               │
│  • Chatbot con IA (GPT-4 / Claude)                              │
│  • Text-to-Speech (lectura de instrucciones)                    │
│  • Speech-to-Text (dictado de datos)                            │
│  • Comandos de voz                                              │
│  • Recordatorios WhatsApp/SMS/Email                             │
│  • Detección de frustración                                     │
│  • Escalado a humano (videollamada)                             │
│                                                                 │
│  Entregables:                                                   │
│  • Integración WhatsApp Business API                            │
│  • Sistema de videollamadas                                     │
│  • Base de conocimiento fiscal                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FASE 5: OCR + AUTOMATIZACIÓN                                   │
│  ───────────────────────────                                    │
│                                                                 │
│  Funcionalidades:                                               │
│  • OCR para recibos IBI                                         │
│  • OCR para escrituras                                          │
│  • OCR para documentos de identidad                             │
│  • Validación automática de datos                               │
│  • Integración con AEAT (presentación telemática)               │
│  • Firma con certificado digital / Cl@ve                        │
│                                                                 │
│  Entregables:                                                   │
│  • Pipeline de procesamiento de documentos                      │
│  • Integración API AEAT                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FASE 6: EXPANSIÓN                                              │
│  ────────────────                                               │
│                                                                 │
│  Funcionalidades:                                               │
│  • App móvil (iOS + Android)                                    │
│  • Más idiomas (NL, SV, NO, DA)                                 │
│  • Más modelos fiscales (714, 720)                              │
│  • Panel B2B para gestorías                                     │
│  • API para integraciones                                       │
│                                                                 │
│  Entregables:                                                   │
│  • Apps nativas                                                 │
│  • Portal de partners                                           │
│  • Documentación API pública                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 MVP - Funcionalidades Prioritarias

| Prioridad | Funcionalidad | Justificación |
|-----------|---------------|---------------|
| P0 | Auth + registro | Base del sistema |
| P0 | CRUD propiedades | Core del negocio |
| P0 | CRUD propietarios | Core del negocio |
| P0 | Modelo 210 Renta Imputada | Caso más común |
| P0 | Cálculo de impuestos | Valor principal |
| P0 | Pasarela de pago | Monetización |
| P1 | Multi-idioma básico (ES/EN) | Mercado objetivo |
| P1 | Dashboard con historial | Experiencia usuario |
| P1 | Modo accesible básico | Diferenciación |
| P2 | Recordatorios email | Retención |
| P2 | Pre-carga de datos | Experiencia año 2+ |

---

## 9. Stack Tecnológico Recomendado

### 9.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                │
├─────────────────────────────────────────────────────────────────┤
│   Web App        │    Mobile App      │    WhatsApp Bot         │
│   (Next.js)      │    (React Native)  │    (Twilio)             │
└────────┬─────────┴─────────┬──────────┴───────────┬─────────────┘
         │                   │                      │
         ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                │
│                    (Next.js API Routes + tRPC)                  │
└────────┬─────────┬─────────┬─────────┬──────────┬───────────────┘
         │         │         │         │          │
         ▼         ▼         ▼         ▼          ▼
┌────────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│   Auth     │ │ Users  │ │Property│ │  Tax   │ │Payments│
│  Service   │ │Service │ │Service │ │ Calc   │ │Service │
│ (Supabase) │ │        │ │        │ │        │ │(Stripe)│
└─────┬──────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
      │            │          │          │          │
      ▼            ▼          ▼          ▼          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Supabase)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  users   │ │properties│ │  owners  │ │  forms   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────────┐          ┌──────────────────────┐
│   Servicios IA       │          │   Integraciones      │
│   ─────────────      │          │   ─────────────      │
│   • OpenAI / Claude  │          │   • Stripe           │
│   • Whisper (STT)    │          │   • AEAT (futuro)    │
│   • ElevenLabs (TTS) │          │   • Twilio/WhatsApp  │
│   • OCR (Google/AWS) │          │   • SendGrid         │
└──────────────────────┘          └──────────────────────┘
```

### 9.2 Stack Detallado

#### Frontend
| Tecnología | Uso | Justificación |
|------------|-----|---------------|
| **Next.js 14** | Framework | SSR, App Router, Server Components |
| **TypeScript** | Lenguaje | Tipado estático, menos errores |
| **Tailwind CSS** | Estilos | Rápido, responsive, customizable |
| **shadcn/ui** | Componentes | Accesibles, personalizables |
| **React Hook Form** | Formularios | Performance, validación |
| **Zod** | Validación | Schema validation |
| **Zustand** | Estado global | Simple, ligero |
| **next-intl** | i18n | Internacionalización |

#### Backend
| Tecnología | Uso | Justificación |
|------------|-----|---------------|
| **Next.js API Routes** | API | Mismo proyecto, serverless |
| **tRPC** | API tipada | End-to-end type safety |
| **Supabase** | BaaS | Auth, DB, Storage, Realtime |
| **PostgreSQL** | Base de datos | Robusta, escalable |
| **Prisma** | ORM | Type-safe, migraciones |

#### Servicios Externos
| Servicio | Uso | Alternativa |
|----------|-----|-------------|
| **Supabase Auth** | Autenticación | Auth0, Clerk |
| **Stripe** | Pagos | PayPal, Redsys |
| **OpenAI GPT-4** | Chatbot IA | Claude, Gemini |
| **Whisper** | Speech-to-Text | Google STT, Azure |
| **ElevenLabs** | Text-to-Speech | Google TTS, Azure |
| **Google Vision** | OCR | AWS Textract, Azure |
| **Twilio** | WhatsApp/SMS | MessageBird |
| **SendGrid** | Emails | Resend, Postmark |
| **Vercel** | Hosting | Netlify, Railway |

### 9.3 Modelo de Datos (Simplificado)

```sql
-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  preferred_language VARCHAR(5) DEFAULT 'en',
  accessibility_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Propietarios
CREATE TABLE owners (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) CHECK (type IN ('person', 'company')),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  nie_nif VARCHAR(20) NOT NULL,
  tax_residence_country VARCHAR(3),
  birth_place VARCHAR(255),
  birth_country VARCHAR(3),
  birth_date DATE,
  email VARCHAR(255),
  phone VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(255),
  postcode VARCHAR(20),
  province VARCHAR(255),
  country VARCHAR(3),
  iban VARCHAR(34),
  bic_swift VARCHAR(11),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Propiedades
CREATE TABLE properties (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) CHECK (type IN ('residential', 'garage', 'commercial')),
  street_type VARCHAR(50),
  street_name VARCHAR(255) NOT NULL,
  number_type VARCHAR(20),
  number VARCHAR(20),
  block VARCHAR(20),
  doorway VARCHAR(20),
  staircase VARCHAR(20),
  floor VARCHAR(20),
  door VARCHAR(20),
  province VARCHAR(100) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  cadastral_reference VARCHAR(20) NOT NULL,
  cadastral_value DECIMAL(12,2),
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  is_sold BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Formularios/Declaraciones
CREATE TABLE tax_forms (
  id UUID PRIMARY KEY,
  reference VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  form_type VARCHAR(20) CHECK (form_type IN ('imputed', 'rental', 'capital_gains')),
  tax_year INTEGER NOT NULL,
  quarter INTEGER,
  status VARCHAR(20) DEFAULT 'draft',
  calculated_tax DECIMAL(10,2),
  payment_status VARCHAR(20),
  filed_at TIMESTAMP,
  aeat_receipt_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Relación formulario-propietarios
CREATE TABLE form_owners (
  form_id UUID REFERENCES tax_forms(id),
  owner_id UUID REFERENCES owners(id),
  ownership_percentage DECIMAL(5,2) DEFAULT 100.00,
  PRIMARY KEY (form_id, owner_id)
);

-- Datos de alquiler
CREATE TABLE rental_data (
  id UUID PRIMARY KEY,
  form_id UUID REFERENCES tax_forms(id),
  rental_days INTEGER,
  rental_income DECIMAL(10,2),
  deductible_expenses JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 10. Arquitectura n8n y Agentización

### 10.1 Ventaja Competitiva: Infraestructura Existente

Nuestra plataforma cuenta con una infraestructura n8n operativa que representa una ventaja estratégica significativa:

```
┌─────────────────────────────────────────────────────────────────┐
│  VENTAJAS DE USAR n8n COMO BACKBONE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Desarrollo visual y rápido de iterar                        │
│  ✓ +400 integraciones pre-construidas                          │
│  ✓ Agentes IA nativos con soporte de tools                     │
│  ✓ Webhooks para comunicación en tiempo real                   │
│  ✓ El equipo ya domina la plataforma                           │
│  ✓ Escalable y monitorizable                                   │
│  ✓ Self-hosted = control total de datos sensibles              │
│                                                                 │
│  Reducción estimada en tiempo de desarrollo: 40-60%            │
│  en las fases de automatización y agentización                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Arquitectura General con n8n

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ARQUITECTURA HÍBRIDA                              │
│                         Next.js + n8n + Supabase                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CANALES DE ENTRADA                                                        │
│   ─────────────────                                                         │
│                                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │   Web    │  │ WhatsApp │  │   SMS    │  │  Email   │  │ Teléfono │    │
│   │  App     │  │ Business │  │ (Twilio) │  │(SendGrid)│  │ (Twilio) │    │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│        │             │             │             │             │           │
│        └─────────────┴─────────────┴─────────────┴─────────────┘           │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                        n8n ORCHESTRATION LAYER                       │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│   │  │   Router    │  │   Agente    │  │  Pipelines  │  │   Crons    │  │  │
│   │  │  Multicanal │  │   TAXIA     │  │    OCR      │  │Recordatorios│ │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │  │
│   └────────────────────────────┬────────────────────────────────────────┘  │
│                                │                                            │
│        ┌───────────────────────┼───────────────────────┐                   │
│        ▼                       ▼                       ▼                   │
│   ┌──────────┐          ┌──────────┐           ┌──────────┐               │
│   │ Next.js  │          │ Supabase │           │ Servicios│               │
│   │   API    │          │   DB     │           │ Externos │               │
│   │  Routes  │          │  + Auth  │           │          │               │
│   └──────────┘          └──────────┘           └──────────┘               │
│                                                      │                     │
│                         ┌────────────────────────────┤                     │
│                         ▼            ▼               ▼                     │
│                    ┌────────┐  ┌──────────┐  ┌────────────┐               │
│                    │ Stripe │  │  OpenAI  │  │   AEAT     │               │
│                    │        │  │  Claude  │  │ (futuro)   │               │
│                    └────────┘  └──────────┘  └────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Agente TAXIA - Arquitectura Detallada

El asistente virtual TAXIA se implementará como un **Agente IA en n8n** con acceso a múltiples herramientas (tools):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENTE TAXIA EN n8n                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                      TRIGGER: Webhook Multicanal                     │  │
│   │   • POST /webhook/taxia                                              │  │
│   │   • Recibe: { canal, userId, mensaje, contexto }                    │  │
│   └────────────────────────────────┬────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         NODO: AI Agent                               │  │
│   │                                                                      │  │
│   │   Modelo: Claude 3.5 Sonnet / GPT-4o                                │  │
│   │                                                                      │  │
│   │   System Prompt:                                                     │  │
│   │   "Eres TAXIA, asistente fiscal especializado en impuestos para    │  │
│   │    no residentes en España. Tu objetivo es guiar al usuario de     │  │
│   │    forma clara y sencilla. Usa lenguaje accesible, evita tecnicis- │  │
│   │    mos. Si detectas frustración, ofrece hablar con un humano."     │  │
│   │                                                                      │  │
│   │   Memory: Buffer de conversación (últimos 10 mensajes)              │  │
│   │                                                                      │  │
│   └────────────────────────────────┬────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                           TOOLS DISPONIBLES                          │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │                                                                      │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │  TOOL 1: consultar_base_conocimiento                           │ │  │
│   │  │  ─────────────────────────────────────────                     │ │  │
│   │  │  Descripción: Busca información fiscal en la base de datos     │ │  │
│   │  │  Parámetros: { pregunta: string }                              │ │  │
│   │  │  Implementación: Vector Store (Supabase pgvector)              │ │  │
│   │  │  Contenido: FAQ, normativa AEAT, guías, plazos                 │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │  TOOL 2: calcular_impuesto                                     │ │  │
│   │  │  ─────────────────────────────────────────                     │ │  │
│   │  │  Descripción: Calcula el impuesto según los datos proporcion.  │ │  │
│   │  │  Parámetros: {                                                 │ │  │
│   │  │    tipo: 'imputada' | 'alquiler' | 'plusvalia',               │ │  │
│   │  │    valorCatastral?: number,                                    │ │  │
│   │  │    diasUso?: number,                                           │ │  │
│   │  │    ingresos?: number,                                          │ │  │
│   │  │    gastos?: number,                                            │ │  │
│   │  │    paisResidencia: string                                      │ │  │
│   │  │  }                                                             │ │  │
│   │  │  Retorna: { baseImponible, tipoAplicable, impuesto, desglose } │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │  TOOL 3: obtener_datos_usuario                                 │ │  │
│   │  │  ─────────────────────────────────────────                     │ │  │
│   │  │  Descripción: Recupera propiedades y propietarios del usuario  │ │  │
│   │  │  Parámetros: { userId: string }                                │ │  │
│   │  │  Implementación: Query a Supabase                              │ │  │
│   │  │  Retorna: { propiedades[], propietarios[], declaraciones[] }   │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │  TOOL 4: iniciar_declaracion                                   │ │  │
│   │  │  ─────────────────────────────────────────                     │ │  │
│   │  │  Descripción: Crea borrador de declaración con datos recogidos │ │  │
│   │  │  Parámetros: { userId, propiedadId, tipo, año, datos }        │ │  │
│   │  │  Implementación: Insert en Supabase + retorna URL de pago     │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │  TOOL 5: escalar_a_humano                                      │ │  │
│   │  │  ─────────────────────────────────────────                     │ │  │
│   │  │  Descripción: Agenda llamada/videollamada con asesor           │ │  │
│   │  │  Parámetros: { userId, motivo, urgencia, preferencia }        │ │  │
│   │  │  Implementación: Cal.com API + notificación al equipo          │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │  TOOL 6: consultar_plazos                                      │ │  │
│   │  │  ─────────────────────────────────────────                     │ │  │
│   │  │  Descripción: Devuelve plazos fiscales relevantes              │ │  │
│   │  │  Parámetros: { tipo: string, año: number }                    │ │  │
│   │  │  Retorna: { fechaInicio, fechaLimite, diasRestantes }         │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                      ROUTER: Canal de Respuesta                      │  │
│   │                                                                      │  │
│   │   Switch por canal original:                                         │  │
│   │   ├── WhatsApp → Twilio WhatsApp API                                │  │
│   │   ├── SMS → Twilio SMS API                                          │  │
│   │   ├── Web → Response HTTP + WebSocket                               │  │
│   │   └── Email → SendGrid (para resúmenes)                             │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Pipeline OCR Inteligente

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PIPELINE OCR EN n8n                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PASO 1: Recepción del documento                                          │
│   ───────────────────────────────                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Webhook: POST /webhook/ocr                                          │  │
│   │  Body: { userId, documentType, file (base64 o URL) }                │  │
│   │                                                                      │  │
│   │  Tipos soportados:                                                   │  │
│   │  • ibi - Recibo IBI                                                  │  │
│   │  • escritura - Escritura de compraventa                              │  │
│   │  • nie - NIE / Pasaporte                                             │  │
│   │  • contrato - Contrato de alquiler                                   │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   PASO 2: Preprocesamiento                                                 │
│   ────────────────────────                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  • Validar formato (PDF, JPG, PNG)                                   │  │
│   │  • Comprimir si > 5MB                                                │  │
│   │  • Convertir PDF a imágenes si necesario                             │  │
│   │  • Mejorar contraste (opcional)                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   PASO 3: Extracción OCR                                                   │
│   ──────────────────────                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Servicio: Google Cloud Vision / AWS Textract / Azure Document AI   │  │
│   │                                                                      │  │
│   │  Output: texto_crudo + bounding_boxes + confianza                   │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   PASO 4: Extracción inteligente con IA                                    │
│   ─────────────────────────────────────                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Nodo: OpenAI / Claude                                               │  │
│   │                                                                      │  │
│   │  Prompt por tipo de documento:                                       │  │
│   │                                                                      │  │
│   │  [IBI]                                                               │  │
│   │  "Extrae del siguiente texto de un recibo IBI español:              │  │
│   │   - Referencia catastral (20 caracteres alfanuméricos)              │  │
│   │   - Valor catastral (número en euros)                               │  │
│   │   - Dirección completa del inmueble                                 │  │
│   │   - Año fiscal                                                       │  │
│   │   Responde en JSON. Si no encuentras un campo, usa null."           │  │
│   │                                                                      │  │
│   │  [NIE]                                                               │  │
│   │  "Extrae del siguiente documento de identidad:                      │  │
│   │   - Número NIE/NIF (formato X0000000X)                              │  │
│   │   - Nombre completo                                                  │  │
│   │   - Fecha de nacimiento                                              │  │
│   │   - Nacionalidad                                                     │  │
│   │   Responde en JSON."                                                 │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   PASO 5: Validación y enriquecimiento                                     │
│   ────────────────────────────────────                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Validaciones:                                                       │  │
│   │  • Ref. catastral: regex /^[0-9A-Z]{20}$/                           │  │
│   │  • NIE: regex /^[XYZ][0-9]{7}[A-Z]$/                                 │  │
│   │  • IBAN: validación checksum                                         │  │
│   │                                                                      │  │
│   │  Enriquecimiento (opcional):                                         │  │
│   │  • Consulta Catastro público para validar ref. catastral            │  │
│   │  • Geolocalización de dirección                                      │  │
│   │                                                                      │  │
│   │  Output: {                                                           │  │
│   │    datos: { ... campos extraídos ... },                             │  │
│   │    confianza: { campo1: 0.95, campo2: 0.78, ... },                  │  │
│   │    requiereRevision: ['campo2'],                                    │  │
│   │    documentoOriginal: url_almacenado                                │  │
│   │  }                                                                   │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   PASO 6: Almacenamiento y respuesta                                       │
│   ──────────────────────────────────                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  • Guardar documento en Supabase Storage                             │  │
│   │  • Guardar datos extraídos en tabla ocr_extractions                 │  │
│   │  • Retornar al frontend para confirmación del usuario               │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.5 Sistema de Recordatorios Automatizados

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJOS DE RECORDATORIOS EN n8n                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FLUJO 1: Recordatorio de Renovación Anual                                │
│   ──────────────────────────────────────────                               │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Trigger: Cron - Cada día a las 10:00 UTC                           │  │
│   │                                                                      │  │
│   │  1. Query Supabase:                                                  │  │
│   │     SELECT * FROM users u                                            │  │
│   │     JOIN tax_forms tf ON u.id = tf.user_id                          │  │
│   │     WHERE tf.tax_year = YEAR(NOW()) - 1                             │  │
│   │     AND tf.status = 'filed'                                          │  │
│   │     AND NOT EXISTS (                                                 │  │
│   │       SELECT 1 FROM tax_forms                                        │  │
│   │       WHERE user_id = u.id AND tax_year = YEAR(NOW())               │  │
│   │     )                                                                │  │
│   │                                                                      │  │
│   │  2. Para cada usuario:                                               │  │
│   │     - Calcular días hasta fecha límite                               │  │
│   │     - Determinar secuencia de recordatorio:                          │  │
│   │       • 90 días antes: Email informativo                            │  │
│   │       • 60 días antes: Email + WhatsApp                             │  │
│   │       • 30 días antes: Email + WhatsApp + SMS                       │  │
│   │       • 7 días antes: Todos los canales + urgente                   │  │
│   │       • 1 día antes: Llamada automatizada (opcional)                │  │
│   │                                                                      │  │
│   │  3. Generar mensaje personalizado con IA:                            │  │
│   │     "Hola [nombre], el año pasado declaraste tu propiedad en        │  │
│   │      [dirección] y pagaste [X]€. Este año el proceso es aún más     │  │
│   │      sencillo: solo confirma que nada ha cambiado."                 │  │
│   │                                                                      │  │
│   │  4. Enviar por canal preferido del usuario                          │  │
│   │                                                                      │  │
│   │  5. Registrar en tabla notification_log                             │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   FLUJO 2: Recordatorio Post-Inicio                                        │
│   ─────────────────────────────────                                        │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Trigger: Cron - Cada 6 horas                                        │  │
│   │                                                                      │  │
│   │  Query: Declaraciones en estado 'draft' sin actividad > 24h         │  │
│   │                                                                      │  │
│   │  Acción: WhatsApp/Email con mensaje:                                │  │
│   │  "Vimos que empezaste tu declaración pero no la terminaste.         │  │
│   │   ¿Necesitas ayuda? Responde 'AYUDA' para hablar con TAXIA."       │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   FLUJO 3: Confirmación Post-Pago                                          │
│   ───────────────────────────────                                          │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Trigger: Webhook Stripe (payment_intent.succeeded)                  │  │
│   │                                                                      │  │
│   │  Acciones:                                                           │  │
│   │  1. Actualizar estado declaración a 'paid'                          │  │
│   │  2. Generar PDF resumen                                              │  │
│   │  3. Enviar email con:                                                │  │
│   │     - Confirmación de pago                                           │  │
│   │     - PDF de resumen                                                 │  │
│   │     - Próximos pasos                                                 │  │
│   │  4. Enviar WhatsApp: "¡Listo! Tu declaración está en proceso."     │  │
│   │  5. Si es primera vez: enviar encuesta NPS en 7 días               │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.6 Flujo de Renovación 1-Click

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RENOVACIÓN CONVERSACIONAL VÍA WHATSAPP                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Usuario recibe: "Hola María, es hora de renovar tu declaración 2025"     │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  CONVERSACIÓN GUIADA POR AGENTE                                      │  │
│   │                                                                      │  │
│   │  TAXIA: "Hola María 👋 Es momento de tu declaración 2025.           │  │
│   │          El año pasado declaraste:                                   │  │
│   │                                                                      │  │
│   │          📍 Calle Sol 15, Málaga                                    │  │
│   │          💶 Valor catastral: 85.000€                                │  │
│   │          👥 Propietarios: Tú (50%) + Juan (50%)                     │  │
│   │          📊 Impuesto 2024: 127,50€                                  │  │
│   │                                                                      │  │
│   │          ¿Ha cambiado algo este año?"                               │  │
│   │                                                                      │  │
│   │  USUARIO: "No, todo sigue igual"                                    │  │
│   │                                                                      │  │
│   │  ──────────────────────────────────────────────────────────────     │  │
│   │  [Agente ejecuta: obtener_datos_usuario + calcular_impuesto]        │  │
│   │  ──────────────────────────────────────────────────────────────     │  │
│   │                                                                      │  │
│   │  TAXIA: "Perfecto ✅ Tu impuesto 2025 es: 127,50€                   │  │
│   │          (igual que el año pasado)                                   │  │
│   │                                                                      │  │
│   │          ¿Quieres pagar ahora y enviamos tu declaración?"           │  │
│   │                                                                      │  │
│   │  USUARIO: "Sí"                                                       │  │
│   │                                                                      │  │
│   │  ──────────────────────────────────────────────────────────────     │  │
│   │  [Agente ejecuta: iniciar_declaracion → genera Stripe Payment Link] │  │
│   │  ──────────────────────────────────────────────────────────────     │  │
│   │                                                                      │  │
│   │  TAXIA: "Aquí tienes el enlace de pago seguro:                      │  │
│   │          🔗 https://pay.jltaxes.com/xyz123                          │  │
│   │                                                                      │  │
│   │          Incluye:                                                    │  │
│   │          • Impuesto: 127,50€                                        │  │
│   │          • Servicio JL Taxes: 34,95€                                │  │
│   │          • Total: 162,45€                                           │  │
│   │                                                                      │  │
│   │          Una vez pagues, presentamos tu declaración ante            │  │
│   │          la Agencia Tributaria en menos de 48h."                    │  │
│   │                                                                      │  │
│   │  ──────────────────────────────────────────────────────────────     │  │
│   │  [Webhook Stripe → Confirmación automática]                         │  │
│   │  ──────────────────────────────────────────────────────────────     │  │
│   │                                                                      │  │
│   │  TAXIA: "¡Pago recibido! 🎉                                         │  │
│   │          Tu declaración ref. JLT-2025-00421 está siendo             │  │
│   │          procesada. Te avisaremos cuando esté presentada.           │  │
│   │                                                                      │  │
│   │          ¿Algo más en lo que pueda ayudarte?"                       │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   TIEMPO TOTAL: ~3 minutos (vs 10-15 min proceso completo)                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.7 Flujos n8n Específicos a Desarrollar

| # | Flujo | Trigger | Complejidad | Prioridad |
|---|-------|---------|-------------|-----------|
| 1 | **Agente TAXIA** | Webhook multicanal | Alta | P0 |
| 2 | **Pipeline OCR IBI** | Webhook upload | Media | P1 |
| 3 | **Pipeline OCR NIE** | Webhook upload | Media | P1 |
| 4 | **Recordatorio renovación** | Cron diario | Baja | P0 |
| 5 | **Recordatorio abandono** | Cron 6h | Baja | P1 |
| 6 | **Confirmación pago** | Webhook Stripe | Baja | P0 |
| 7 | **Cálculo impuestos** | HTTP Request (interno) | Media | P0 |
| 8 | **Renovación WhatsApp** | Webhook WhatsApp | Alta | P1 |
| 9 | **Escalado a humano** | Trigger interno | Baja | P2 |
| 10 | **Encuesta NPS** | Cron + delay | Baja | P2 |
| 11 | **Generación PDF resumen** | Trigger interno | Media | P1 |
| 12 | **Validación Catastro** | HTTP Request | Media | P2 |

### 10.8 Integración n8n ↔ Next.js

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PATRONES DE INTEGRACIÓN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PATRÓN 1: Frontend → n8n (Acciones del usuario)                          │
│   ──────────────────────────────────────────────                           │
│                                                                             │
│   Next.js API Route:                                                        │
│   POST /api/documents/upload                                                │
│        │                                                                    │
│        ▼                                                                    │
│   fetch('https://n8n.jltaxes.com/webhook/ocr', {                           │
│     method: 'POST',                                                         │
│     body: JSON.stringify({ userId, documentType, file })                   │
│   })                                                                        │
│        │                                                                    │
│        ▼                                                                    │
│   n8n procesa → retorna datos extraídos → Frontend muestra para confirmar  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────    │
│                                                                             │
│   PATRÓN 2: n8n → Next.js (Actualizaciones en tiempo real)                 │
│   ────────────────────────────────────────────────────────                 │
│                                                                             │
│   n8n completa proceso:                                                     │
│        │                                                                    │
│        ▼                                                                    │
│   HTTP Request → POST /api/internal/update-status                          │
│        │                                                                    │
│        ▼                                                                    │
│   Next.js actualiza Supabase + emite evento Realtime                       │
│        │                                                                    │
│        ▼                                                                    │
│   Frontend recibe actualización via Supabase Realtime subscription         │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────    │
│                                                                             │
│   PATRÓN 3: Chat Widget → n8n Agente                                       │
│   ──────────────────────────────────                                       │
│                                                                             │
│   React Component (ChatWidget):                                             │
│   const sendMessage = async (text) => {                                    │
│     const response = await fetch('/api/chat', {                            │
│       method: 'POST',                                                       │
│       body: JSON.stringify({                                               │
│         userId: session.user.id,                                           │
│         message: text,                                                      │
│         conversationId                                                      │
│       })                                                                    │
│     });                                                                     │
│     // API route forwards to n8n webhook                                   │
│     // n8n Agente processes and returns response                           │
│     return response.json();                                                 │
│   }                                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.9 Actualización del Plan de Desarrollo con n8n

Se propone añadir una **Fase 1.5** dedicada a la infraestructura de automatización:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FASE 1.5: INFRAESTRUCTURA n8n (NUEVA)                                      │
│  ─────────────────────────────────────                                      │
│                                                                             │
│  Objetivo: Establecer la capa de automatización antes de las fases         │
│  de accesibilidad y asistente virtual, permitiendo desarrollo paralelo.    │
│                                                                             │
│  Entregables:                                                               │
│                                                                             │
│  1. Infraestructura base                                                    │
│     • n8n self-hosted en servidor dedicado                                 │
│     • Configuración de credenciales (Supabase, Stripe, OpenAI, Twilio)    │
│     • Webhooks con autenticación                                           │
│     • Monitorización y alertas                                             │
│                                                                             │
│  2. Flujos core                                                             │
│     • Webhook receptor multicanal (Web, WhatsApp, SMS)                     │
│     • Servicio de cálculo de impuestos                                     │
│     • Sistema de notificaciones (Email + WhatsApp)                         │
│     • Integración Stripe (webhooks de pago)                                │
│                                                                             │
│  3. Agente TAXIA v1 (básico)                                               │
│     • Respuestas a FAQ fiscal                                              │
│     • Guía paso a paso del proceso                                         │
│     • Escalado a email de soporte                                          │
│                                                                             │
│  4. Pipeline OCR v1                                                         │
│     • Procesamiento de recibos IBI                                         │
│     • Extracción de ref. catastral y valor                                 │
│                                                                             │
│  Dependencias: Requiere Fase 1 (MVP Core) completada parcialmente          │
│  (al menos auth + modelo de datos)                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.10 Mapeo: Debilidades IberianTax → Solución n8n

| Debilidad Identificada | Solución con n8n | Flujo Específico |
|------------------------|------------------|------------------|
| Sin asistencia contextual en tiempo real | Agente TAXIA con tools | `agente-taxia.json` |
| Sin opción de entrada por voz | Whisper STT → Agente | `voice-to-agent.json` |
| Sin OCR para documentos | Pipeline OCR + IA | `ocr-ibi.json`, `ocr-nie.json` |
| Renovación requiere reintroducir datos | Flujo conversacional 1-click | `renovacion-whatsapp.json` |
| Sin soporte por WhatsApp | Integración Twilio WhatsApp | `webhook-whatsapp.json` |
| Sin videollamada para casos complejos | Detección frustración → Cal.com | `escalar-humano.json` |
| Formularios sin guardado visible | Eventos → n8n → Supabase | `autosave-form.json` |
| Sin indicador de tiempo restante | Cálculo dinámico en Agente | Tool `consultar_plazos` |
| Múltiples propietarios = duplicar trabajo | Gestión inteligente en Agente | Tool `obtener_datos_usuario` |

### 10.11 Estimación de Reducción de Esfuerzo

| Fase Original | Sin n8n | Con n8n | Reducción |
|---------------|---------|---------|-----------|
| Fase 4: Asistente TAXIA | 100% | 40% | **60%** |
| Fase 5: OCR + Automatización | 100% | 50% | **50%** |
| Sistema de notificaciones | 100% | 20% | **80%** |
| Integración WhatsApp | 100% | 30% | **70%** |
| Integración Stripe webhooks | 100% | 25% | **75%** |
| **Promedio general** | | | **~55%** |

La infraestructura n8n existente representa una ventaja competitiva significativa que permite:
- Desarrollo más rápido de features de automatización
- Iteración visual sin necesidad de deployments
- Menor dependencia de desarrollo backend tradicional
- Capacidad de escalar funcionalidades de IA de forma modular

---

## 11. Anexos

### 11.1 Plazos Fiscales 2025

| Tipo de Declaración | Año Fiscal | Período de Presentación | Fecha Límite |
|---------------------|------------|------------------------|--------------|
| Renta Imputada | 2024 | 1 Ene - 31 Dic 2025 | 31 Dic 2025 |
| Renta de Alquiler | 2024 | 1 Ene - 20 Ene 2025 | 20 Ene 2025 |
| Renta de Alquiler | 2025 | 1 Ene - 20 Ene 2026 | 20 Ene 2026 |
| Plusvalía | N/A | 4 meses desde venta | Variable |
| IBI | N/A | Según municipio | Variable |

### 11.2 Categorías FAQ de IberianTax

1. **About IberianTax** (7 preguntas)
   - Who are IberianTax?
   - Why use IberianTax?
   - Do you have references?
   - Is my personal data secure?
   - Can IberianTax e-file for me?
   - Do you have access to my bank account?
   - What are the charges?

2. **General Questions** (11 preguntas)
   - Resident vs non-resident
   - Joint property filing
   - What is Modelo 210?
   - Cadastral vs market value
   - Taxes for non-residents
   - Late payment penalties
   - Online payment
   - Consequences of non-filing
   - AEAT alerts
   - Tax calculation
   - Late filing notifications

3. **Rental Income** (9 preguntas)
   - Tax on rental income
   - Applicable tax rates
   - Deadlines
   - Deductible expenses
   - Invoice requirements
   - Other tax returns
   - Tax liability division
   - Deductible expenses list
   - Deductible vs acquisition expenses

4. **Payment And Tax Filing** (9 preguntas)
   - Payment methods
   - Required documents
   - Changing payment method
   - Spanish bank requirement
   - Bank refusal handling
   - Data reuse
   - Separate forms for parking
   - Overpayment refunds
   - Accessing filed forms

5. **Non-Resident Tax Questions** (8 preguntas)
   - What is non-resident tax?
   - Property tax obligation
   - Tax without rental
   - Tax amounts
   - Filing deadlines
   - Missed deadline consequences
   - Previous years filing
   - IBI vs non-resident tax

6. **Imputed Income** (10 preguntas)
   - Calculation method
   - Tax rate
   - Cadastral value changes
   - Deadlines
   - Finding cadastral value
   - 2% vs 1.1% rate
   - Partial rental
   - Property sale
   - Full-year rental

7. **Capital Gains Tax** (9 preguntas)
   - What is capital gains tax?
   - Tax on house sale
   - Avoiding CGT
   - Calculation
   - 3% retention
   - Modelo 211
   - Property loss
   - Declaration deadline
   - Required documents

8. **Digital Certificate** (8 preguntas)
   - What is it?
   - Required documents
   - In-person visit
   - Application process time
   - After submission
   - Installation
   - Validity period
   - Renewal

### 11.3 Referencias y Enlaces

- **IberianTax:** https://www.iberiantax.com
- **AEAT (Agencia Tributaria):** https://www.agenciatributaria.es
- **Modelo 210:** https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G322.shtml
- **Catastro:** https://www.sedecatastro.gob.es

---

## Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | Enero 2025 | Documento inicial con análisis completo |
| 1.1 | Enero 2025 | Añadida sección 10: Arquitectura n8n y Agentización |

---

*Documento generado como parte del análisis de competencia para el proyecto de plataforma de declaración de impuestos para no residentes en España.*
