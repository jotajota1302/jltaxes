import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations();

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{t('home.title')}</h1>
          <p className="text-muted-foreground">{t('home.subtitle')}</p>
        </div>

        {/* Language switcher demo */}
        <Card>
          <CardHeader>
            <CardTitle>{t('language.select')}</CardTitle>
            <CardDescription>
              I18N-01 to I18N-04: 4 languages supported
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <Link href="/" locale="es">{t('language.es')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" locale="en">{t('language.en')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" locale="de">{t('language.de')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" locale="fr">{t('language.fr')}</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Auth navigation demo */}
        <Card>
          <CardHeader>
            <CardTitle>{t('nav.home')}</CardTitle>
            <CardDescription>
              Navigation links (auth pages in Plan 04)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/login">{t('nav.login')}</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/register">{t('nav.register')}</Link>
            </Button>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/register">{t('home.cta')}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
