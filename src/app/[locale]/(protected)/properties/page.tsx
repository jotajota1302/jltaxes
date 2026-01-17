import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyCard } from '@/components/properties/property-card';
import { getProperties } from './actions';

interface PropertiesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PropertiesPage({ params }: PropertiesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('property');
  const properties = await getProperties();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
            {t('addNew')}
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('noProperties')}</CardTitle>
            <CardDescription>{t('addFirst')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/properties/new">
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                {t('addNew')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
