import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/space-grotesk-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-grotesk-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
});

const dmSans = localFont({
  src: [
    { path: "./fonts/dm-sans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-sans-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "CloudVault",
  description: "Full-stack next-gen cloud storage",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0a0e17] text-[#e8ecf1]">
        {children}
        <Toaster theme="dark" richColors />
      </body>
    </html>
  );
}
