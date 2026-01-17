'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Building2, User } from 'lucide-react';
import type { Owner } from '@/db/schema';
import { deleteOwner } from '@/app/[locale]/(protected)/owners/actions';

interface OwnerCardProps {
  owner: Owner;
}

/**
 * OwnerCard Component
 * Displays owner information with edit/delete actions
 * A11Y-01: 18px+ text
 * A11Y-02: 48px touch targets for action buttons
 */
export function OwnerCard({ owner }: OwnerCardProps) {
  const t = useTranslations('owner');
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = owner.ownerType === 'individual'
    ? `${owner.firstName} ${owner.lastName}`
    : owner.companyName;

  const handleEdit = () => {
    router.push(`/owners/${owner.id}`);
  };

  const handleDelete = async () => {
    if (!confirm(t('actions.confirmDelete'))) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteOwner(owner.id);
      if (result.error) {
        console.error('Failed to delete owner:', result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {owner.ownerType === 'individual' ? (
            <User className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          )}
          <CardTitle>{displayName}</CardTitle>
        </div>
        <CardAction>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleEdit}
              aria-label={`${t('actions.edit')} ${displayName}`}
            >
              <Pencil className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={`${t('actions.delete')} ${displayName}`}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-2 text-base">
          <div className="flex gap-2">
            <dt className="font-medium text-muted-foreground">{t('form.taxId')}:</dt>
            <dd>{owner.taxId} ({owner.taxIdType})</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-muted-foreground">{t('form.residenceCountry')}:</dt>
            <dd>{owner.residenceCountry}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-muted-foreground">{t('form.residenceCity')}:</dt>
            <dd>{owner.residenceCity}</dd>
          </div>
          {owner.iban && (
            <div className="flex gap-2">
              <dt className="font-medium text-muted-foreground">{t('form.iban')}:</dt>
              <dd>{owner.iban.replace(/(.{4})/g, '$1 ').trim()}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
