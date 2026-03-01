'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

const pageNames: Record<string, string> = {
  '/': 'DISCOVER',
  '/products': 'PRODUCTS',
  '/policies': 'POLICIES',
  '/about': 'ABOUT US',
};

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  global_name: string;
}

export default function TopBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const title = pageNames[pathname] || 'DISCOVER';
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<DiscordUser | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = () => {
      const cookie = document.cookie.split('; ').find(row => row.startsWith('discord_user='));
      if (cookie) {
        try {
          const userData = JSON.parse(cookie.split('=')[1]);
          setUser(userData);
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    
    const params = searchParams;
    if (params.get('logged_in') === 'true') {
      checkUser();
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  const handleLogin = () => {
    window.location.href = '/api/auth/discord';
  };

  const getAvatarUrl = (user: DiscordUser) => {
    if (!user.avatar) return null;
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  };

  const displayName = user?.global_name || user?.username || null;

  return (
    <header 
      className={`sticky top-0 z-40 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
        scrolled 
          ? 'bg-card-bg/95 backdrop-blur-sm rounded-card mt-4 mx-4 shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <h1 className="text-white font-bold text-base tracking-[2px]">{title}</h1>
      
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-white font-bold text-base">{displayName}</span>
            <div className="w-10 h-10 rounded-full bg-card-bg flex items-center justify-center overflow-hidden">
              {getAvatarUrl(user) ? (
                <img src={getAvatarUrl(user)!} alt={displayName!} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-black font-bold">
                  {displayName ? displayName[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 px-4 rounded-card transition-all hover:scale-105"
          >
            Login with Discord
          </button>
        )}
      </div>
    </header>
  );
}
