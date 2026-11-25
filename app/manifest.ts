import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cost Tracker — Family Finance',
    short_name: 'Cost Tracker',
    description: 'Modern, customizable dynamic cost and expense tracker for Masum & Toyeeba',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0f766e',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}

