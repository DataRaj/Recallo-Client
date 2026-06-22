import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Recallo',
    default: 'Auth | Recallo',
  },
  description: 'Sign in or create your Recallo account.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
