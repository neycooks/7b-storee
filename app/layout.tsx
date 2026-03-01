import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Intro from '@/components/Intro';

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
        <Intro />
        <div className="flex min-h-screen">
          <div className="w-[280px] shrink-0 fixed left-0 top-0 h-screen p-6 pb-0">
            <Sidebar />
          </div>
          <div className="flex-1 ml-[280px]">
            <TopBar />
            <main className="p-8 pt-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
