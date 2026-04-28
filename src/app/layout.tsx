import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { WebSocketProvider } from '@/contexts/WebSocketContext';

const manrope = localFont({
  src: '../../public/fonts/Manrope-variable.woff2',
  variable: '--font-manrope',
  display: 'swap',
});

const spaceGrotesk = localFont({
  src: '../../public/fonts/SpaceGrotesk-variable.woff2',
  variable: '--font-space-grotesk',
  display: 'swap',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://luxprofile.mx';

export const metadata: Metadata = {
  title: {
    default: 'LuxProfile MX — Perfiles Premium Verificados',
    template: '%s | LuxProfile MX',
  },
  description:
    'Encuentra perfiles premium verificados en México. Escorts y acompañantes en CDMX, Guadalajara, Monterrey y más ciudades. Perfiles reales, contacto directo.',
  metadataBase: new URL(appUrl),
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: appUrl,
    siteName: 'LuxProfile MX',
    title: 'LuxProfile MX — Perfiles Premium Verificados',
    description:
      'Encuentra perfiles premium verificados en México. Escorts y acompañantes en CDMX, Guadalajara, Monterrey y más ciudades.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxProfile MX — Perfiles Premium Verificados',
    description:
      'Encuentra perfiles premium verificados en México. Perfiles reales, contacto directo.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var key = '__next_chunk_reload_once__';
                  window.addEventListener('error', function (event) {
                    var message = event && event.message ? String(event.message) : '';
                    var isChunkError = message.indexOf('ChunkLoadError') !== -1 || message.indexOf('Loading chunk') !== -1;

                    if (!isChunkError) return;
                    if (sessionStorage.getItem(key) === '1') return;

                    sessionStorage.setItem(key, '1');
                    window.location.reload();
                  });

                  window.addEventListener('load', function () {
                    sessionStorage.removeItem(key);
                  });
                } catch (_) {
                  // no-op
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} bg-dark-50 font-sans`}>
        <WebSocketProvider>
          <main>{children}</main>
        </WebSocketProvider>
      </body>
    </html>
  );
}
