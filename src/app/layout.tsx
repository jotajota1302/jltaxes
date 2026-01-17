import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JL Taxes',
  description: 'Gestiona tus declaraciones del Modelo 210',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
