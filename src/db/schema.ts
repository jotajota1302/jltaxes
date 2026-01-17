import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Language enum matching i18n config
export const languageEnum = pgEnum('language', ['es', 'en', 'de', 'fr']);

// User preferences (extends Supabase auth.users via foreign key)
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // References auth.users(id)
  preferredLanguage: languageEnum('preferred_language').default('es').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports for TypeScript
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
