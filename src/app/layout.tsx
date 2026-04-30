import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Đại Chiến Phá Form — Server Actions & Validation Demo',
  description:
    'Demo tương tác thuyết trình: Server Actions, Zod Validation, React Hook Form trong Next.js App Router',
  keywords: ['Next.js', 'Server Actions', 'Zod', 'Form Validation', 'React Hook Form'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a1a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
