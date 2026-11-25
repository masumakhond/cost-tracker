import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cost Tracker — Family Finance',
  description: 'Modern, customizable dynamic cost and expense tracker for Masum & Toyeeba with budget tracking and PDF reports',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cost Tracker',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f766e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-teal-500 selection:text-white pb-[env(safe-area-inset-bottom,0px)]">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
