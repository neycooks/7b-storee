'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GROUP_INFO } from '@/types/roblox';

interface GroupStats {
  members: number;
  sales: number;
  products: number;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name: string;
}

function getDiscordUser(): DiscordUser | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'discord_user') {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export default function Discover() {
  const [stats, setStats] = useState<GroupStats>({ members: 0, sales: 0, products: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [processed, setProcessed] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch('/api/group')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStats({
            members: data.members || 0,
            sales: data.sales || 0,
            products: data.products || 0,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (processed) return;
    
    const isLoggedIn = searchParams.get('logged_in');
    
    if (isLoggedIn === 'true') {
      // Clean URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('logged_in');
      window.history.replaceState({}, '', url.toString());
    }

    // Check for existing user
    const userData = getDiscordUser();
    setUser(userData);
    setProcessed(true);
  }, [searchParams, processed]);

  const displayName = user?.global_name || user?.username || 'Guest';

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
        <div className="md:col-span-3 bg-card-bg rounded-lg p-4 md:p-6 relative overflow-hidden min-h-[200px] md:min-h-[280px] group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
          <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full absolute top-4 left-4">
            People&apos;s favourite
          </span>
          <h2 className="text-white font-extrabold text-2xl md:text-[48px] leading-tight mt-10 md:mt-16">
            Olise #17 Bayern Munich Third 25-26 SS
          </h2>
          <p className="text-primary font-bold text-lg md:text-xl mt-2 md:mt-4">5R$</p>
        </div>

        <a 
          href="https://www.roblox.com/communities/35515756/7B-STORE"
          target="_blank"
          rel="noopener noreferrer"
          className="md:col-span-2 bg-card-bg rounded-lg p-4 md:p-6 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
        >
          <div className="absolute top-4 right-4 w-16 h-16 md:w-20 md:h-20 opacity-30">
            <img src="https://i.imgur.com/1kygngm.jpeg" alt="7B Store" className="w-full h-full object-contain rounded" />
          </div>
          <h3 className="text-white font-bold text-xl md:text-2xl mt-12 md:mt-16">{GROUP_INFO.name}</h3>
          <p className="text-text-muted text-sm mb-2 md:mb-3">Official Group Store</p>
          <p className="text-text-muted text-xs leading-relaxed hidden md:block">
            Welcome to 7B Store - Your official destination for premium Roblox items and accessories.
          </p>
        </a>
      </div>

      <div>
        <h3 className="text-white font-bold text-sm tracking-wider mb-4 md:mb-6">HUB OVERVIEW</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-card-bg rounded-card p-4 md:p-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <p className="text-text-muted text-xs mb-1 md:mb-2">Connected Account</p>
            <p className="text-white font-extrabold text-xl md:text-[32px]">{displayName}</p>
          </div>
          <div className="bg-card-bg rounded-card p-4 md:p-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <p className="text-text-muted text-xs mb-1 md:mb-2">Total Sales</p>
            <p className="text-white font-extrabold text-xl md:text-[32px]">2000+</p>
          </div>
          <div className="bg-card-bg rounded-card p-4 md:p-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <p className="text-text-muted text-xs mb-1 md:mb-2">Experience</p>
            <p className="text-white font-extrabold text-xl md:text-[32px]">4 Years</p>
          </div>
        </div>
      </div>
    </div>
  );
}
