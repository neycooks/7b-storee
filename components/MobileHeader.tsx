'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingBag, FileText, Info, Star, Grid, Menu, X, Trophy } from 'lucide-react';

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

export default function MobileHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[60px] bg-card-bg z-50 flex items-center justify-between px-4 lg:hidden">
        <button 
          onClick={() => setMenuOpen(true)}
          className="p-2 text-white"
        >
          <Menu size={24} />
        </button>
        
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="https://i.imgur.com/4ausQA1.png" 
            alt="7B STORE" 
            className="w-8 h-8 object-contain rounded-xl"
          />
          <span className="text-white font-bold text-lg">7B STORE</span>
        </Link>
        
        <div className="w-10"></div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''} lg:hidden`}>
        <div className="flex justify-between items-center mb-6">
          <img 
            src="https://i.imgur.com/4ausQA1.png" 
            alt="7B STORE" 
            className="w-10 h-10 object-contain rounded-2xl"
          />
          <button 
            onClick={() => setMenuOpen(false)}
            className="p-2 text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-black' 
                    : 'text-white hover:bg-border'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        <a 
          href="https://discord.gg/A7BK2qnX97" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mt-6 bg-app-bg rounded-card p-3 flex items-center gap-3"
        >
          <img 
            src="https://i.imgur.com/h4cpcUg.gif" 
            alt="7B Academy" 
            className="w-10 h-10 rounded-sm object-cover" 
          />
          <span className="text-text-muted text-xs font-bold">7B Academy</span>
        </a>
      </nav>
    </>
  );
}
