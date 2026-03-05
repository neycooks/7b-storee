'use client';

import { SidebarProvider, useSidebar } from './SidebarContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import MobileHeader from '@/components/MobileHeader';
import Intro from '@/components/Intro';

function MainLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen">
      <div 
        className={`sidebar-container fixed left-0 top-0 h-screen p-3 pb-0 hidden lg:block transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        <Sidebar />
      </div>
      <div 
        className={`sidebar-spacer fixed left-0 top-0 h-screen hidden lg:block transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-[280px]'
        }`}
      ></div>
      <div className="flex-1 w-full">
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
      <SidebarProvider>
        <MainLayout>{children}</MainLayout>
      </SidebarProvider>
    </>
  );
}
