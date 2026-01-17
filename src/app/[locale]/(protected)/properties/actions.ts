'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { properties, ownerProperties, owners } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateCadastralReference, normalizeCadastralReference } from '@/lib/validators';
import { validateOwnershipPercentages } from '@/lib/validators';

interface OwnershipInput {
  ownerId: string;
  percentage: number;
}

interface PropertyInput {
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
  cadastralReference: string;
  cadastralValue: string;
  collectiveRevision: boolean;
  revisionYear?: string;
  owners: OwnershipInput[];
}

export async function createProperty(data: PropertyInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Validate cadastral reference
  if (!validateCadastralReference(data.cadastralReference)) {
    return { error: 'Invalid cadastral reference' };
  }

  // Validate ownership percentages
  const ownershipValidation = validateOwnershipPercentages(data.owners);
  if (!ownershipValidation.valid) {
    return { error: ownershipValidation.errorCode || 'Invalid ownership' };
  }

  try {
    // Insert property
    const [property] = await db
      .insert(properties)
      .values({
        userId: user.id,
        streetType: data.streetType as 'calle' | 'avenida' | 'plaza' | 'paseo' | 'carretera' | 'camino' | 'travesia' | 'urbanizacion' | 'otro',
        streetName: data.streetName,
        streetNumber: data.streetNumber,
        floor: data.floor || null,
        door: data.door || null,
        staircase: data.staircase || null,
        block: data.block || null,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        cadastralReference: normalizeCadastralReference(data.cadastralReference),
        cadastralValue: data.cadastralValue,
        collectiveRevision: data.collectiveRevision,
        revisionYear: data.revisionYear ? parseInt(data.revisionYear) : null,
      })
      .returning();

    // Insert ownership records
    if (data.owners.length > 0) {
      await db.insert(ownerProperties).values(
        data.owners.map((o) => ({
          ownerId: o.ownerId,
          propertyId: property.id,
          ownershipPercentage: o.percentage.toString(),
        }))
      );
    }

    revalidatePath('/properties');
    return { success: true, property };
  } catch (error) {
    console.error('Error creating property:', error);
    return { error: 'Failed to create property' };
  }
}

export async function updateProperty(id: string, data: PropertyInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Validate cadastral reference
  if (!validateCadastralReference(data.cadastralReference)) {
    return { error: 'Invalid cadastral reference' };
  }

  // Validate ownership percentages
  const ownershipValidation = validateOwnershipPercentages(data.owners);
  if (!ownershipValidation.valid) {
    return { error: ownershipValidation.errorCode || 'Invalid ownership' };
  }

  try {
    // Update property
    const [property] = await db
      .update(properties)
      .set({
        streetType: data.streetType as 'calle' | 'avenida' | 'plaza' | 'paseo' | 'carretera' | 'camino' | 'travesia' | 'urbanizacion' | 'otro',
        streetName: data.streetName,
        streetNumber: data.streetNumber,
        floor: data.floor || null,
        door: data.door || null,
        staircase: data.staircase || null,
        block: data.block || null,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        cadastralReference: normalizeCadastralReference(data.cadastralReference),
        cadastralValue: data.cadastralValue,
        collectiveRevision: data.collectiveRevision,
        revisionYear: data.revisionYear ? parseInt(data.revisionYear) : null,
        updatedAt: new Date(),
      })
      .where(and(eq(properties.id, id), eq(properties.userId, user.id)))
      .returning();

    if (!property) {
      return { error: 'Property not found' };
    }

    // Delete existing ownership records
    await db.delete(ownerProperties).where(eq(ownerProperties.propertyId, id));

    // Insert new ownership records
    if (data.owners.length > 0) {
      await db.insert(ownerProperties).values(
        data.owners.map((o) => ({
          ownerId: o.ownerId,
          propertyId: property.id,
          ownershipPercentage: o.percentage.toString(),
        }))
      );
    }

    revalidatePath('/properties');
    return { success: true, property };
  } catch (error) {
    console.error('Error updating property:', error);
    return { error: 'Failed to update property' };
  }
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  try {
    // Ownership records deleted by cascade
    const result = await db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, user.id)))
      .returning();

    if (result.length === 0) {
      return { error: 'Property not found' };
    }

    revalidatePath('/properties');
    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { error: 'Failed to delete property' };
  }
}

export async function getProperties() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get properties with their ownership records
  const propertyList = await db
    .select()
    .from(properties)
    .where(eq(properties.userId, user.id));

  // Get ownership for each property
  const results = await Promise.all(
    propertyList.map(async (property) => {
      const ownerships = await db
        .select({
          ownershipPercentage: ownerProperties.ownershipPercentage,
          ownerId: ownerProperties.ownerId,
          ownerName: owners.firstName,
          ownerLastName: owners.lastName,
          companyName: owners.companyName,
          ownerType: owners.ownerType,
        })
        .from(ownerProperties)
        .innerJoin(owners, eq(ownerProperties.ownerId, owners.id))
        .where(eq(ownerProperties.propertyId, property.id));

      return { ...property, owners: ownerships };
    })
  );

  return results;
}

export async function getPropertyById(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, user.id)));

  if (!property) {
    return null;
  }

  const ownerships = await db
    .select({
      ownershipPercentage: ownerProperties.ownershipPercentage,
      ownerId: ownerProperties.ownerId,
    })
    .from(ownerProperties)
    .where(eq(ownerProperties.propertyId, id));

  return { ...property, owners: ownerships };
}
