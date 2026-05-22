'use client';

import { Toaster } from 'sonner';

export function AppToaster() {
  return <Toaster theme="dark" richColors position="top-right" toastOptions={{ style: { background: '#111827', color: '#e8ecf1', border: '1px solid #1e293b' } }} />;
}