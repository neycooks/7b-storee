'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { X } from 'lucide-react';

export const revalidate = 0;

interface GamepassItem {
  id: number;
  name: string;
  price: number | null;
  link: string;
  icon: string | null;
}

export default function Gamepass() {
  const [searchQuery, setSearchQuery] = useState('');
  const [gamepasses, setGamepasses] = useState<GamepassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedGamepass, setSelectedGamepass] = useState<GamepassItem | null>(null);

  useEffect(() => {
    fetchGamepasses();
  }, []);

  const fetchGamepasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gamepasses', { cache: 'no-store' });
      const data = await res.json();
      console.log('[Gamepass] Data:', data);
      setGamepasses(data.items || []);
      setTotalPages(Math.ceil((data.items?.length || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching gamepasses:', error);
    }
    setLoading(false);
  };

  const filteredGamepasses = gamepasses.filter(gp => 
    gp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredGamepasses.length;
  const total = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedGamepasses = filteredGamepasses.slice(start, end);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col items-center mb-4 sm:mb-6">
        <div className="relative w-full max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Search Gamepasses"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-card-bg border border-border rounded-pill py-2.5 sm:py-3 pl-12 pr-4 text-white placeholder-text-muted focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      )}

      {!loading && filteredGamepasses.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted">No gamepasses found</p>
        </div>
      )}

      {!loading && filteredGamepasses.length > 0 && (
        <>
          <p className="text-text-muted text-xs mb-6">
            Showing {paginatedGamepasses.length} of {totalItems} items (Page {page} of {total})
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {paginatedGamepasses.map((gamepass) => (
              <div
                key={gamepass.id}
                onClick={() => setSelectedGamepass(gamepass)}
                className="product-card flex flex-col justify-between min-h-[160px] md:min-h-[200px] relative overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <svg width="150" height="150" viewBox="0 0 100 100" fill="currentColor" className="text-white">
                    <path d="M50 5L90 30V70L50 95L10 70V30L50 5Z"/>
                  </svg>
                </div>
                
                <div className="relative z-10">
                  {gamepass.icon && (
                    <img src={gamepass.icon} alt={gamepass.name} className="w-full h-32 object-cover rounded mb-2" />
                  )}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{gamepass.name}</h3>
                  <p className={`font-bold text-sm ${
                    gamepass.price === null ? 'text-red-400' : 'text-primary'
                  }`}>
                    {gamepass.price === null 
                      ? 'Offsale' 
                      : gamepass.price === 0 
                        ? 'Free' 
                        : `${gamepass.price}R$`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-card-bg rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border transition"
            >
              <ChevronLeft className="text-white" />
            </button>
            <span className="text-white font-bold">{page} / {total}</span>
            <button
              onClick={() => setPage(p => Math.min(total, p + 1))}
              disabled={page === total}
              className="p-2 bg-card-bg rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border transition"
            >
              <ChevronRight className="text-white" />
            </button>
          </div>
        </>
      )}

      {selectedGamepass && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center modal-backdrop animate-fade-in" onClick={() => setSelectedGamepass(null)}>
          <div 
            className="bg-card-bg rounded-lg p-8 max-w-md w-full mx-4 animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedGamepass(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <h2 className="text-white font-bold text-[32px] mb-2">{selectedGamepass.name}</h2>
              <p className="text-primary font-bold text-xl mb-6">{selectedGamepass.price === null ? 'Offsale' : selectedGamepass.price === 0 ? 'Free' : `${selectedGamepass.price}R$`}</p>
              
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/webhooks/purchase', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'gamepass',
                        item: {
                          id: selectedGamepass.id,
                          name: selectedGamepass.name,
                          price: selectedGamepass.price,
                          link: selectedGamepass.link,
                          thumbnail_url: selectedGamepass.icon
                        }
                      })
                    });
                  } catch (e) {
                    console.error('Webhook error:', e);
                  }
                  window.open(selectedGamepass.link, '_blank');
                }}
                className="w-full py-3 px-6 rounded-card font-bold text-base transition-all bg-primary text-black hover:opacity-90 hover:scale-105"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
