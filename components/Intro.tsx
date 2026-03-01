'use client';

import { useState, useEffect } from 'react';

export default function Intro() {
  const [showIntro, setShowIntro] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('discord_user='));
    if (cookie) {
      try {
        const userData = JSON.parse(cookie.split('=')[1]);
        setUserName(userData.global_name || userData.username);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setShowIntro(false), 300);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!showIntro) return null;

  return (
    <div 
      className={`fixed inset-0 bg-app-bg flex flex-col items-center justify-center z-[100] transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <img 
        src="https://i.imgur.com/4ausQA1.png" 
        alt="7B STORE" 
        className="w-40 h-40 object-contain mb-8 rounded-2xl animate-scale-in"
      />
      <h1 className="text-white font-bold text-3xl animate-fade-in-up">
        Welcome{userName ? `, ${userName}` : ''}.
      </h1>
    </div>
  );
}
