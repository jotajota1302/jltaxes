import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OwnerCard } from '@/components/owners/owner-card';
import { getOwners } from './actions';

interface OwnersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OwnersPage({ params }: OwnersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('owner');
  const owners = await getOwners();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button asChild>
          <Link href="/owners/new">
            <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
            {t('addNew')}
          </Link>
        </Button>
      </div>

      {owners.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('noOwners')}</CardTitle>
            <CardDescription>{t('addFirst')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/owners/new">
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                {t('addNew')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {owners.map((owner) => (
            <OwnerCard key={owner.id} owner={owner} />
          ))}
        </div>
      )}
    </div>
  );
}
