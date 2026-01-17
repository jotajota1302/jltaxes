import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use connection pooling with Transaction mode (disable prepare for Supabase pooler)
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
});

export const db = drizzle(client, { schema });
