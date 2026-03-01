'use client';

import { useState, useEffect } from 'react';
import { GROUP_INFO } from '@/types/roblox';

interface GroupStats {
  members: number;
  sales: number;
  products: number;
}

export default function Discover() {
  const [stats, setStats] = useState<GroupStats>({ members: 0, sales: 0, products: 0 });
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 bg-card-bg rounded-lg p-6 relative overflow-hidden min-h-[280px]">
          <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full absolute top-4 left-4">
            People&apos;s favourite
          </span>
          <h2 className="text-white font-extrabold text-[48px] leading-tight mt-16">
            Image Permissions
          </h2>
          <p className="text-primary font-bold text-xl mt-4">25R$</p>
        </div>

        <div className="col-span-2 bg-card-bg rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-20 h-20 opacity-30">
            <div className="w-full h-full bg-primary rounded flex items-center justify-center">
              <span className="text-black font-bold text-xs">7B</span>
            </div>
          </div>
          <h3 className="text-white font-bold text-2xl mt-16">{GROUP_INFO.name}</h3>
          <p className="text-text-muted text-sm mb-3">Official Group Store</p>
          <p className="text-text-muted text-xs leading-relaxed">
            Welcome to 7B Store - Your official destination for premium Roblox items and accessories.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-white font-bold text-sm tracking-wider mb-6">HUB OVERVIEW</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-card-bg rounded-card p-6">
            <p className="text-text-muted text-xs mb-2">Connected Account</p>
            <p className="text-white font-extrabold text-[32px]">ABRA</p>
          </div>
          <div className="bg-card-bg rounded-card p-6">
            <p className="text-text-muted text-xs mb-2">Total Sales</p>
            <p className="text-white font-extrabold text-[32px]">{loading ? '...' : stats.sales}</p>
          </div>
          <div className="bg-card-bg rounded-card p-6">
            <p className="text-text-muted text-xs mb-2">Owned Products</p>
            <p className="text-white font-extrabold text-[32px]">{loading ? '...' : stats.products}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
