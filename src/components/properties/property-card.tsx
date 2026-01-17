'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Home, Users } from 'lucide-react';
import { deleteProperty } from '@/app/[locale]/(protected)/properties/actions';

interface PropertyOwnership {
  ownerId: string;
  ownershipPercentage: string;
  ownerName?: string | null;
  ownerLastName?: string | null;
  companyName?: string | null;
  ownerType?: string | null;
}

interface PropertyWithOwners {
  id: string;
  streetType: string;
  streetName: string;
  streetNumber: string;
  floor: string | null;
  door: string | null;
  city: string;
  province: string;
  postalCode: string;
  cadastralReference: string;
  cadastralValue: string;
  owners?: PropertyOwnership[];
}

interface PropertyCardProps {
  property: PropertyWithOwners;
}

/**
 * PropertyCard Component
 * Displays property information with edit/delete actions
 * A11Y-01: 18px+ text
 * A11Y-02: 48px touch targets for action buttons
 */
export function PropertyCard({ property }: PropertyCardProps) {
  const t = useTranslations('property');
  const tStreetTypes = useTranslations('property.streetTypes');
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Format address
  const formatAddress = () => {
    const parts = [
      tStreetTypes(property.streetType as 'calle' | 'avenida' | 'plaza' | 'paseo' | 'carretera' | 'camino' | 'travesia' | 'urbanizacion' | 'otro'),
      property.streetName,
      property.streetNumber,
    ];
    if (property.floor) parts.push(`${property.floor}`);
    if (property.door) parts.push(property.door);
    return parts.join(' ');
  };

  // Format cadastral reference for display (groups of 4)
  const formatCadastral = (ref: string) => {
    return ref.match(/.{1,4}/g)?.join(' ') || ref;
  };

  // Get owner display info
  const getOwnerDisplay = (owner: PropertyOwnership) => {
    const name =
      owner.ownerType === 'individual'
        ? `${owner.ownerName || ''} ${owner.ownerLastName || ''}`.trim()
        : owner.companyName || 'Company';
    return `${name} (${parseFloat(owner.ownershipPercentage).toFixed(2)}%)`;
  };

  const handleEdit = () => {
    router.push(`/properties/${property.id}`);
  };

  const handleDelete = async () => {
    if (!confirm(t('actions.confirmDelete'))) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteProperty(property.id);
      if (result.error) {
        console.error('Failed to delete property:', result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Home className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-lg">{formatAddress()}</CardTitle>
        </div>
        <CardAction>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleEdit}
              aria-label={`${t('actions.edit')} ${formatAddress()}`}
            >
              <Pencil className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={`${t('actions.delete')} ${formatAddress()}`}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-base">
          {/* Location */}
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-muted-foreground">{t('form.city')}:</dt>
            <dd>
              {property.city}, {property.province} {property.postalCode}
            </dd>
          </div>

          {/* Cadastral Reference */}
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-muted-foreground">
              {t('form.cadastralReference')}:
            </dt>
            <dd className="font-mono text-sm tracking-wide">
              {formatCadastral(property.cadastralReference)}
            </dd>
          </div>

          {/* Cadastral Value */}
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-muted-foreground">
              {t('form.cadastralValue')}:
            </dt>
            <dd>
              {parseFloat(property.cadastralValue).toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
              })}
            </dd>
          </div>

          {/* Owners */}
          {property.owners && property.owners.length > 0 && (
            <div className="pt-2 border-t mt-2">
              <dt className="font-medium text-muted-foreground flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                {t('form.ownershipTitle')}:
              </dt>
              <dd>
                <ul className="space-y-1">
                  {property.owners.map((owner) => (
                    <li key={owner.ownerId} className="text-base">
                      {getOwnerDisplay(owner)}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
