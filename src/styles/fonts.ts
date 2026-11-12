import localFont from 'next/font/local';

export const appSans = localFont({
  src: '../components/marketing/fonts/dm-sans.woff2',
  weight: '100 1000',
  style: 'normal',
  variable: '--font-mk-body',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const appDisplay = localFont({
  src: '../components/marketing/fonts/bricolage-grotesque.woff2',
  weight: '200 800',
  style: 'normal',
  variable: '--font-mk-display',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});
