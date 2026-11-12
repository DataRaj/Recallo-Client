import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { routing } from '@/libs/i18n-routing';

/** Keep existing dashboard bookmarks and OAuth returns on the shared workspace. */
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(locale === routing.defaultLocale ? ROUTES.HOME : `/${locale}${ROUTES.HOME}`);
}
