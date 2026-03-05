import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LayoutWrapper from '@/components/LayoutWrapper';
import { initBackgroundJobs } from '@/lib/bootstrap';

initBackgroundJobs();

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '7B STORE',
  description: '7B STORE - Reliable Hub System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
