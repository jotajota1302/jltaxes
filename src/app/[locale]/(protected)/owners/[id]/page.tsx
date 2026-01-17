import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { OwnerForm } from '@/components/owners/owner-form';
import { getOwnerById } from '../actions';

interface EditOwnerPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditOwnerPage({ params }: EditOwnerPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const owner = await getOwnerById(id);

  if (!owner) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OwnerForm owner={owner} />
    </div>
  );
}
