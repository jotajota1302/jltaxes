import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

        {/* Design System Showcase - A11Y Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Design System</CardTitle>
            <CardDescription>
              Accessible components with 18px+ text, 48px touch targets, and WCAG 2.1 AA contrast
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Button variants showcase */}
            <div className="space-y-2">
              <Label>Buttons (48px minimum height)</Label>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* Form fields showcase */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email address</Label>
                <Input id="demo-email" type="email" placeholder="user@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-password">Password</Label>
                <Input id="demo-password" type="password" placeholder="Enter your password" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>A11Y-01: Base font 18px minimum</li>
              <li>A11Y-02: Touch targets 48x48px minimum</li>
              <li>A11Y-03: WCAG 2.1 AA contrast (4.5:1)</li>
              <li>A11Y-04: Visible labels on all fields</li>
              <li>A11Y-05: Clear error messages (form validation)</li>
              <li>A11Y-06: Keyboard navigation with visible focus</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
