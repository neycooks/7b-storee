'use client';

import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import MobileHeader from '@/components/MobileHeader';
import Intro from '@/components/Intro';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar - always visible */}
      <div className="hidden lg:block fixed left-0 top-0 w-[280px] h-screen p-6 pb-0">
        <Sidebar />
      </div>
      <div className="hidden lg:block fixed left-0 top-0 w-[280px] h-screen"></div>
      
      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-[280px]">
        <TopBar />
        <main className="p-4 lg:p-8 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Intro />
      <MobileHeader />
      <MainLayout>{children}</MainLayout>
    </>
  );
}
