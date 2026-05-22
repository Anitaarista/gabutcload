import type { Metadata } from 'next';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });

export const metadata: Metadata = {
  title: 'CloudVault',
  description: 'Next-gen cloud storage with vaults, workspaces, and secure sharing.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}