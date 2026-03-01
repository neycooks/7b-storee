'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingBag, FileText, Info } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Discover', icon: LayoutGrid },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/policies', label: 'Policies', icon: FileText },
  { href: '/about', label: 'About Us', icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full h-full bg-card-bg rounded-card p-6 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 8V20L12 22L22 20V8L12 2Z" stroke="black" strokeWidth="2"/>
              <path d="M12 22V12" stroke="black" strokeWidth="2"/>
              <path d="M22 8L12 12L2 8" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
          <span className="text-white font-bold text-xl">PARCEL</span>
        </div>
        <p className="text-text-muted uppercase text-[10px] tracking-[3px] ml-10">Reliable Hub System</p>
      </div>

      <nav className="flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : 'inactive'} mb-1`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <a href="https://discord.gg/A7BK2qnX97" target="_blank" rel="noopener noreferrer" className="bg-app-bg rounded-card p-3 flex items-center gap-3 hover:bg-border transition-colors cursor-pointer">
        <img src="https://i.imgur.com/h4cpcUg.gif" alt="7B Academy" className="w-10 h-10 rounded-sm object-cover" />
        <span className="text-text-muted text-xs font-bold">7B Academy</span>
      </a>
    </aside>
  );
}
