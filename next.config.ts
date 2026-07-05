import path from 'node:path';
import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';
import './src/libs/Env';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  reactCompiler: true,
  // Pin file-tracing root to this project directory so Next.js does not walk
  // up to /home/dataraj and discover a second pnpm-lock.yaml there.
  outputFileTracingRoot: path.resolve(import.meta.dirname),
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  serverExternalPackages: [
    'import-in-the-middle',
    'require-in-the-middle',
  ],
};

// Initialize the Next-Intl plugin
let configWithPlugins = createNextIntlPlugin('./src/libs/I18n.ts')(baseConfig);

// Conditionally enable bundle analysis
if (process.env.ANALYZE === 'true') {
  configWithPlugins = withBundleAnalyzer()(configWithPlugins);
}

const nextConfig = configWithPlugins;
export default nextConfig;
