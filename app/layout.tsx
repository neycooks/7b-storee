import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import MobileHeader from '@/components/MobileHeader';
import Intro from '@/components/Intro';
import { SidebarProvider } from '@/components/SidebarContext';
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
        <Intro />
        <MobileHeader />
        <SidebarProvider>
          <div className="flex min-h-screen">
            <div className="sidebar-container w-[280px] shrink-0 fixed left-0 top-0 h-screen p-6 pb-0 hidden lg:block">
              <Sidebar />
            </div>
            <div className="sidebar-spacer w-[280px] shrink-0 hidden lg:block"></div>
            <div className="flex-1">
              <TopBar />
              <main className="p-4 lg:p-8 pt-4">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
