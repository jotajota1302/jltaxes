import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  varchar,
  decimal,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

// Language enum matching i18n config
export const languageEnum = pgEnum('language', ['es', 'en', 'de', 'fr']);

// Owner type enum: individual or company
export const ownerTypeEnum = pgEnum('owner_type', ['individual', 'company']);

// Spanish street type enum
export const streetTypeEnum = pgEnum('street_type', [
  'calle',
  'avenida',
  'plaza',
  'paseo',
  'carretera',
  'camino',
  'travesia',
  'urbanizacion',
  'otro',
]);

// ============================================================================
// USER PREFERENCES TABLE
// ============================================================================

// User preferences (extends Supabase auth.users via foreign key)
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // References auth.users(id)
  preferredLanguage: languageEnum('preferred_language').default('es').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// OWNERS TABLE
// ============================================================================

// Owners table - stores fiscal data for non-resident property owners
export const owners = pgTable('owners', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users(id) conceptually

  // Owner type
  ownerType: ownerTypeEnum('owner_type').notNull(),

  // Tax identification
  taxId: varchar('tax_id', { length: 20 }).notNull(), // Normalized NIE/NIF/CIF
  taxIdType: varchar('tax_id_type', { length: 10 }), // 'NIE', 'NIF', 'CIF'

  // Individual owner fields
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  // Company owner fields
  companyName: varchar('company_name', { length: 200 }),

  // Tax residence address (foreign address)
  residenceCountry: varchar('residence_country', { length: 2 }).notNull(), // ISO 3166-1 alpha-2
  residenceAddress: text('residence_address').notNull(),
  residenceCity: varchar('residence_city', { length: 100 }).notNull(),
  residencePostalCode: varchar('residence_postal_code', { length: 10 }).notNull(),

  // Bank details for tax refunds (optional)
  iban: varchar('iban', { length: 34 }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// PROPERTIES TABLE
// ============================================================================

// Properties table - stores Spanish property data for tax declarations
export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users(id) conceptually

  // Spanish address structure
  streetType: streetTypeEnum('street_type').notNull(),
  streetName: varchar('street_name', { length: 200 }).notNull(),
  streetNumber: varchar('street_number', { length: 10 }).notNull(),
  floor: varchar('floor', { length: 10 }),
  door: varchar('door', { length: 10 }),
  staircase: varchar('staircase', { length: 10 }),
  block: varchar('block', { length: 10 }),
  city: varchar('city', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 5 }).notNull(), // Spanish postal codes are 5 digits

  // Cadastral data
  cadastralReference: varchar('cadastral_reference', { length: 20 }).notNull(),
  cadastralValue: decimal('cadastral_value', { precision: 12, scale: 2 }).notNull(),

  // Tax calculation flags
  collectiveRevision: boolean('collective_revision').default(false), // 1.1% vs 2% cadastral rate
  revisionYear: integer('revision_year'), // Year of last cadastral revision

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// OWNER-PROPERTIES JUNCTION TABLE
// ============================================================================

// Junction table for many-to-many owner-property relationship with ownership percentage
export const ownerProperties = pgTable('owner_properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => owners.id, { onDelete: 'cascade' }),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),

  // Ownership percentage (0.00 to 100.00)
  // Each co-owner files separate declaration based on their percentage
  ownershipPercentage: decimal('ownership_percentage', { precision: 5, scale: 2 }).notNull(),

  // Timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// DRIZZLE RELATIONS
// ============================================================================

// Owner relations - one owner can have many property associations
export const ownersRelations = relations(owners, ({ many }) => ({
  properties: many(ownerProperties),
}));

// Property relations - one property can have many owner associations
export const propertiesRelations = relations(properties, ({ many }) => ({
  owners: many(ownerProperties),
}));

// Owner-Property junction relations
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

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// User Preferences types
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;

// Owner types
export type Owner = typeof owners.$inferSelect;
export type NewOwner = typeof owners.$inferInsert;

// Property types
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

// Owner-Property junction types
export type OwnerProperty = typeof ownerProperties.$inferSelect;
export type NewOwnerProperty = typeof ownerProperties.$inferInsert;
