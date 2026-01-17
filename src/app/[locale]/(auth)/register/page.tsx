import { setRequestLocale } from 'next-intl/server';
import { RegisterForm } from '@/components/auth/register-form';
import { LanguageSelector } from '@/components/auth/language-selector';

export default async function RegisterPage({
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
      <RegisterForm />
    </main>
  );
}
