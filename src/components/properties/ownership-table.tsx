'use client';

import { useTranslations } from 'next-intl';
import { Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Owner } from '@/db/schema';
import type { OwnershipAssignment } from '@/stores/property-form';

interface OwnershipTableProps {
  owners: OwnershipAssignment[];
  availableOwners: Owner[];
  onAddOwner: (ownerId: string) => void;
  onRemoveOwner: (ownerId: string) => void;
  onUpdatePercentage: (ownerId: string, percentage: number) => void;
  error?: string;
}

/**
 * OwnershipTable Component
 * Table for assigning owners with percentage inputs
 * A11Y-01: 18px+ text
 * A11Y-02: 48px touch targets
 * A11Y-05: Clear validation feedback for 100% requirement
 */
export function OwnershipTable({
  owners,
  availableOwners,
  onAddOwner,
  onRemoveOwner,
  onUpdatePercentage,
  error,
}: OwnershipTableProps) {
  const t = useTranslations('property.form');
  const tValidation = useTranslations('validation');

  // Calculate total percentage
  const totalPercentage = owners.reduce((sum, o) => sum + o.percentage, 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.01;
  const hasOwners = owners.length > 0;

  // Get unassigned owners for the dropdown
  const unassignedOwners = availableOwners.filter(
    (o) => !owners.some((assigned) => assigned.ownerId === o.id)
  );

  // Get owner display name
  const getOwnerName = (ownerId: string): string => {
    const owner = availableOwners.find((o) => o.id === ownerId);
    if (!owner) return 'Unknown';
    return owner.ownerType === 'individual'
      ? `${owner.firstName} ${owner.lastName}`
      : owner.companyName || 'Company';
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold">{t('ownershipTitle')}</Label>
        <p className="text-base text-muted-foreground mt-1">{t('ownershipHint')}</p>
      </div>

      {/* Owner list */}
      {hasOwners && (
        <div className="border rounded-lg divide-y">
          {owners.map((assignment, index) => (
            <div
              key={assignment.ownerId}
              className="flex items-center gap-4 p-4"
            >
              <span className="flex-1 text-base font-medium">
                {getOwnerName(assignment.ownerId)}
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={assignment.percentage}
                  onChange={(e) =>
                    onUpdatePercentage(
                      assignment.ownerId,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-24 text-right"
                  aria-label={`${t('percentage')} for ${getOwnerName(assignment.ownerId)}`}
                />
                <span className="text-base text-muted-foreground">%</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveOwner(assignment.ownerId)}
                aria-label={`${t('removeOwner')} ${getOwnerName(assignment.ownerId)}`}
              >
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          ))}

          {/* Total row */}
          <div
            className={cn(
              'flex items-center gap-4 p-4 font-semibold',
              isValid ? 'bg-green-50 dark:bg-green-950' : 'bg-amber-50 dark:bg-amber-950'
            )}
          >
            <span className="flex-1 text-base">{t('totalPercentage')}</span>
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
              )}
              <span
                className={cn(
                  'text-lg tabular-nums',
                  isValid ? 'text-green-600' : 'text-amber-600'
                )}
              >
                {totalPercentage.toFixed(2)}%
              </span>
            </div>
            <div className="w-12" /> {/* Spacer for alignment */}
          </div>
        </div>
      )}

      {/* Add owner dropdown */}
      {unassignedOwners.length > 0 ? (
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="add-owner-select">{t('addOwner')}</Label>
            <Select onValueChange={onAddOwner}>
              <SelectTrigger id="add-owner-select">
                <SelectValue placeholder={t('selectOwner')} />
              </SelectTrigger>
              <SelectContent>
                {unassignedOwners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.ownerType === 'individual'
                      ? `${owner.firstName} ${owner.lastName}`
                      : owner.companyName}
                    {' '}
                    <span className="text-muted-foreground">({owner.taxId})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : availableOwners.length === 0 ? (
        <p className="text-base text-muted-foreground p-4 border rounded-lg bg-muted/50">
          {t('noOwnersAvailable')}
        </p>
      ) : (
        <p className="text-base text-muted-foreground">
          {/* All owners assigned message */}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-base font-medium text-destructive flex items-center gap-2" role="alert">
          <AlertCircle className="h-5 w-5" />
          {error}
        </p>
      )}

      {/* Validation feedback when not 100% */}
      {hasOwners && !isValid && !error && (
        <p className="text-base font-medium text-amber-600 flex items-center gap-2" role="status">
          <AlertCircle className="h-5 w-5" />
          {totalPercentage < 100
            ? tValidation('percentageUnder100')
            : tValidation('percentageOver100')}
        </p>
      )}
    </div>
  );
}
