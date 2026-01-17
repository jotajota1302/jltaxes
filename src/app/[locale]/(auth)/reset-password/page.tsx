import { setRequestLocale } from 'next-intl/server';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { LanguageSelector } from '@/components/auth/language-selector';

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="mb-6">
        <LanguageSelector />
      </div>
      <ResetPasswordForm />
    </main>
  );
}
