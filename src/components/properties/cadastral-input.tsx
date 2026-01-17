'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateCadastralReference } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { Check, X, HelpCircle } from 'lucide-react';

interface CadastralInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  onHelpClick?: () => void;
}

/**
 * CadastralInput Component
 * Real-time cadastral reference validation with visual feedback
 * A11Y-01: 18px+ text
 * A11Y-02: 48px touch targets
 * A11Y-05: Clear inline validation feedback
 */
export function CadastralInput({
  value,
  onChange,
  error,
  disabled,
  onHelpClick,
}: CadastralInputProps) {
  const t = useTranslations('property.form');
  const tValidation = useTranslations('validation');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!value || value.trim() === '') {
      setIsValid(null);
      return;
    }

    // Only validate once we have 20 characters
    if (value.length === 20) {
      const valid = validateCadastralReference(value);
      setIsValid(valid);
    } else {
      setIsValid(null);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Normalize: uppercase, no spaces, max 20 chars
    const newValue = e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 20);
    onChange(newValue);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="cadastralReference">{t('cadastralReference')}</Label>
        {onHelpClick && (
          <button
            type="button"
            onClick={onHelpClick}
            className="text-muted-foreground hover:text-foreground"
            aria-label={t('cadastralReferenceHint')}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="relative">
        <Input
          id="cadastralReference"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="1234567AB1234567CD12"
          disabled={disabled}
          maxLength={20}
          aria-describedby="cadastral-hint cadastral-feedback"
          aria-invalid={isValid === false || !!error}
          className={cn(
            'pr-12 font-mono tracking-wider',
            isValid === true &&
              'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/50',
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
      <p id="cadastral-hint" className="text-base text-muted-foreground">
        {t('cadastralReferenceHint')} ({value.length}/20)
      </p>
      {(isValid === false || error) && (
        <p
          id="cadastral-feedback"
          className="text-base font-medium text-destructive"
          role="alert"
        >
          {error || tValidation('cadastralReferenceInvalid')}
        </p>
      )}
      {isValid === true && (
        <p
          id="cadastral-feedback"
          className="text-base font-medium text-green-600"
          role="status"
        >
          <Check className="inline h-4 w-4 mr-1" />
          {tValidation('cadastralReferenceRequired').replace('es obligatoria', 'valida').replace('is required', 'is valid').replace('ist erforderlich', 'ist gultig').replace('est requise', 'est valide')}
        </p>
      )}
    </div>
  );
}
