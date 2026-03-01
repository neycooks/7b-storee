import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PARCEL - Reliable Hub System',
  description: 'PARCEL Reliable Hub System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen p-8">
          <div className="flex gap-8">
            <div className="w-[280px] shrink-0">
              <Sidebar />
            </div>
            <div className="flex-1">
              <TopBar />
              <main className="mt-8">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
