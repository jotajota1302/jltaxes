'use client';

import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { validateNieNif } from '@/lib/validators';
import { validateIban } from '@/lib/validators';

/**
 * Step 1: Owner Type Schema
 */
export const useOwnerStep1Schema = () => {
  const t = useTranslations('validation');

  return z.object({
    ownerType: z.enum(['individual', 'company'], {
      error: t('ownerTypeRequired'),
    }),
  });
};

/**
 * Step 2: Identity Schema (Tax ID + Name)
 */
export const useOwnerStep2Schema = (ownerType: 'individual' | 'company' | null) => {
  const t = useTranslations('validation');

  const baseSchema = z.object({
    taxId: z
      .string()
      .min(1, { message: t('taxIdRequired') })
      .refine(validateNieNif, { message: t('taxIdInvalid') }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
  });

  // Add type-specific validation
  if (ownerType === 'individual') {
    return baseSchema.superRefine((data, ctx) => {
      if (!data.firstName || data.firstName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('firstNameRequired'),
          path: ['firstName'],
        });
      }
      if (!data.lastName || data.lastName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('lastNameRequired'),
          path: ['lastName'],
        });
      }
    });
  } else if (ownerType === 'company') {
    return baseSchema.superRefine((data, ctx) => {
      if (!data.companyName || data.companyName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('companyNameRequired'),
          path: ['companyName'],
        });
      }
    });
  }

  return baseSchema;
};

/**
 * Step 3: Fiscal Residence Schema
 */
export const useOwnerStep3Schema = () => {
  const t = useTranslations('validation');

  return z.object({
    residenceCountry: z
      .string()
      .min(2, { message: t('countryRequired') })
      .max(2, { message: t('countryInvalid') }),
    residenceAddress: z
      .string()
      .min(1, { message: t('addressRequired') }),
    residenceCity: z
      .string()
      .min(1, { message: t('cityRequired') }),
    residencePostalCode: z
      .string()
      .min(1, { message: t('postalCodeRequired') }),
  });
};

/**
 * Step 4: Bank Details Schema (IBAN is optional)
 */
export const useOwnerStep4Schema = () => {
  const t = useTranslations('validation');

  return z.object({
    iban: z
      .string()
      .optional()
      .refine(
        (val: string | undefined) => {
          // Empty string is valid (optional field)
          if (!val || val.trim() === '') return true;
          return validateIban(val).valid;
        },
        {
          message: t('ibanInvalid'),
        }
      ),
  });
};

/**
 * Full Owner Schema for server-side validation
 * Combines all step schemas
 */
export const useOwnerSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    ownerType: z.enum(['individual', 'company']),
    taxId: z.string().min(1).refine(validateNieNif),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    residenceCountry: z.string().length(2),
    residenceAddress: z.string().min(1),
    residenceCity: z.string().min(1),
    residencePostalCode: z.string().min(1),
    iban: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.ownerType === 'individual') {
      if (!data.firstName || data.firstName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('firstNameRequired'),
          path: ['firstName'],
        });
      }
      if (!data.lastName || data.lastName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('lastNameRequired'),
          path: ['lastName'],
        });
      }
    } else if (data.ownerType === 'company') {
      if (!data.companyName || data.companyName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('companyNameRequired'),
          path: ['companyName'],
        });
      }
    }
  });
};

// Export types for form data
export type OwnerStep1Data = z.infer<ReturnType<typeof useOwnerStep1Schema>>;
export type OwnerStep3Data = z.infer<ReturnType<typeof useOwnerStep3Schema>>;
export type OwnerStep4Data = z.infer<ReturnType<typeof useOwnerStep4Schema>>;
export type OwnerFormData = z.infer<ReturnType<typeof useOwnerSchema>>;
