'use client';

import { SessionProvider } from 'next-auth/react';
import { AppToaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <AppToaster />
    </SessionProvider>
  );
}