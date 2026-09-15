import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'MOON Golden Beauty — Estética & Bienestar',
    template: '%s | MOON Golden Beauty',
  },
  description:
    'MOON Golden Beauty Estética ofrece tratamientos faciales, corporales y de bienestar profesionales de alta gama. Reservá tu turno online.',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  keywords: [
    'MOON Golden Beauty',
    'estética',
    'tratamientos faciales',
    'tratamientos corporales',
    'limpieza facial',
    'peeling',
    'radiofrecuencia',
    'masajes',
    'depilación definitiva',
    'belleza',
    'bienestar',
  ],
  openGraph: {
    title: 'MOON Golden Beauty — Estética & Bienestar',
    description:
      'Tratamientos faciales, corporales y de bienestar profesionales de alta gama. Reservá tu turno online.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'MOON Golden Beauty Estética',
    images: [
      {
        url: '/images/logo.png',
        width: 800,
        height: 800,
        alt: 'MOON Golden Beauty Estética',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
