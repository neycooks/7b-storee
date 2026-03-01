'use client';

import { Lock } from 'lucide-react';

export default function Gamepass() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="bg-card-bg rounded-card p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-white font-bold text-3xl mb-4">Under Construction</h1>
        <p className="text-text-muted text-lg">This page is currently being developed.</p>
        <p className="text-text-muted text-sm mt-2">Check back later for gamepasses!</p>
      </div>
    </div>
  );
}
