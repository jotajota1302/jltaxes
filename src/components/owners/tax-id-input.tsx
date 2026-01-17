'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateNieNif, getNieNifType } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface TaxIdInputProps {
  value: string;
  onChange: (value: string, taxIdType: 'NIE' | 'NIF' | null) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * TaxIdInput Component
 * Real-time NIE/NIF validation with visual feedback
 * A11Y-01: 18px+ text
 * A11Y-02: 48px touch targets
 * A11Y-05: Clear inline validation feedback
 */
export function TaxIdInput({ value, onChange, error, disabled }: TaxIdInputProps) {
  const t = useTranslations('owner.form');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [taxIdType, setTaxIdType] = useState<'NIE' | 'NIF' | null>(null);

  useEffect(() => {
    if (!value || value.trim() === '') {
      setIsValid(null);
      setTaxIdType(null);
      return;
    }

    const valid = validateNieNif(value);
    setIsValid(valid);

    if (valid) {
      const type = getNieNifType(value);
      setTaxIdType(type);
      onChange(value, type);
    } else {
      setTaxIdType(null);
      onChange(value, null);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue, taxIdType);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="taxId">{t('taxId')}</Label>
      <div className="relative">
        <Input
          id="taxId"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="X1234567L"
          disabled={disabled}
          aria-describedby="taxId-hint taxId-feedback"
          aria-invalid={isValid === false || !!error}
          className={cn(
            'pr-12',
            isValid === true && 'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/50',
            (isValid === false || error) && 'border-destructive'
          )}
        />
        {isValid !== null && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isValid ? (
              <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
            ) : (
              <X className="h-5 w-5 text-destructive" aria-hidden="true" />
            )}
          </div>
        )}
      </div>
      <p id="taxId-hint" className="text-base text-muted-foreground">
        {t('taxIdHint')}
      </p>
      <p
        id="taxId-feedback"
        className={cn(
          'text-base font-medium',
          isValid === true && 'text-green-600',
          isValid === false && 'text-destructive'
        )}
        role="status"
        aria-live="polite"
      >
        {isValid === true && (
          <>
            {t('taxIdValid')} ({taxIdType})
          </>
        )}
        {(isValid === false || error) && (error || t('taxIdInvalid'))}
      </p>
    </div>
  );
}
