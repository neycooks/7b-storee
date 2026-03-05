'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingBag, FileText, Info, Star, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useSidebar } from './SidebarContext';

const navItems = [
  { href: '/', label: 'Discover', icon: LayoutGrid },
  { href: '/products', label: 'Marketplace', icon: ShoppingBag },
  { href: '/gamepass', label: 'Gamepass', icon: Star },
  { href: '/policies', label: 'Policies', icon: FileText },
  { href: '/about', label: 'About Us', icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside 
      className={`h-full bg-card-bg rounded-card flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-full'
      }`}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <img 
            src="https://i.imgur.com/4ausQA1.png" 
            alt="7B STORE" 
            className={`object-contain rounded-2xl transition-all duration-300 ${collapsed ? 'w-10 h-10 mx-auto' : 'w-10 h-10'}`}
          />
          {!collapsed && (
            <span className="text-white font-bold text-xl">7B STORE</span>
          )}
        </div>
        {!collapsed && (
          <p className="text-text-muted uppercase text-[10px] tracking-[3px] ml-12">Reliable Hub System</p>
        )}
      </div>

      <button
        onClick={toggle}
        className={`hidden lg:flex items-center justify-center mb-4 mx-auto w-8 h-8 bg-app-bg rounded-full text-text-muted hover:text-white hover:bg-border transition-all duration-300 ${collapsed ? 'rotate-180' : ''}`}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : 'inactive'} mb-1 ${
                collapsed ? 'justify-center px-2' : ''
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <a 
        href="https://discord.gg/A7BK2qnX97" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`bg-app-bg rounded-card p-3 hover:bg-border transition-colors cursor-pointer flex items-center gap-3 ${
          collapsed ? 'justify-center p-2' : ''
        }`}
        title={collapsed ? '7B Academy' : undefined}
      >
        <img 
          src="https://i.imgur.com/h4cpcUg.gif" 
          alt="7B Academy" 
          className="w-10 h-10 rounded-sm object-cover" 
        />
        {!collapsed && (
          <span className="text-text-muted text-xs font-bold">7B Academy</span>
        )}
      </a>
    </aside>
  );
}
