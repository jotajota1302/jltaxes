'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {routing.locales.map((loc) => (
        <Button
          key={loc}
          variant={loc === locale ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleChange(loc)}
        >
          {t(loc)}
        </Button>
      ))}
    </div>
  );
}
