'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { owners } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateNieNif, normalizeNieNif, getNieNifType } from '@/lib/validators';
import { formatIbanForStorage, validateIban } from '@/lib/validators';

interface OwnerInput {
  ownerType: 'individual' | 'company';
  taxId: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  residenceCountry: string;
  residenceAddress: string;
  residenceCity: string;
  residencePostalCode: string;
  iban?: string;
}

export async function createOwner(data: OwnerInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Validate tax ID
  if (!validateNieNif(data.taxId)) {
    return { error: 'Invalid tax ID' };
  }

  // Validate IBAN if provided
  if (data.iban && data.iban.trim() !== '' && !validateIban(data.iban).valid) {
    return { error: 'Invalid IBAN' };
  }

  try {
    const [owner] = await db.insert(owners).values({
      userId: user.id,
      ownerType: data.ownerType,
      taxId: normalizeNieNif(data.taxId),
      taxIdType: getNieNifType(data.taxId),
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      companyName: data.companyName || null,
      residenceCountry: data.residenceCountry,
      residenceAddress: data.residenceAddress,
      residenceCity: data.residenceCity,
      residencePostalCode: data.residencePostalCode,
      iban: data.iban && data.iban.trim() !== '' ? formatIbanForStorage(data.iban) : null,
    }).returning();

    revalidatePath('/owners');
    return { success: true, owner };
  } catch (error) {
    console.error('Error creating owner:', error);
    return { error: 'Failed to create owner' };
  }
}

export async function updateOwner(id: string, data: OwnerInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Validate tax ID
  if (!validateNieNif(data.taxId)) {
    return { error: 'Invalid tax ID' };
  }

  // Validate IBAN if provided
  if (data.iban && data.iban.trim() !== '' && !validateIban(data.iban).valid) {
    return { error: 'Invalid IBAN' };
  }

  try {
    const [owner] = await db.update(owners)
      .set({
        ownerType: data.ownerType,
        taxId: normalizeNieNif(data.taxId),
        taxIdType: getNieNifType(data.taxId),
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        companyName: data.companyName || null,
        residenceCountry: data.residenceCountry,
        residenceAddress: data.residenceAddress,
        residenceCity: data.residenceCity,
        residencePostalCode: data.residencePostalCode,
        iban: data.iban && data.iban.trim() !== '' ? formatIbanForStorage(data.iban) : null,
        updatedAt: new Date(),
      })
      .where(and(eq(owners.id, id), eq(owners.userId, user.id)))
      .returning();

    if (!owner) {
      return { error: 'Owner not found' };
    }

    revalidatePath('/owners');
    return { success: true, owner };
  } catch (error) {
    console.error('Error updating owner:', error);
    return { error: 'Failed to update owner' };
  }
}

export async function deleteOwner(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  try {
    const result = await db.delete(owners)
      .where(and(eq(owners.id, id), eq(owners.userId, user.id)))
      .returning();

    if (result.length === 0) {
      return { error: 'Owner not found' };
    }

    revalidatePath('/owners');
    return { success: true };
  } catch (error) {
    console.error('Error deleting owner:', error);
    return { error: 'Failed to delete owner' };
  }
}

export async function getOwners() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return db.select().from(owners).where(eq(owners.userId, user.id));
}

export async function getOwnerById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [owner] = await db.select()
    .from(owners)
    .where(and(eq(owners.id, id), eq(owners.userId, user.id)));

  return owner || null;
}
