'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations('auth');

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Store language for email templates (AUTH-04)
        language: locale,
        preferred_locale: locale,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/confirm`,
    },
  });

  if (error) {
    return { error: t('signUpError') };
  }

  return { success: t('confirmationEmailSent') };
}
