'use client';

import { useEffect, useState } from 'react';
import { usePropertyFormStore } from '@/stores/property-form';
import { PropertyForm } from '@/components/properties/property-form';
import { getOwners } from '@/app/[locale]/(protected)/owners/actions';
import type { Owner } from '@/db/schema';

export default function NewPropertyPage() {
  const reset = usePropertyFormStore((state) => state.reset);
  const [availableOwners, setAvailableOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset form state when mounting new property page
  useEffect(() => {
    reset();
  }, [reset]);

  // Fetch available owners
  useEffect(() => {
    async function fetchOwners() {
      const owners = await getOwners();
      setAvailableOwners(owners);
      setLoading(false);
    }
    fetchOwners();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertyForm availableOwners={availableOwners} />
    </div>
  );
}
