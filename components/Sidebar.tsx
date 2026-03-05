'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingBag, FileText, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <aside className="h-full bg-card-bg rounded-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className={`flex items-center gap-2 mb-1 ${collapsed ? 'justify-center' : ''}`}>
          <img 
            src="https://i.imgur.com/4ausQA1.png" 
            alt="7B STORE" 
            className="w-10 h-10 object-contain rounded-2xl flex-shrink-0"
          />
          {!collapsed && (
            <span className="text-white font-bold text-xl whitespace-nowrap animate-fade-in">7B STORE</span>
          )}
        </div>
        {!collapsed && (
          <p className="text-text-muted uppercase text-[10px] tracking-[3px] ml-12 animate-fade-in">Reliable Hub System</p>
        )}
      </div>

      {/* Toggle Button */}
      <div className="px-4 pb-3">
        <button
          onClick={toggle}
          className={`w-full flex items-center justify-center py-2 bg-app-bg rounded-lg text-text-muted transition-all duration-300 hover:text-white hover:bg-border hover:scale-105 ${collapsed ? 'px-2' : 'px-3'}`}
        >
          {collapsed ? (
            <ChevronRight size={18} className="animate-fade-in" />
          ) : (
            <>
              <ChevronLeft size={18} className="mr-2" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-black font-bold' 
                  : 'text-text-muted hover:text-white hover:bg-border'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              style={{ animationDelay: collapsed ? `${index * 50}ms` : '0ms' }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium whitespace-nowrap animate-slide-in-left">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Discord Link */}
      <div className="p-3 pt-2">
        <a 
          href="https://discord.gg/A7BK2qnX97" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`flex items-center gap-3 bg-app-bg rounded-xl p-3 hover:bg-border transition-all duration-300 hover:scale-105 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? '7B Academy' : undefined}
        >
          <img 
            src="https://i.imgur.com/h4cpcUg.gif" 
            alt="7B Academy" 
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0" 
          />
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="text-text-muted text-xs font-bold">7B Academy</p>
            </div>
          )}
        </a>
      </div>
    </aside>
  );
}
