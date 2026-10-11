import type { Metadata, Viewport } from 'next';
import '../src/styles/fonts.css';
import '../src/index.css';
import { AuthProvider } from '../src/lib/AuthContext';
import { ToastProvider } from '../src/lib/ToastContext';
import AuthModal from '../src/screens/AuthModal';

export const metadata: Metadata = {
  title: 'Gharelu Hub',
  description: 'Preservative-free makhana, namkeen, and fresh-baked nankhatai. Small-batch, WhatsApp-first, delivered fresh from our Bhopal kitchen within 48 hours. Gharelu taste. Modern crunch.',
  keywords: ['makhana', 'Bhopal snacks', 'preservative-free', 'namkeen', 'nankhatai', 'healthy snacks', 'Gharelu Hub'],
  openGraph: {
    title: 'Gharelu Hub',
    description: 'Bhopal\'s small-batch, preservative-free snack brand. Fresh within 48 hours. Order on WhatsApp.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff5200',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
        <AuthProvider>
          <ToastProvider>
            {children}
            <AuthModal />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
