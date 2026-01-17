'use client';

import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { validateCadastralReference } from '@/lib/validators';
import { validateOwnershipPercentages } from '@/lib/validators';

/**
 * Step 1: Address Schema
 * Validates Spanish property address fields
 */
export const usePropertyAddressSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    streetType: z.string().min(1, { message: t('streetTypeRequired') }),
    streetName: z.string().min(1, { message: t('streetNameRequired') }),
    streetNumber: z.string().min(1, { message: t('streetNumberRequired') }),
    floor: z.string().optional(),
    door: z.string().optional(),
    staircase: z.string().optional(),
    block: z.string().optional(),
    city: z.string().min(1, { message: t('cityRequired') }),
    province: z.string().min(1, { message: t('provinceRequired') }),
    postalCode: z.string().min(5, { message: t('postalCodeRequired') }).max(5),
  });
};

/**
 * Step 2: Cadastral Schema
 * Validates cadastral reference (20-char checksum) and cadastral value
 */
export const usePropertyCadastralSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    cadastralReference: z
      .string()
      .min(1, { message: t('cadastralReferenceRequired') })
      .refine(validateCadastralReference, { message: t('cadastralReferenceInvalid') }),
    cadastralValue: z
      .string()
      .min(1, { message: t('cadastralValueRequired') })
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: t('cadastralValueInvalid'),
      }),
    collectiveRevision: z.boolean(),
    revisionYear: z.string().optional(),
  });
};

/**
 * Step 3: Ownership Schema
 * Validates ownership assignments (percentages must sum to 100%)
 */
export const usePropertyOwnershipSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    owners: z
      .array(
        z.object({
          ownerId: z.string().uuid(),
          percentage: z.number().positive().max(100),
        })
      )
      .min(1, { message: t('atLeastOneOwner') })
      .superRefine((owners, ctx) => {
        const result = validateOwnershipPercentages(owners);
        if (!result.valid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(result.errorCode || 'percentageUnder100'),
          });
        }
      }),
  });
};

/**
 * Full Property Schema for server-side validation
 * Combines all step schemas
 */
export const usePropertySchema = () => {
  const t = useTranslations('validation');

  return z.object({
    // Address
    streetType: z.string().min(1),
    streetName: z.string().min(1),
    streetNumber: z.string().min(1),
    floor: z.string().optional(),
    door: z.string().optional(),
    staircase: z.string().optional(),
    block: z.string().optional(),
    city: z.string().min(1),
    province: z.string().min(1),
    postalCode: z.string().min(5).max(5),
    // Cadastral
    cadastralReference: z.string().min(20).max(20).refine(validateCadastralReference),
    cadastralValue: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0),
    collectiveRevision: z.boolean(),
    revisionYear: z.string().optional(),
    // Ownership
    owners: z
      .array(
        z.object({
          ownerId: z.string().uuid(),
          percentage: z.number().positive().max(100),
        })
      )
      .min(1)
      .refine((owners) => validateOwnershipPercentages(owners).valid),
  });
};

// Export types for form data
export type PropertyAddressData = z.infer<ReturnType<typeof usePropertyAddressSchema>>;
export type PropertyCadastralData = z.infer<ReturnType<typeof usePropertyCadastralSchema>>;
export type PropertyOwnershipData = z.infer<ReturnType<typeof usePropertyOwnershipSchema>>;
export type PropertyFormData = z.infer<ReturnType<typeof usePropertySchema>>;
