'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { PropertyForm } from '@/components/properties/property-form';
import { getPropertyById } from '@/app/[locale]/(protected)/properties/actions';
import { getOwners } from '@/app/[locale]/(protected)/owners/actions';
import type { Owner, Property } from '@/db/schema';

type PropertyWithOwners = Property & {
  owners: { ownerId: string; ownershipPercentage: string }[];
};

export default function EditPropertyPage() {
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<PropertyWithOwners | null>(null);
  const [availableOwners, setAvailableOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  // Fetch property and owners
  useEffect(() => {
    async function fetchData() {
      const [propertyData, ownersData] = await Promise.all([
        getPropertyById(id),
        getOwners(),
      ]);

      if (!propertyData) {
        setNotFoundState(true);
        setLoading(false);
        return;
      }

      setProperty(propertyData as PropertyWithOwners);
      setAvailableOwners(ownersData);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (notFoundState) {
    notFound();
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="h-12 w-48 bg-muted animate-pulse rounded mb-8" />
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertyForm property={property} availableOwners={availableOwners} />
    </div>
  );
}
