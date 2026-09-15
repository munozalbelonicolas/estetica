import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Estética Studio — Tratamientos Estéticos Profesionales',
    template: '%s | Estética Studio',
  },
  description:
    'Estética Studio ofrece tratamientos faciales, corporales y de bienestar profesionales. Reservá tu turno online y descubrí nuestros servicios.',
  keywords: [
    'estética',
    'tratamientos faciales',
    'tratamientos corporales',
    'limpieza facial',
    'peeling',
    'radiofrecuencia',
    'masajes',
    'depilación',
    'belleza',
    'bienestar',
  ],
  openGraph: {
    title: 'Estética Studio — Tratamientos Estéticos Profesionales',
    description:
      'Tratamientos faciales, corporales y de bienestar profesionales. Reservá tu turno online.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Estética Studio',
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
