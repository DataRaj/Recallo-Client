import localFont from 'next/font/local';

export const marketingSans = localFont({
  src: [
    { path: './fonts/manrope-400.ttf', weight: '400', style: 'normal' },
    { path: './fonts/manrope-600.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-mk-manrope',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const marketingDisplay = localFont({
  src: './fonts/newsreader-400.ttf',
  weight: '400',
  style: 'normal',
  variable: '--font-mk-newsreader',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});
