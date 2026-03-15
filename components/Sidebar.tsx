'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingBag, FileText, Info, Star, Grid, Menu, Trophy } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Discover', icon: LayoutGrid },
  { href: '/products', label: 'Marketplace', icon: ShoppingBag },
  { href: '/gamepass', label: 'Gamepass', icon: Star },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
  { href: '/showcase', label: 'Showcases', icon: Grid },
  { href: '/menu', label: 'Menu', icon: Menu },
  { href: '/policies', label: 'Policies', icon: FileText },
  { href: '/about', label: 'About Us', icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full bg-card-bg rounded-card flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <img 
            src="https://i.imgur.com/4ausQA1.png" 
            alt="7B STORE" 
            className="w-10 h-10 object-contain rounded-2xl"
          />
          <span className="text-white font-bold text-xl">7B STORE</span>
        </div>
        <p className="text-text-muted uppercase text-[10px] tracking-[3px] ml-12">Reliable Hub System</p>
      </div>

      {/* Navigation */}
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

      {/* Discord Link */}
      <a 
        href="https://discord.gg/A7BK2qnX97" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="bg-app-bg rounded-card p-3 flex items-center gap-3 hover:bg-border transition-colors cursor-pointer"
      >
        <img 
          src="https://i.imgur.com/h4cpcUg.gif" 
          alt="7B Academy" 
          className="w-10 h-10 rounded-sm object-cover" 
        />
        <span className="text-text-muted text-xs font-bold">7B Academy</span>
      </a>
    </aside>
  );
}
