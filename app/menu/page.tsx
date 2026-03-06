'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface MenuPost {
  id: number;
  category: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

const categories = [
  { id: 'gfx', name: 'GFX', icon: '🎨' },
  { id: 'shirts', name: 'Shirts', icon: '👕' },
  { id: 'logos', name: 'Logos', icon: '🏷️' },
  { id: 'building', name: 'Building', icon: '🏗️' },
  { id: 'ugc', name: 'UGC', icon: '🎮' },
  { id: 'assets', name: 'Assets', icon: '📦' },
  { id: 'lessons', name: 'Lessons', icon: '📚' },
  { id: 'edits', name: 'Edits', icon: '✂️' },
  { id: 'web', name: 'Web', icon: '🌐' },
];

export default function MenuPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-3xl mb-8 text-center">Menu</h1>
      
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/menu/${cat.id}`}
            className="bg-card-bg rounded-xl p-6 flex flex-col items-center justify-center hover:ring-2 ring-primary transition-all hover:scale-105 cursor-pointer min-h-[150px]"
          >
            <span className="text-4xl mb-3">{cat.icon}</span>
            <span className="text-white font-bold text-xl">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
