# Architecture Patterns: JL Taxes Platform

**Domain:** Multi-language tax filing platform with AEAT integration
**Researched:** 2026-01-17
**Confidence:** HIGH (verified via AEAT developer docs, multi-tenant SaaS patterns, rules engine documentation)

---

## Executive Summary

This document defines the architecture for a multi-tenant tax filing platform that enables non-resident property owners in Spain to file Modelo 210 declarations. The architecture must support:

1. **Multi-owner properties** with percentage-based ownership
2. **4 languages** with database-driven form labels
3. **Batch AEAT submission** via fiscal representative certificate
4. **Regulatory updates** without code deployments
5. **n8n-based automation** for workflows and notifications

The recommended architecture is a **modular monolith** with clear component boundaries, using a **rules engine** for tax calculations and a **queue-based batch processor** for AEAT submissions.

---

## Recommended Architecture

### High-Level System Diagram

```
+------------------------------------------------------------------+
|                         CLIENT LAYER                              |
+------------------------------------------------------------------+
|                                                                   |
|   +-------------+    +-------------+    +-------------------+    |
|   |   Web App   |    |  WhatsApp   |    |   Admin Panel    |    |
|   |  (Next.js)  |    |  (Twilio)   |    |   (Next.js)      |    |
|   +------+------+    +------+------+    +--------+----------+    |
|          |                  |                    |               |
+----------+------------------+--------------------+---------------+
           |                  |                    |
           v                  v                    v
+------------------------------------------------------------------+
|                      API GATEWAY LAYER                            |
+------------------------------------------------------------------+
|                                                                   |
|   +----------------------------------------------------------+   |
|   |              Next.js API Routes + tRPC                    |   |
|   |   (Authentication, Authorization, Request Validation)    |   |
|   +---------------------------+------------------------------+   |
|                               |                                   |
+-------------------------------+-----------------------------------+
                                |
           +--------------------+--------------------+
           |                    |                    |
           v                    v                    v
+------------------------------------------------------------------+
|                      APPLICATION LAYER                            |
+------------------------------------------------------------------+
|                                                                   |
|   +------------+  +------------+  +------------+  +------------+ |
|   |   User     |  |  Property  |  |   Tax      |  |  Payment   | |
|   |  Service   |  |  Service   |  |  Service   |  |  Service   | |
|   +-----+------+  +-----+------+  +-----+------+  +-----+------+ |
|         |               |               |               |        |
|   +-----+------+  +-----+------+  +-----+------+  +-----+------+ |
|   |   Owner    |  |Declaration |  |   Rules    |  |   AEAT     | |
|   |  Service   |  |  Service   |  |   Engine   |  |  Submitter | |
|   +------------+  +------------+  +------------+  +------------+ |
|                                                                   |
+------------------------+------------------------------------------+
                         |
                         v
+------------------------------------------------------------------+
|                     INTEGRATION LAYER                             |
+------------------------------------------------------------------+
|                                                                   |
|   +------------------+    +------------------+                    |
|   |   n8n Workflows  |    |   External APIs  |                    |
|   |                  |    |                  |                    |
|   | - Notifications  |    | - Stripe         |                    |
|   | - Reminders      |    | - AEAT           |                    |
|   | - OCR Pipeline   |    | - Twilio         |                    |
|   | - TAXIA Agent    |    | - SendGrid       |                    |
|   +--------+---------+    +--------+---------+                    |
|            |                       |                              |
+------------+-----------------------+------------------------------+
             |                       |
             v                       v
+------------------------------------------------------------------+
|                      DATA LAYER                                   |
+------------------------------------------------------------------+
|                                                                   |
|   +------------------+    +------------------+    +-------------+ |
|   |   PostgreSQL     |    |   Redis          |    |   Object    | |
|   |   (Supabase)     |    |   (Cache/Queue)  |    |   Storage   | |
|   |                  |    |                  |    |  (Supabase) | |
|   | - Core entities  |    | - Session cache  |    | - Documents | |
|   | - Translations   |    | - Job queues     |    | - PDFs      | |
|   | - Tax rules      |    | - Rate limiting  |    | - Receipts  | |
|   | - Audit logs     |    |                  |    |             | |
|   +------------------+    +------------------+    +-------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Data Owned |
|-----------|---------------|-------------------|------------|
| **User Service** | Registration, authentication, preferences, language selection | Owner Service, Auth Provider | `users`, `user_preferences` |
| **Owner Service** | CRUD for property owners (persons/companies), banking details | User Service, Declaration Service | `owners`, `owner_addresses` |
| **Property Service** | CRUD for Spanish properties, cadastral data | Owner Service, Declaration Service | `properties`, `property_owners` |
| **Declaration Service** | Tax form lifecycle (draft, pending, filed), multi-owner splitting | Property, Owner, Tax, AEAT Services | `declarations`, `declaration_owners` |
| **Tax Service** | Tax calculation using rules engine, formula evaluation | Rules Engine, Declaration Service | Stateless (reads from `tax_rules`) |
| **Rules Engine** | JSON-based tax rule evaluation, supports versioning | Tax Service, Admin Panel | `tax_rules`, `rule_versions` |
| **Payment Service** | Stripe integration, payment status, refunds | Declaration Service, Stripe API | `payments`, `invoices` |
| **AEAT Submitter** | Batch XML generation, certificate-based submission, response handling | Declaration Service, AEAT API | `aeat_submissions`, `submission_logs` |
| **Translation Service** | Database-driven i18n, form field labels, messages | All UI components | `translations`, `translation_keys` |
| **n8n Orchestration** | Workflow automation, notifications, OCR, TAXIA agent | All services via webhooks | Workflow state (in n8n) |

---

## Data Flow

### Flow 1: User Registration to First Declaration

```
+--------+     +----------+     +----------+     +----------+     +----------+
| User   | --> |  Create  | --> |  Create  | --> |  Create  | --> |  Create  |
| Signup |     |  User    |     |  Owner   |     | Property |     |  Declar. |
+--------+     +----------+     +----------+     +----------+     +----------+
                    |                |                |                |
                    v                v                v                v
              +-----------+    +-----------+    +-----------+    +-----------+
              |   users   |    |  owners   |    |properties |    |declarations|
              +-----------+    +-----------+    +-----------+    +-----------+
                                     |                |                |
                                     +-------+--------+                |
                                             |                         |
                                             v                         |
                                    +----------------+                 |
                                    |property_owners |                 |
                                    |(junction table)|                 |
                                    +----------------+                 |
                                                                       |
                                             +-------------------------+
                                             |
                                             v
                                    +------------------+
                                    |declaration_owners|
                                    | (% per owner)    |
                                    +------------------+
```

### Flow 2: Tax Calculation (Configuration-Driven)

```
+---------------+     +-----------------+     +----------------+
|  Declaration  | --> |  Tax Service    | --> |  Rules Engine  |
|  Data Input   |     |  (Orchestrator) |     |  (json-rules)  |
+---------------+     +-----------------+     +----------------+
                              |                       |
                              |                       v
                              |              +------------------+
                              |              |   tax_rules      |
                              |              | (DB: JSON rules) |
                              |              +------------------+
                              |                       |
                              v                       v
                      +-----------------+     +----------------+
                      |  Apply Rules:   |     |  Rule Context: |
                      |  - Base amount  | <-- |  - type        |
                      |  - Tax rate     |     |  - country     |
                      |  - Deductions   |     |  - year        |
                      |  - Final tax    |     |  - property    |
                      +-----------------+     +----------------+
                              |
                              v
                      +------------------+
                      | Calculated Tax   |
                      | per Owner (by %) |
                      +------------------+
```

### Flow 3: AEAT Batch Submission

```
+------------------+     +------------------+     +------------------+
|  Admin triggers  | --> |  AEAT Submitter  | --> |  Load pending    |
|  batch submit    |     |  (Queue Worker)  |     |  declarations    |
+------------------+     +------------------+     +------------------+
                                 |
                                 v
                         +------------------+
                         |  For each batch: |
                         |  1. Generate XML |
                         |  2. Sign with    |
                         |     P12 cert     |
                         |  3. Submit SOAP  |
                         +------------------+
                                 |
            +--------------------+--------------------+
            |                    |                    |
            v                    v                    v
    +--------------+     +--------------+     +--------------+
    |   Success    |     |   Retry      |     |   Failure    |
    |   Update DB  |     |   (exp.back) |     |   to DLQ     |
    |   Notify     |     |   Requeue    |     |   Alert      |
    +--------------+     +--------------+     +--------------+
            |
            v
    +------------------+
    |  n8n Workflow:   |
    |  - Email receipt |
    |  - WhatsApp msg  |
    |  - Update status |
    +------------------+
```

### Flow 4: Multi-Language Form Rendering

```
+------------------+     +------------------+     +------------------+
|  User selects    | --> |  Frontend loads  | --> |  API fetches     |
|  language (DE)   |     |  form component  |     |  translations    |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
                                                 +------------------+
                                                 |  translations    |
                                                 |  table query:    |
                                                 |  WHERE locale='de'|
                                                 |  AND context=    |
                                                 |  'form.property' |
                                                 +------------------+
                                                          |
                                                          v
                                                 +------------------+
                                                 |  Cached in Redis |
                                                 |  key: i18n:de:*  |
                                                 |  TTL: 1 hour     |
                                                 +------------------+
                                                          |
                                                          v
                                                 +------------------+
                                                 |  Form rendered   |
                                                 |  with German     |
                                                 |  field labels    |
                                                 +------------------+
```

---

## Key Architectural Patterns

### Pattern 1: Configuration-Driven Tax Rules

**What:** Tax calculation formulas and rates stored as JSON rules in the database, evaluated at runtime using json-rules-engine.

**Why:** Annual regulatory changes (tax rates, deduction limits, form fields) can be updated by the client (fiscal representative) without developer intervention or code deployments.

**Implementation:**

```typescript
// tax_rules table schema
interface TaxRule {
  id: string;
  rule_type: 'imputed' | 'rental' | 'capital_gains';
  tax_year: number;
  version: number;
  is_active: boolean;
  conditions: RuleCondition[];  // JSON
  calculations: RuleCalculation[];  // JSON
  created_at: Date;
  updated_by: string;
}

// Example rule for imputed income (Renta Imputada)
const imputedIncomeRule = {
  conditions: {
    all: [
      { fact: 'declaration_type', operator: 'equal', value: 'imputed' },
      { fact: 'tax_year', operator: 'greaterThanInclusive', value: 2024 }
    ]
  },
  event: {
    type: 'calculate_imputed',
    params: {
      // Base = cadastral_value * rate (1.1% or 2% based on revision)
      base_rate_revised: 0.011,
      base_rate_not_revised: 0.02,
      // Tax = base * applicable_rate (19% EU, 24% non-EU)
      tax_rate_eu: 0.19,
      tax_rate_non_eu: 0.24,
      eu_countries: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI',
                     'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
                     'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']
    }
  }
};
```

**Admin UI Flow:**
1. Admin navigates to Settings > Tax Rules
2. Selects tax year and rule type
3. Modifies rates/thresholds in form fields (not raw JSON)
4. System validates rule syntax
5. Creates new version (previous remains for audit)
6. Rule becomes active immediately (cache invalidated)

### Pattern 2: Database-Driven Internationalization

**What:** Form field labels, validation messages, and UI text stored in a translations table with context-based keys.

**Why:** The client needs to update form field labels when AEAT changes requirements, and potentially add new languages without developer involvement.

**Implementation:**

```sql
-- Single translation table with hierarchical keys
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale VARCHAR(5) NOT NULL,           -- 'en', 'es', 'de', 'fr'
  context VARCHAR(100) NOT NULL,        -- 'form.property', 'form.owner', 'validation'
  key VARCHAR(255) NOT NULL,            -- 'cadastral_reference', 'street_name'
  value TEXT NOT NULL,                  -- The translated text
  description TEXT,                     -- For admin context
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  UNIQUE(locale, context, key)
);

-- Index for fast lookups
CREATE INDEX idx_translations_locale_context ON translations(locale, context);

-- Example data
INSERT INTO translations (locale, context, key, value, description) VALUES
('en', 'form.property', 'cadastral_reference', 'Cadastral Reference', 'The 20-character property ID'),
('de', 'form.property', 'cadastral_reference', 'Katasterreferenz', 'Die 20-stellige Grundstücks-ID'),
('es', 'form.property', 'cadastral_reference', 'Referencia Catastral', 'El identificador de 20 caracteres'),
('fr', 'form.property', 'cadastral_reference', 'Référence Cadastrale', 'L''identifiant de 20 caractères');
```

**Caching Strategy:**
```typescript
// Redis cache key structure: i18n:{locale}:{context}
// Example: i18n:de:form.property

async function getTranslations(locale: string, context: string): Promise<Record<string, string>> {
  const cacheKey = `i18n:${locale}:${context}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from database
  const translations = await db.query(`
    SELECT key, value FROM translations
    WHERE locale = $1 AND context = $2
  `, [locale, context]);

  const result = Object.fromEntries(
    translations.rows.map(r => [r.key, r.value])
  );

  // Cache for 1 hour (admin updates invalidate)
  await redis.setex(cacheKey, 3600, JSON.stringify(result));

  return result;
}
```

### Pattern 3: Multi-Owner Declaration Splitting

**What:** When a property has multiple owners (e.g., 50%/50%), the system automatically generates individual declarations for each owner based on their ownership percentage.

**Why:** AEAT requires separate Modelo 210 for each taxpayer. A family property with 3 owners means 3 declarations.

**Implementation:**

```sql
-- Junction table for property ownership
CREATE TABLE property_owners (
  property_id UUID REFERENCES properties(id),
  owner_id UUID REFERENCES owners(id),
  ownership_percentage DECIMAL(5,2) NOT NULL CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  acquisition_date DATE NOT NULL,
  PRIMARY KEY (property_id, owner_id)
);

-- Validate percentages sum to 100%
CREATE OR REPLACE FUNCTION check_ownership_total()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT SUM(ownership_percentage) FROM property_owners WHERE property_id = NEW.property_id) > 100 THEN
    RAISE EXCEPTION 'Total ownership percentage cannot exceed 100%%';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Junction table for declarations
CREATE TABLE declaration_owners (
  declaration_id UUID REFERENCES declarations(id),
  owner_id UUID REFERENCES owners(id),
  ownership_percentage DECIMAL(5,2) NOT NULL,
  calculated_base DECIMAL(12,2),      -- Proportional base
  calculated_tax DECIMAL(10,2),       -- Proportional tax
  aeat_reference VARCHAR(50),         -- Individual AEAT receipt number
  PRIMARY KEY (declaration_id, owner_id)
);
```

**Declaration Generation Flow:**
```typescript
async function createDeclarations(propertyId: string, taxYear: number) {
  // Get property with owners
  const property = await getPropertyWithOwners(propertyId);

  // Calculate total tax for property
  const totalTax = await taxService.calculate({
    type: 'imputed',
    cadastralValue: property.cadastralValue,
    daysUsed: property.daysUsed,
    taxYear
  });

  // Create group declaration (internal tracking)
  const groupId = await createDeclarationGroup(propertyId, taxYear);

  // Create individual declaration per owner
  for (const owner of property.owners) {
    const ownerTax = totalTax * (owner.percentage / 100);

    await createDeclaration({
      groupId,
      propertyId,
      ownerId: owner.id,
      taxYear,
      ownershipPercentage: owner.percentage,
      calculatedBase: totalTax.base * (owner.percentage / 100),
      calculatedTax: ownerTax,
      status: 'draft'
    });
  }

  return groupId;
}
```

### Pattern 4: Queue-Based AEAT Batch Submission

**What:** Declarations are queued for batch submission to AEAT, with exponential backoff retry and dead-letter queue for failures.

**Why:** AEAT rate limits submissions, requires certificate-based authentication, and may have downtime. Batch processing with resilience patterns ensures reliability.

**Implementation:**

```
+------------------+     +------------------+     +------------------+
|  declarations    | --> |  submission_jobs | --> |  AEAT Worker     |
|  status='paid'   |     |  (Redis Queue)   |     |  (n8n or Node)   |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
                                                 +------------------+
                                                 |  For each job:   |
                                                 |  1. Load cert    |
                                                 |  2. Build XML    |
                                                 |  3. SOAP call    |
                                                 |  4. Parse resp   |
                                                 +------------------+
                                                          |
                         +--------------------------------+
                         |                |               |
                         v                v               v
                  +-----------+    +-----------+   +-----------+
                  |  Success  |    |  Retry    |   |   DLQ     |
                  |  Update   |    |  (5 max)  |   |  (alert)  |
                  +-----------+    +-----------+   +-----------+
```

**Job Schema:**
```typescript
interface SubmissionJob {
  id: string;
  declarationId: string;
  ownerId: string;
  priority: 'normal' | 'high';  // High for near-deadline
  attempts: number;
  maxAttempts: 5;
  lastError?: string;
  scheduledFor: Date;
  createdAt: Date;
}
```

**Retry Strategy:**
- Attempt 1: Immediate
- Attempt 2: 5 minutes delay
- Attempt 3: 30 minutes delay
- Attempt 4: 2 hours delay
- Attempt 5: 24 hours delay
- After 5 failures: Move to DLQ, alert admin

### Pattern 5: Certificate-Based AEAT Authentication

**What:** The client's P12 certificate is securely stored and used for all AEAT submissions on behalf of users.

**Why:** Users don't need their own digital certificates. The client acts as fiscal representative (representante fiscal), authorized to file on behalf of non-residents.

**Implementation:**

```typescript
// Certificate stored encrypted in Supabase Vault or similar
interface CertificateConfig {
  id: string;
  alias: string;                    // 'primary', 'backup'
  p12_encrypted: Buffer;            // Encrypted certificate
  passphrase_encrypted: string;     // Encrypted passphrase
  valid_from: Date;
  valid_until: Date;
  is_active: boolean;
}

// AEAT submission with certificate
async function submitToAEAT(declaration: Declaration): Promise<AEATResponse> {
  // Load active certificate
  const cert = await getCertificate();
  const decryptedCert = await vault.decrypt(cert.p12_encrypted);
  const passphrase = await vault.decrypt(cert.passphrase_encrypted);

  // Build Modelo 210 XML
  const xml = buildModelo210XML(declaration);

  // Create SOAP client with certificate
  const client = await soap.createClientAsync(AEAT_WSDL_URL, {
    wsdl_options: {
      pfx: decryptedCert,
      passphrase: passphrase
    }
  });

  // Submit
  const [result] = await client.PresentarDeclaracionAsync({ xml });

  return parseAEATResponse(result);
}
```

**Security Considerations:**
- Certificate stored in encrypted vault (Supabase Vault, AWS Secrets Manager, or HashiCorp Vault)
- Passphrase never logged or exposed
- Certificate rotation alerts before expiry
- Audit log for all certificate usages
- Separate test certificate for staging environment

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hardcoded Tax Calculations

**What:** Embedding tax rates, formulas, and thresholds directly in application code.

**Why Bad:** Regulatory changes require code deployments. Delays in deployment = compliance risk. Multiple locations to update = bugs.

**Instead:** Use the Rules Engine pattern. Store all tax logic in database, evaluate at runtime.

### Anti-Pattern 2: Static i18n Files per Deployment

**What:** Using JSON/YAML translation files that require code deployment to update.

**Why Bad:** When AEAT changes a form field name, the client cannot update it without developer involvement. Slows down response to regulatory changes.

**Instead:** Database-driven translations with admin UI. Cache for performance, invalidate on update.

### Anti-Pattern 3: Synchronous AEAT Submission

**What:** Submitting to AEAT within the HTTP request cycle, making users wait.

**Why Bad:** AEAT can be slow (5-30 seconds), may timeout, may be down. User experience suffers. No retry mechanism.

**Instead:** Queue-based batch processing. Immediate acknowledgment to user, background processing with notifications.

### Anti-Pattern 4: Single Monolithic Database Schema

**What:** Using identical table structures for both regulatory data (tax rules, translations) and transactional data (users, declarations).

**Why Bad:** Regulatory data needs versioning, audit trails, and admin-controlled updates. Transactional data needs different access patterns.

**Instead:** Separate concerns in schema design:
- `tax_rules` with versioning and audit columns
- `translations` with context and admin tracking
- `declarations` with status workflow and AEAT references

### Anti-Pattern 5: Certificate in Application Config

**What:** Storing P12 certificate and passphrase in environment variables or config files.

**Why Bad:** Security risk if config is exposed. No rotation mechanism. No audit trail.

**Instead:** Use encrypted vault storage. Decrypt only in memory when needed. Log all accesses.

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 100K users |
|---------|--------------|--------------|---------------|
| **Database** | Single Supabase instance | Connection pooling (PgBouncer), read replicas | Horizontal sharding by user_id range |
| **Translation Cache** | In-memory or Redis single instance | Redis Cluster | Redis Cluster with regional replication |
| **AEAT Submission** | Single worker process | Multiple workers, priority queue | Distributed workers, rate-limited per certificate |
| **File Storage** | Supabase Storage | Supabase Storage with CDN | Multi-region with CDN, archive tier for old docs |
| **n8n Workflows** | Single n8n instance | n8n Queue mode with workers | Multiple n8n instances with load balancer |

---

## Build Order (Dependencies)

The following diagram shows component dependencies and suggested build order:

```
Phase 1: Foundation (Weeks 1-4)
+------------------+     +------------------+     +------------------+
|   Database       | --> |   Auth Layer     | --> |   User Service   |
|   Schema         |     |   (Supabase)     |     |                  |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
Phase 2: Core Entities (Weeks 3-6)                +------------------+
                                                  |   Owner Service  |
                                                  +------------------+
                                                          |
                                                          v
                                                  +------------------+
                                                  | Property Service |
                                                  +------------------+
                                                          |
Phase 3: Tax Logic (Weeks 5-8)                            v
+------------------+     +------------------+     +------------------+
|   Rules Engine   | --> |   Tax Service    | --> | Declaration Svc  |
|   (json-rules)   |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
                                                          |
Phase 4: Payments (Weeks 7-9)                             v
                                                  +------------------+
                                                  | Payment Service  |
                                                  |    (Stripe)      |
                                                  +------------------+
                                                          |
Phase 5: AEAT Integration (Weeks 9-12)                    v
+------------------+     +------------------+     +------------------+
|   AEAT XML       | --> |   AEAT Queue     | --> | AEAT Submitter   |
|   Generator      |     |   Worker         |     |                  |
+------------------+     +------------------+     +------------------+
                                                          |
Phase 6: Automation (Weeks 10-14)                         v
+------------------+     +------------------+     +------------------+
|   n8n Setup      | --> |  Notifications   | --> |   Renewal Flow   |
|                  |     |  Workflows       |     |                  |
+------------------+     +------------------+     +------------------+
```

### Dependency Matrix

| Component | Depends On | Enables |
|-----------|-----------|---------|
| Database Schema | - | Everything |
| Auth Layer | Database | User Service |
| User Service | Auth | Owner Service |
| Owner Service | User | Property Service, Declaration Service |
| Property Service | Owner | Declaration Service |
| Translation Service | Database | All UI Components |
| Rules Engine | Database | Tax Service |
| Tax Service | Rules Engine | Declaration Service |
| Declaration Service | Property, Owner, Tax | Payment Service, AEAT Submitter |
| Payment Service | Declaration | AEAT Queue |
| AEAT Submitter | Declaration, Certificate | Notifications |
| n8n Workflows | All Services | Automated flows |

### Critical Path

The critical path for MVP is:

1. **Database + Auth + User** (2 weeks)
2. **Owner + Property** (2 weeks, parallel with #1 end)
3. **Rules Engine + Tax Service** (2 weeks)
4. **Declaration Service** (1 week)
5. **Payment** (1 week)
6. **AEAT Submitter** (2 weeks)

**Total MVP critical path:** ~10 weeks

Translation Service and n8n Workflows can be built in parallel after Phase 1.

---

## AEAT Integration Architecture (Detailed)

### AEAT Web Services Overview

Based on the [AEAT Developer Portal](https://www.agenciatributaria.es/AEAT.desarrolladores/Desarrolladores/_menu_/Documentacion/Documentacion.html):

- **Protocol:** SOAP 1.1 over HTTPS
- **Authentication:** X.509 client certificate (P12/PFX)
- **Format:** XML following AEAT schema specifications
- **Testing:** Available at [preportal.aeat.es](https://preportal.aeat.es)

### Modelo 210 Submission Flow

```
+------------------+
|   Declaration    |
|   (Database)     |
+--------+---------+
         |
         v
+------------------+
|  XML Builder     |
|  - Header        |
|  - Taxpayer data |
|  - Property data |
|  - Calculation   |
|  - Signature     |
+--------+---------+
         |
         v
+------------------+
|  SOAP Client     |
|  - Load P12 cert |
|  - Build request |
|  - Send to AEAT  |
+--------+---------+
         |
         v
+------------------+     +------------------+
|  Response Parser | --> |  Success?        |
|                  |     |  - CSV receipt   |
|                  |     |  - Reference #   |
+------------------+     +------------------+
                                |
               +----------------+----------------+
               |                                 |
               v                                 v
       +--------------+                 +--------------+
       |   Success    |                 |   Error      |
       | - Store ref  |                 | - Parse code |
       | - Update DB  |                 | - Log        |
       | - Notify     |                 | - Retry/DLQ  |
       +--------------+                 +--------------+
```

### XML Structure (Modelo 210)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Modelo210>
  <Ejercicio>2024</Ejercicio>
  <Periodo>0A</Periodo>
  <TipoDeclaracion>I</TipoDeclaracion>  <!-- I=Ingreso, N=Negativa -->

  <Declarante>
    <NIF>X1234567A</NIF>
    <Nombre>JOHN</Nombre>
    <Apellido1>SMITH</Apellido1>
    <PaisResidencia>GB</PaisResidencia>
    <!-- ... more fields -->
  </Declarante>

  <Inmueble>
    <RefCatastral>1234567AB1234N0001XX</RefCatastral>
    <ValorCatastral>85000.00</ValorCatastral>
    <!-- ... address fields -->
  </Inmueble>

  <Calculo>
    <TipoRenta>01</TipoRenta>  <!-- 01=Imputed -->
    <BaseImponible>935.00</BaseImponible>  <!-- 85000 * 1.1% -->
    <TipoGravamen>19.00</TipoGravamen>
    <CuotaIntegra>177.65</CuotaIntegra>
    <!-- ... -->
  </Calculo>

  <Representante>
    <NIF>B12345678</NIF>
    <!-- Client as fiscal representative -->
  </Representante>
</Modelo210>
```

### Certificate Management

```typescript
// Certificate lifecycle management
interface CertificateManager {
  // Load active certificate for submissions
  getActiveCertificate(): Promise<DecryptedCertificate>;

  // Upload new certificate (admin function)
  uploadCertificate(p12: Buffer, passphrase: string): Promise<void>;

  // Rotate to backup certificate
  activateBackup(): Promise<void>;

  // Check certificate expiry
  getExpiryStatus(): Promise<{
    validUntil: Date;
    daysRemaining: number;
    alertLevel: 'ok' | 'warning' | 'critical';
  }>;
}

// Expiry alerts via n8n workflow
// - 90 days before: Info notification
// - 30 days before: Warning to admin
// - 7 days before: Critical alert
// - 1 day before: Emergency alert + block new submissions
```

---

## Technology Choices Summary

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 + TypeScript | SSR for SEO, App Router for modern patterns, TypeScript for type safety |
| **API** | tRPC | End-to-end type safety between frontend and backend |
| **Database** | PostgreSQL (Supabase) | Relational integrity for financial data, RLS for security, familiar tooling |
| **Cache** | Redis | Translation caching, session storage, job queues |
| **Rules Engine** | json-rules-engine | JSON-based, supports versioning, TypeScript compatible |
| **Queue** | BullMQ (Redis-based) | Job retries, priority queues, dead-letter handling |
| **Object Storage** | Supabase Storage | Integrated with auth, simple API, S3-compatible |
| **Automation** | n8n (self-hosted) | Team expertise, 400+ integrations, visual debugging |
| **Payments** | Stripe | Well-documented, European support, webhook reliability |
| **Email** | SendGrid or Resend | Transactional email, templates, analytics |
| **SMS/WhatsApp** | Twilio | Reliable, good API, WhatsApp Business support |

---

## Security Architecture

### Data Protection

```
+------------------------------------------------------------------+
|                    SECURITY LAYERS                                |
+------------------------------------------------------------------+
|                                                                   |
|   Layer 1: Network                                               |
|   +----------------------------------------------------------+   |
|   | - HTTPS only (TLS 1.3)                                    |   |
|   | - WAF (Cloudflare or AWS WAF)                            |   |
|   | - Rate limiting at edge                                   |   |
|   +----------------------------------------------------------+   |
|                                                                   |
|   Layer 2: Authentication                                        |
|   +----------------------------------------------------------+   |
|   | - Supabase Auth (JWT tokens)                             |   |
|   | - Session management with refresh tokens                  |   |
|   | - MFA for admin accounts                                  |   |
|   +----------------------------------------------------------+   |
|                                                                   |
|   Layer 3: Authorization                                         |
|   +----------------------------------------------------------+   |
|   | - Row Level Security (RLS) in PostgreSQL                 |   |
|   | - users can only access their own data                   |   |
|   | - Admin role for client operations                        |   |
|   +----------------------------------------------------------+   |
|                                                                   |
|   Layer 4: Data Encryption                                       |
|   +----------------------------------------------------------+   |
|   | - At rest: PostgreSQL encryption                          |   |
|   | - In transit: TLS                                         |   |
|   | - Secrets: Supabase Vault                                 |   |
|   | - Sensitive fields: Application-level encryption          |   |
|   +----------------------------------------------------------+   |
|                                                                   |
|   Layer 5: Audit                                                 |
|   +----------------------------------------------------------+   |
|   | - All data changes logged                                 |   |
|   | - Admin actions tracked                                   |   |
|   | - AEAT submissions logged with timestamps                |   |
|   +----------------------------------------------------------+   |
|                                                                   |
+------------------------------------------------------------------+
```

### Sensitive Data Handling

| Data Type | Storage | Encryption | Access Control |
|-----------|---------|------------|----------------|
| User credentials | Supabase Auth | Hashed (bcrypt) | Auth system only |
| NIE/NIF numbers | PostgreSQL | Column-level encryption | RLS + user ownership |
| IBAN/Bank details | PostgreSQL | Column-level encryption | RLS + user ownership |
| P12 Certificate | Supabase Vault | AES-256 | Admin role only |
| AEAT responses | PostgreSQL | None (non-sensitive) | RLS + user ownership |

---

## Sources

**Multi-tenant SaaS Architecture:**
- [Microsoft Azure SaaS Multi-tenant Architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/saas-multitenant-solution-architecture/)
- [Multi-Tenant SaaS Architecture Cloud 2025 Guide](https://isitdev.com/multi-tenant-saas-architecture-cloud-2025/)
- [WorkOS Developer's Guide to Multi-tenant Architecture](https://workos.com/blog/developers-guide-saas-multi-tenant-architecture)

**AEAT Integration:**
- [AEAT Developer Portal](https://www.agenciatributaria.es/AEAT.desarrolladores/Desarrolladores/_menu_/Documentacion/Documentacion.html)
- [AEAT Electronic Filing - Modelo 210](https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/presentacion-declaraciones-ayuda-tecnica/modelo-210.html)
- [GitHub: AEAT Web Services (Python)](https://github.com/initios/aeat-web-services)

**Rules Engine:**
- [json-rules-engine Documentation](https://github.com/CacheControl/json-rules-engine)
- [Building JSON Rule Engine for Tax Calculations](https://medium.com/@bsimran428.sb/building-a-json-rule-engine-in-typescript-for-shipping-tax-calculations-72c3b76013b3)
- [Microsoft .NET Rules Engine](https://microsoft.github.io/RulesEngine/)

**Database i18n Patterns:**
- [Database Internationalization Design Patterns](https://medium.com/walkin/database-internationalization-i18n-localization-l10n-design-patterns-94ff372375c6)
- [Building Multilingual Relational Databases](https://thehonestcoder.com/building-multilingual-relational-databases/)
- [Best Database Structure for Multilingual Data](https://phrase.com/blog/posts/best-database-structure-for-keeping-multilingual-data/)

**Queue and Retry Patterns:**
- [Azure Retry Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry)
- [AWS SQS Retry Mechanisms](https://docs.aws.amazon.com/lambda/latest/operatorguide/sqs-retries.html)
- [Queue-Based Exponential Backoff Pattern](https://dev.to/andreparis/queue-based-exponential-backoff-a-resilient-retry-pattern-for-distributed-systems-37f3)

**Certificate Authentication:**
- [PKCS#12 Overview](https://en.wikipedia.org/wiki/PKCS_12)
- [SAP SII Certificates Guide](https://community.sap.com/t5/technology-blog-posts-by-sap/how-to-obtain-the-required-sii-certificates-from-the-spanish-tax-agency/ba-p/14069873)
- [AEAT Technical FAQ](https://sede.agenciatributaria.gob.es/Sede/en_gb/impuestos-tasas/iva/iva-libros-registro-iva-traves-aeat/preguntas-tecnicas-frecuentes.html)

**n8n Automation:**
- [n8n Documentation](https://docs.n8n.io/)
- [n8n Finance & Accounting Integrations](https://n8n.io/integrations/categories/finance-and-accounting/)
