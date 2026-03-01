'use client';

import { useState, useEffect } from 'react';

export default function Intro() {
  const [showIntro, setShowIntro] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setShowIntro(false), 300);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!showIntro) return null;

  return (
    <div 
      className={`fixed inset-0 bg-app-bg flex flex-col items-center justify-center z-[100] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-32 h-32 bg-primary rounded-lg flex items-center justify-center mb-8 shadow-2xl">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 8V20L12 22L22 20V8L12 2Z" stroke="black" strokeWidth="2"/>
          <path d="M12 22V12" stroke="black" strokeWidth="2"/>
          <path d="M22 8L12 12L2 8" stroke="black" strokeWidth="2"/>
          <path d="M7 6L17 6" stroke="black" strokeWidth="2"/>
          <path d="M12 2V8" stroke="black" strokeWidth="2"/>
        </svg>
      </div>
      <h1 className="text-white font-bold text-3xl">Welcome, Abra.</h1>
    </div>
  );
}
