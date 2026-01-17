'use client';

import { z } from 'zod';
import { useTranslations } from 'next-intl';

/**
 * Login schema with translated error messages
 * IMPORTANT: Must be created inside a component/hook to access translations
 */
export const useLoginSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    email: z
      .string()
      .min(1, { message: t('emailRequired') })
      .email({ message: t('emailInvalid') }),
    password: z
      .string()
      .min(1, { message: t('passwordRequired') }),
  });
};

/**
 * Registration schema with translated error messages
 * Includes password confirmation validation
 */
export const useRegisterSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    email: z
      .string()
      .min(1, { message: t('emailRequired') })
      .email({ message: t('emailInvalid') }),
    password: z
      .string()
      .min(8, { message: t('passwordMinLength') }),
    confirmPassword: z
      .string()
      .min(1, { message: t('confirmPasswordRequired') }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('passwordsMustMatch'),
    path: ['confirmPassword'],
  });
};

/**
 * Password reset request schema
 */
export const useResetPasswordSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    email: z
      .string()
      .min(1, { message: t('emailRequired') })
      .email({ message: t('emailInvalid') }),
  });
};

/**
 * Update password schema (after clicking reset link)
 */
export const useUpdatePasswordSchema = () => {
  const t = useTranslations('validation');

  return z.object({
    password: z
      .string()
      .min(8, { message: t('passwordMinLength') }),
    confirmPassword: z
      .string()
      .min(1, { message: t('confirmPasswordRequired') }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('passwordsMustMatch'),
    path: ['confirmPassword'],
  });
};

// Export types for form data
export type LoginFormData = z.infer<ReturnType<typeof useLoginSchema>>;
export type RegisterFormData = z.infer<ReturnType<typeof useRegisterSchema>>;
export type ResetPasswordFormData = z.infer<ReturnType<typeof useResetPasswordSchema>>;
export type UpdatePasswordFormData = z.infer<ReturnType<typeof useUpdatePasswordSchema>>;
