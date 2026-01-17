import type { NextConfig } from 'next';

// Note: next-intl integration will be added in 01-03-PLAN.md (i18n setup)
// For now, using simple Next.js config

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
