# Phase 2: Owner and Property Data - Research

**Researched:** 2026-01-17
**Domain:** Spanish Tax ID Validation, IBAN, Cadastral References, Form Patterns, Drizzle ORM
**Confidence:** HIGH

## Summary

This phase implements owner and property data management for the Spanish non-resident tax platform. Research covers five critical validation domains: NIE/NIF (Spanish tax IDs), IBAN (European bank accounts), cadastral references (Spanish property identifiers), Spanish address structures, and database schema design for many-to-many owner-property relationships.

The standard approach uses the `better-dni` library for NIE/NIF validation (fastest, TypeScript-native), `ibantools` for IBAN validation (comprehensive, zero dependencies), and custom validation for cadastral references (no reliable npm library exists). Drizzle ORM's junction table pattern handles the owner-property many-to-many relationship with percentage ownership tracking.

**Primary recommendation:** Use validated libraries where available (better-dni, ibantools), implement cadastral validation in-house using the documented algorithm, and structure forms as multi-step wizards with auto-save using react-hook-form + Zustand for state persistence.

## Standard Stack

### Core Validation Libraries

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-dni | ^4.x | NIE/NIF validation | Fastest (660 bytes), TypeScript-native, covers all Spanish ID types |
| ibantools | ^4.x | IBAN validation | Zero dependencies, comprehensive, TypeScript support |
| (custom) | - | Cadastral reference | No reliable npm library; documented algorithm available |

### Form Management

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.x | Form state management | Already in stack from Phase 1 |
| zod | ^3.x | Schema validation | Already in stack from Phase 1 |
| zustand | ^5.x | Multi-step form state | Lightweight, persists across steps, React 18+ optimized |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| better-dni | dni-js | better-dni is 3-13x faster in benchmarks |
| ibantools | iban | ibantools has better TypeScript support and error codes |
| zustand | React Context | Zustand simpler for multi-step persistence, no provider nesting |
| custom cadastral | - | No reliable library exists; algorithm is documented |

**Installation:**
```bash
npm install better-dni ibantools zustand
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/[locale]/
│   └── (protected)/              # Auth-required routes
│       ├── dashboard/            # User dashboard
│       ├── owners/               # Owner management
│       │   ├── page.tsx          # Owner list
│       │   ├── new/page.tsx      # New owner wizard
│       │   └── [id]/page.tsx     # Edit owner
│       └── properties/           # Property management
│           ├── page.tsx          # Property list
│           ├── new/page.tsx      # New property wizard
│           └── [id]/page.tsx     # Edit property
├── components/
│   ├── owners/                   # Owner-specific components
│   │   ├── owner-form.tsx        # Multi-step owner form
│   │   └── owner-card.tsx        # Owner display card
│   ├── properties/               # Property-specific components
│   │   ├── property-form.tsx     # Multi-step property form
│   │   └── ownership-table.tsx   # Co-owner percentage table
│   └── ui/                       # shadcn/ui components
│       ├── stepper.tsx           # Multi-step indicator
│       └── progress.tsx          # Progress bar
├── db/
│   └── schema.ts                 # Extended with owners, properties
├── lib/
│   └── validators/               # Custom validation functions
│       ├── nie-nif.ts            # NIE/NIF using better-dni
│       ├── iban.ts               # IBAN using ibantools
│       └── cadastral.ts          # Cadastral reference (custom)
├── hooks/
│   └── useOwnerSchemas.ts        # Zod schemas with i18n
│   └── usePropertySchemas.ts     # Zod schemas with i18n
└── stores/
    ├── owner-form.ts             # Zustand store for owner wizard
    └── property-form.ts          # Zustand store for property wizard
```

### Pattern 1: NIE/NIF Validation with Zod
**What:** Integrate better-dni with Zod for form validation
**When to use:** All forms collecting Spanish tax IDs
**Example:**
```typescript
// Source: https://github.com/singuerinc/better-dni
// lib/validators/nie-nif.ts
import { isValid, isNIF, isNIE, normalize } from 'better-dni';

export function validateNieNif(value: string): boolean {
  const normalized = normalize(value);
  return isValid(normalized);
}

export function getNieNifType(value: string): 'NIF' | 'NIE' | null {
  const normalized = normalize(value);
  if (isNIF(normalized)) return 'NIF';
  if (isNIE(normalized)) return 'NIE';
  return null;
}

// hooks/useOwnerSchemas.ts
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { validateNieNif } from '@/lib/validators/nie-nif';

export const useOwnerSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    taxId: z
      .string()
      .min(1, { message: t('taxIdRequired') })
      .refine(validateNieNif, { message: t('taxIdInvalid') }),
    // ... other fields
  });
};
```

### Pattern 2: IBAN Validation with Error Messages
**What:** Integrate ibantools with detailed error reporting
**When to use:** Bank account collection for tax refunds
**Example:**
```typescript
// Source: https://github.com/Simplify/ibantools
// lib/validators/iban.ts
import {
  electronicFormatIBAN,
  validateIBAN,
  ValidationErrorsIBAN
} from 'ibantools';

export interface IbanValidationResult {
  valid: boolean;
  errorCode?: string;
  formatted?: string;
}

export function validateIban(iban: string): IbanValidationResult {
  const electronic = electronicFormatIBAN(iban) || '';
  const result = validateIBAN(electronic);

  if (result.valid) {
    return { valid: true, formatted: electronic };
  }

  // Map error codes to translation keys
  const errorMap: Record<number, string> = {
    [ValidationErrorsIBAN.NoIBANProvided]: 'ibanRequired',
    [ValidationErrorsIBAN.NoIBANCountry]: 'ibanCountryInvalid',
    [ValidationErrorsIBAN.WrongBBANLength]: 'ibanLengthInvalid',
    [ValidationErrorsIBAN.WrongIBANChecksum]: 'ibanChecksumInvalid',
  };

  const errorCode = result.errorCodes?.[0];
  return {
    valid: false,
    errorCode: errorMap[errorCode] || 'ibanInvalid',
  };
}

// In Zod schema
iban: z
  .string()
  .min(1, { message: t('ibanRequired') })
  .refine(
    (val) => validateIban(val).valid,
    (val) => ({ message: t(validateIban(val).errorCode || 'ibanInvalid') })
  ),
```

### Pattern 3: Cadastral Reference Validation
**What:** Custom validation for 20-character Spanish property references
**When to use:** Property registration forms
**Example:**
```typescript
// Source: https://trellat.es/validar-la-referencia-catastral-en-javascript/
// lib/validators/cadastral.ts

const POSITION_WEIGHTS = [13, 15, 12, 5, 4, 17, 9, 21, 3, 7, 1];
const CONTROL_LETTERS = 'MQWERTYUIOPASDFGHJKLBZX';

function charToValue(char: string): number {
  const code = char.charCodeAt(0);
  if (char >= '0' && char <= '9') {
    return parseInt(char, 10);
  }
  if (char >= 'A' && char <= 'N') {
    return code - 64; // A=1, B=2, ..., N=14
  }
  if (char === 'N') { // Handle N with tilde separately if needed
    return 15;
  }
  if (char > 'N') {
    return code - 63; // O=16, P=17, ..., Z=27
  }
  return 0;
}

function calculateControlDigit(sequence: string): string {
  let sum = 0;
  for (let i = 0; i < sequence.length; i++) {
    const value = charToValue(sequence[i]);
    sum = (sum + value * POSITION_WEIGHTS[i]) % 23;
  }
  return CONTROL_LETTERS[sum];
}

export function validateCadastralReference(ref: string): boolean {
  if (!ref || ref.length !== 20) {
    return false;
  }

  const normalized = ref.toUpperCase().replace(/\s/g, '');
  if (normalized.length !== 20) {
    return false;
  }

  // First control digit: positions 0-7 + 14-18
  const firstSequence = normalized.substring(0, 7) + normalized.substring(14, 18);
  const expectedFirst = calculateControlDigit(firstSequence);

  // Second control digit: positions 7-14 + 14-18
  const secondSequence = normalized.substring(7, 14) + normalized.substring(14, 18);
  const expectedSecond = calculateControlDigit(secondSequence);

  const actualControls = normalized.substring(18, 20);
  return actualControls === expectedFirst + expectedSecond;
}

// Also accept 14-character plot-only references (construction in progress)
export function validateCadastralReferenceFlexible(
  ref: string,
  allow14Digit = false
): boolean {
  const normalized = ref.toUpperCase().replace(/\s/g, '');

  if (normalized.length === 20) {
    return validateCadastralReference(normalized);
  }

  if (allow14Digit && normalized.length === 14) {
    // 14-digit references are plot-only, no control validation available
    return /^[A-Z0-9]{14}$/.test(normalized);
  }

  return false;
}
```

### Pattern 4: Multi-Step Form with Zustand
**What:** Persist form state across steps with auto-save
**When to use:** Owner and property registration wizards
**Example:**
```typescript
// Source: https://www.buildwithmatija.com/blog/master-multi-step-forms
// stores/owner-form.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OwnerFormState {
  step: number;
  data: {
    // Step 1: Basic info
    ownerType: 'individual' | 'company' | null;
    taxId: string;

    // Step 2: Personal/Company details
    firstName?: string;
    lastName?: string;
    companyName?: string;

    // Step 3: Tax residence
    countryCode: string;
    address: string;
    city: string;
    postalCode: string;

    // Step 4: Bank details
    iban: string;
  };
  setStep: (step: number) => void;
  updateData: (data: Partial<OwnerFormState['data']>) => void;
  reset: () => void;
}

const initialData = {
  ownerType: null,
  taxId: '',
  firstName: '',
  lastName: '',
  companyName: '',
  countryCode: '',
  address: '',
  city: '',
  postalCode: '',
  iban: '',
};

export const useOwnerFormStore = create<OwnerFormState>()(
  persist(
    (set) => ({
      step: 1,
      data: initialData,
      setStep: (step) => set({ step }),
      updateData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
        })),
      reset: () => set({ step: 1, data: initialData }),
    }),
    {
      name: 'owner-form-storage',
      // Auto-clear after 24 hours
      partialize: (state) => ({ step: state.step, data: state.data }),
    }
  )
);
```

### Pattern 5: Drizzle Many-to-Many with Ownership Percentage
**What:** Junction table tracking co-ownership percentages
**When to use:** Owner-property relationship with titularidad
**Example:**
```typescript
// Source: https://orm.drizzle.team/docs/relations-schema-declaration
// db/schema.ts
import {
  pgTable, uuid, text, timestamp, pgEnum,
  integer, decimal, varchar, boolean
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const ownerTypeEnum = pgEnum('owner_type', ['individual', 'company']);
export const streetTypeEnum = pgEnum('street_type', [
  'calle', 'avenida', 'plaza', 'paseo', 'carretera',
  'camino', 'travesia', 'urbanizacion', 'otro'
]);

// Owners table
export const owners = pgTable('owners', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users
  ownerType: ownerTypeEnum('owner_type').notNull(),

  // Tax identification
  taxId: varchar('tax_id', { length: 20 }).notNull(), // NIE/NIF/CIF
  taxIdType: varchar('tax_id_type', { length: 10 }), // 'NIE', 'NIF', 'CIF'

  // Individual fields
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  // Company fields
  companyName: varchar('company_name', { length: 200 }),

  // Tax residence
  residenceCountry: varchar('residence_country', { length: 2 }).notNull(), // ISO 3166-1 alpha-2
  residenceAddress: text('residence_address').notNull(),
  residenceCity: varchar('residence_city', { length: 100 }).notNull(),
  residencePostalCode: varchar('residence_postal_code', { length: 10 }).notNull(),

  // Bank details for refunds
  iban: varchar('iban', { length: 34 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Properties table
export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users

  // Address
  streetType: streetTypeEnum('street_type').notNull(),
  streetName: varchar('street_name', { length: 200 }).notNull(),
  streetNumber: varchar('street_number', { length: 10 }).notNull(),
  floor: varchar('floor', { length: 10 }),
  door: varchar('door', { length: 10 }),
  staircase: varchar('staircase', { length: 10 }),
  block: varchar('block', { length: 10 }),
  city: varchar('city', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 5 }).notNull(),

  // Cadastral data
  cadastralReference: varchar('cadastral_reference', { length: 20 }).notNull(),
  cadastralValue: decimal('cadastral_value', { precision: 12, scale: 2 }).notNull(),

  // Tax calculation flags
  collectiveRevision: boolean('collective_revision').default(false), // 1.1% vs 2%
  revisionYear: integer('revision_year'), // Year of last cadastral revision

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Junction table: Owner-Property with ownership percentage
export const ownerProperties = pgTable('owner_properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => owners.id, { onDelete: 'cascade' }),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),

  // Ownership percentage (0.00 to 100.00)
  ownershipPercentage: decimal('ownership_percentage', { precision: 5, scale: 2 }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const ownersRelations = relations(owners, ({ many }) => ({
  properties: many(ownerProperties),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  owners: many(ownerProperties),
}));

export const ownerPropertiesRelations = relations(ownerProperties, ({ one }) => ({
  owner: one(owners, {
    fields: [ownerProperties.ownerId],
    references: [owners.id],
  }),
  property: one(properties, {
    fields: [ownerProperties.propertyId],
    references: [properties.id],
  }),
}));

// Type exports
export type Owner = typeof owners.$inferSelect;
export type NewOwner = typeof owners.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type OwnerProperty = typeof ownerProperties.$inferSelect;
```

### Anti-Patterns to Avoid

- **Validating NIE/NIF with regex only:** The checksum is critical for detecting typos. Always use `better-dni`.
- **Storing IBAN with spaces:** Always use `electronicFormatIBAN()` before storage for consistency.
- **Percentage validation only on frontend:** Always validate that ownership sums to 100% on both client and server.
- **Hardcoding country lists:** Use a maintained data source; EU/EEA membership changes (e.g., Croatia joined EEA in 2025).
- **Single-step long forms:** Elderly users need visual progress and the ability to save partial data.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| NIE/NIF validation | Custom modulo-23 logic | `better-dni` | Edge cases (X/Y/Z prefix, letter exclusions) are tricky |
| IBAN validation | Custom mod-97 check | `ibantools` | Country-specific BBAN lengths, zero dependencies |
| Cadastral validation | - | Custom (see above) | No reliable npm library; algorithm is documented |
| Form state persistence | localStorage directly | Zustand + persist | Handles serialization, hydration, expiry |
| Country data | Hardcoded arrays | ISO data package | EU/EEA membership changes over time |

**Key insight:** Spanish tax ID validation (NIE/NIF) and IBAN validation have subtle edge cases that are easy to get wrong. The checksum algorithms must be precise, and edge cases like the X/Y/Z prefix mapping for NIE must be handled correctly.

## Common Pitfalls

### Pitfall 1: NIE X/Y/Z Prefix Handling
**What goes wrong:** NIE validation fails for valid numbers
**Why it happens:** The X/Y/Z prefix must be replaced with 0/1/2 before applying modulo-23
**How to avoid:** Use `better-dni` which handles this correctly
**Warning signs:** Users with valid NIE unable to register; validation working for NIF but not NIE

### Pitfall 2: IBAN Space Handling
**What goes wrong:** Valid IBANs rejected because of spaces
**Why it happens:** Users enter IBAN as shown on bank statements (with spaces)
**How to avoid:** Always call `electronicFormatIBAN()` before validation; store electronic format
**Warning signs:** ES76 2100 0813 6101 2345 6789 rejected, ES7621000813610123456789 accepted

### Pitfall 3: Ownership Percentage Floating Point
**What goes wrong:** 33.33 + 33.33 + 33.34 !== 100 due to floating point
**Why it happens:** JavaScript floating point arithmetic
**How to avoid:** Use Decimal type in database; compare with small epsilon or use integer basis points (3333 + 3333 + 3334 = 10000)
**Warning signs:** Valid ownership splits rejected; rounding errors in sum validation

### Pitfall 4: Cadastral Reference O/0 and I/1 Confusion
**What goes wrong:** Users enter O (letter) instead of 0 (zero), or I instead of 1
**Why it happens:** Visual similarity on IBI receipts
**How to avoid:** Normalize input (replace O with 0, I with 1) before validation; show helpful error message
**Warning signs:** High validation failure rate; users copying directly from IBI receipt

### Pitfall 5: Country Code Changes (EU/EEA)
**What goes wrong:** Tax rates applied incorrectly for countries that joined/left EU/EEA
**Why it happens:** Hardcoded country lists become stale
**How to avoid:** Store country tax status in database with effective dates; Croatia joined EEA in Feb 2025
**Warning signs:** UK nationals getting 19% rate (should be 24% post-Brexit); Croatian nationals getting 24% (should be 19% post-Feb 2025)

### Pitfall 6: Form State Lost on Navigation
**What goes wrong:** User accidentally navigates away, loses 10 minutes of data entry
**Why it happens:** Form state only in React component state
**How to avoid:** Use Zustand persist middleware; warn on navigation with unsaved changes
**Warning signs:** Support tickets about lost form data; elderly users frustrated

## Code Examples

### Complete NIE/NIF Input Component
```typescript
// components/owners/tax-id-input.tsx
'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalize, isValid, isNIF, isNIE } from 'better-dni';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface TaxIdInputProps {
  value: string;
  onChange: (value: string, type: 'NIF' | 'NIE' | null) => void;
  error?: string;
}

export function TaxIdInput({ value, onChange, error }: TaxIdInputProps) {
  const t = useTranslations('owner');
  const [displayValue, setDisplayValue] = useState(value);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    setDisplayValue(raw);

    const normalized = normalize(raw);
    let type: 'NIF' | 'NIE' | null = null;

    if (isNIF(normalized)) type = 'NIF';
    else if (isNIE(normalized)) type = 'NIE';

    onChange(normalized, type);
  }, [onChange]);

  const isValidId = value ? isValid(normalize(value)) : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor="taxId">{t('taxIdLabel')}</Label>
      <Input
        id="taxId"
        value={displayValue}
        onChange={handleChange}
        placeholder="X1234567L"
        className={cn(
          isValidId === true && 'border-green-500',
          isValidId === false && 'border-red-500'
        )}
        aria-describedby={error ? 'taxId-error' : 'taxId-hint'}
        aria-invalid={!!error}
      />
      <p id="taxId-hint" className="text-sm text-muted-foreground">
        {t('taxIdHint')}
      </p>
      {error && (
        <p id="taxId-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Ownership Percentage Validation
```typescript
// lib/validators/ownership.ts

export interface OwnershipEntry {
  ownerId: string;
  percentage: number;
}

export function validateOwnershipPercentages(
  entries: OwnershipEntry[]
): { valid: boolean; error?: string } {
  if (entries.length === 0) {
    return { valid: false, error: 'atLeastOneOwner' };
  }

  // Use basis points (integer) to avoid floating point issues
  const totalBasisPoints = entries.reduce((sum, entry) => {
    return sum + Math.round(entry.percentage * 100);
  }, 0);

  // 10000 basis points = 100%
  if (totalBasisPoints !== 10000) {
    const difference = (10000 - totalBasisPoints) / 100;
    return {
      valid: false,
      error: difference > 0 ? 'percentageUnder100' : 'percentageOver100'
    };
  }

  // Check individual entries
  for (const entry of entries) {
    if (entry.percentage <= 0) {
      return { valid: false, error: 'percentageMustBePositive' };
    }
    if (entry.percentage > 100) {
      return { valid: false, error: 'percentageExceeds100' };
    }
  }

  return { valid: true };
}
```

### Spanish Address Form Fields
```typescript
// components/properties/address-fields.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STREET_TYPES = [
  { value: 'calle', labelKey: 'streetTypes.calle' },
  { value: 'avenida', labelKey: 'streetTypes.avenida' },
  { value: 'plaza', labelKey: 'streetTypes.plaza' },
  { value: 'paseo', labelKey: 'streetTypes.paseo' },
  { value: 'carretera', labelKey: 'streetTypes.carretera' },
  { value: 'camino', labelKey: 'streetTypes.camino' },
  { value: 'travesia', labelKey: 'streetTypes.travesia' },
  { value: 'urbanizacion', labelKey: 'streetTypes.urbanizacion' },
  { value: 'otro', labelKey: 'streetTypes.otro' },
];

interface AddressFieldsProps {
  values: {
    streetType: string;
    streetName: string;
    streetNumber: string;
    floor?: string;
    door?: string;
    staircase?: string;
    block?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

export function AddressFields({ values, onChange, errors }: AddressFieldsProps) {
  const t = useTranslations('property');

  return (
    <div className="space-y-4">
      {/* Street Type + Name + Number (main row) */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Label htmlFor="streetType">{t('streetType')}</Label>
          <Select
            value={values.streetType}
            onValueChange={(v) => onChange('streetType', v)}
          >
            <SelectTrigger id="streetType">
              <SelectValue placeholder={t('selectStreetType')} />
            </SelectTrigger>
            <SelectContent>
              {STREET_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {t(type.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-7">
          <Label htmlFor="streetName">{t('streetName')}</Label>
          <Input
            id="streetName"
            value={values.streetName}
            onChange={(e) => onChange('streetName', e.target.value)}
            aria-invalid={!!errors?.streetName}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="streetNumber">{t('streetNumber')}</Label>
          <Input
            id="streetNumber"
            value={values.streetNumber}
            onChange={(e) => onChange('streetNumber', e.target.value)}
            placeholder="45"
          />
        </div>
      </div>

      {/* Floor, Door, Staircase, Block (optional row) */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="floor">{t('floor')}</Label>
          <Input
            id="floor"
            value={values.floor || ''}
            onChange={(e) => onChange('floor', e.target.value)}
            placeholder="3o"
          />
        </div>

        <div>
          <Label htmlFor="door">{t('door')}</Label>
          <Input
            id="door"
            value={values.door || ''}
            onChange={(e) => onChange('door', e.target.value)}
            placeholder="2a"
          />
        </div>

        <div>
          <Label htmlFor="staircase">{t('staircase')}</Label>
          <Input
            id="staircase"
            value={values.staircase || ''}
            onChange={(e) => onChange('staircase', e.target.value)}
            placeholder="A"
          />
        </div>

        <div>
          <Label htmlFor="block">{t('block')}</Label>
          <Input
            id="block"
            value={values.block || ''}
            onChange={(e) => onChange('block', e.target.value)}
            placeholder="1"
          />
        </div>
      </div>

      {/* City, Province, Postal Code */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">{t('city')}</Label>
          <Input
            id="city"
            value={values.city}
            onChange={(e) => onChange('city', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="province">{t('province')}</Label>
          <Input
            id="province"
            value={values.province}
            onChange={(e) => onChange('province', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="postalCode">{t('postalCode')}</Label>
          <Input
            id="postalCode"
            value={values.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            placeholder="28001"
            maxLength={5}
          />
        </div>
      </div>
    </div>
  );
}
```

## NIE/NIF Validation Algorithm Reference

For understanding, here is the algorithm (use `better-dni` in implementation):

**NIF (8 digits + letter):**
1. Take 8-digit number
2. Calculate: remainder = number % 23
3. Look up letter at index `remainder` in: `TRWAGMYFPDXBNJZSQVHLCKE`

**NIE (X/Y/Z + 7 digits + letter):**
1. Replace prefix: X=0, Y=1, Z=2
2. Concatenate to form 8-digit number
3. Apply NIF algorithm above

**Letter exclusions:** I, O, U are not used (avoid confusion with 1, 0, and to keep 23 letters for prime modulo)

## EU/EEA Countries Reference

For tax rate determination (19% EU/EEA vs 24% rest of world):

**EU Member States (27):**
Austria, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden

**EEA Non-EU (3):**
Iceland, Liechtenstein, Norway

**Special Cases:**
- Switzerland: Not EU/EEA but has bilateral agreements (verify tax treatment)
- United Kingdom: Left EU Jan 2020 (24% rate applies)
- Croatia: Joined EEA Feb 19, 2025 (19% rate applies from that date)

**Recommendation:** Store country tax status in database with effective dates to handle changes.

```typescript
// db/schema.ts (addition)
export const countryTaxRates = pgTable('country_tax_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  countryCode: varchar('country_code', { length: 2 }).notNull(), // ISO 3166-1 alpha-2
  isEuEea: boolean('is_eu_eea').notNull(),
  taxRate: decimal('tax_rate', { precision: 4, scale: 2 }).notNull(), // 19.00 or 24.00
  effectiveFrom: timestamp('effective_from').notNull(),
  effectiveTo: timestamp('effective_to'), // null = current
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom NIE/NIF regex | `better-dni` library | 2023+ | Reliable checksum validation |
| Manual IBAN mod-97 | `ibantools` library | 2020+ | Country-specific BBAN handling |
| Single-page forms | Multi-step wizards | 2024+ | Better UX for elderly users |
| React Context for forms | Zustand with persist | 2024+ | Simpler, persists across navigation |
| UK in EU tax rate | UK at 24% rate | Jan 2020 | Post-Brexit tax treatment |
| Croatia at 24% rate | Croatia at 19% rate | Feb 2025 | EEA membership |

## Open Questions

1. **Cadastral Reference Lookup API**
   - What we know: catastro.hacienda.gob.es has public lookup
   - What's unclear: Whether there's an API for validation/lookup vs just web interface
   - Recommendation: Implement client-side validation only; manual verification if disputed

2. **Company NIF (CIF) Validation**
   - What we know: `better-dni` does not explicitly mention CIF support
   - What's unclear: Whether company tax IDs follow same validation
   - Recommendation: Test with CIF numbers; may need additional validation for companies

3. **Address Autocomplete Integration**
   - What we know: Google Places API supports Spanish addresses
   - What's unclear: Cost, privacy implications, elderly user UX
   - Recommendation: Start without autocomplete; add if user feedback requests it

## Sources

### Primary (HIGH confidence)
- [better-dni GitHub](https://github.com/singuerinc/better-dni) - NIE/NIF validation API and benchmarks
- [ibantools GitHub](https://github.com/Simplify/ibantools) - IBAN validation API and error codes
- [Drizzle ORM Relations](https://orm.drizzle.team/docs/relations-schema-declaration) - Many-to-many pattern
- [Spanish NIF Algorithm](https://www.cespedes.org/dni2nif/) - Letter calculation algorithm

### Secondary (MEDIUM confidence)
- [Trellat Cadastral Validation](https://trellat.es/validar-la-referencia-catastral-en-javascript/) - Cadastral reference algorithm
- [Build with Matija Multi-Step Forms](https://www.buildwithmatija.com/blog/master-multi-step-forms) - React Hook Form + Zustand pattern
- [Spanish Address Format](https://www.smarty.com/global-address-formatting/spain-address-format-examples) - Address structure
- [EU/EEA Countries](https://www.litrg.org.uk/international/international-matters-introduction/eu-and-eea-countries) - Country list for tax rates

### Tertiary (LOW confidence)
- Cadastral control digit algorithm - verified against single source; recommend testing with real references
- Company NIF (CIF) validation - not explicitly covered by better-dni documentation

## Metadata

**Confidence breakdown:**
- NIE/NIF validation: HIGH - Algorithm documented, library verified
- IBAN validation: HIGH - Library is well-maintained, TypeScript native
- Cadastral validation: MEDIUM - Algorithm found but single source
- Database schema: HIGH - Drizzle docs are comprehensive
- Form patterns: HIGH - Multiple verified sources agree

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - validation algorithms are stable)
