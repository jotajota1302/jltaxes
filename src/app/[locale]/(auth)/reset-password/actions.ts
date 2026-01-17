'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations('auth');

  const email = formData.get('email') as string;

  // IMPORTANT: Use absolute URL for redirectTo (required by Supabase)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/reset-password/update`,
  });

  if (error) {
    return { error: t('resetError') };
  }

  return { success: t('resetEmailSent') };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const t = await getTranslations('auth');

  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: t('resetError') };
  }

  return { success: t('passwordUpdated') };
}
