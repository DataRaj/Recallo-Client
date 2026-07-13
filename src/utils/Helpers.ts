import { routing } from '@/libs/i18n-routing';

export const getBaseUrl = () => {
    // 1. Force Production URL if defined
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''); // Remove trailing slash if any
    }

    // 2. Vercel System Fallbacks
    if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // 3. Absolute Client-Side Fallback
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    return 'https://recallo.tech'; // Safe production fallback for Server-side
};

export const getI18nPath = (url: string, locale: string) => {
    if (locale === routing.defaultLocale) {
        return url;
    }
    return `/${locale}${url}`;
};

export const isServer = () => {
    return typeof window === 'undefined';
};
