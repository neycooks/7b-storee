'use client';

import { usePathname } from 'next/navigation';

const pageNames: Record<string, string> = {
  '/': 'DISCOVER',
  '/products': 'PRODUCTS',
  '/policies': 'POLICIES',
  '/about': 'ABOUT US',
};

export default function TopBar() {
  const pathname = usePathname();
  const title = pageNames[pathname] || 'DISCOVER';

  return (
    <header className="sticky top-0 h-20 bg-app-bg/95 backdrop-blur-sm z-40 flex items-center justify-between px-8 border-b border-border">
      <h1 className="text-white font-bold text-base tracking-[2px]">{title}</h1>
      
      <div className="flex items-center gap-3">
        <span className="text-white font-bold text-base">ERION_TPSS</span>
        <div className="w-10 h-10 rounded-full bg-card-bg border border-border flex items-center justify-center overflow-hidden">
          <div className="w-8 h-8 bg-yellow-400 rounded-full relative">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-3 bg-black rounded-sm"></div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black rounded-sm"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
