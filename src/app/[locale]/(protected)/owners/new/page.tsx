'use client';

import { useEffect } from 'react';
import { useOwnerFormStore } from '@/stores/owner-form';
import { OwnerForm } from '@/components/owners/owner-form';

export default function NewOwnerPage() {
  const reset = useOwnerFormStore((state) => state.reset);

  // Reset form state when mounting new owner page
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="container mx-auto px-4 py-8">
      <OwnerForm />
    </div>
  );
}
