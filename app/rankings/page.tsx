'use client';

import { useState, useEffect } from 'react';
import { Loader2, Crown, Medal, Award } from 'lucide-react';

interface Ranking {
  id: number;
  name: string;
  username: string;
  icon_url: string | null;
  thumbnail_url: string | null;
  rank: number;
  created_at: string;
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/rankings');
      const data = await res.json();
      setRankings(data.rankings || []);
    } catch (e) {
      console.error('Failed to fetch rankings:', e);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-300" size={24} />;
    if (rank === 3) return <Award className="text-amber-600" size={24} />;
    return <span className="text-text-muted font-bold text-lg w-6 text-center">{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-400';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/10 to-transparent border-l-4 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/10 to-transparent border-l-4 border-amber-600';
    return 'bg-card-bg border-l-4 border-transparent hover:border-primary/50';
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-3xl mb-8 text-center">Rankings</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center text-text-muted py-20 bg-card-bg rounded-xl p-8">
          <Crown size={48} className="mx-auto mb-4 opacity-50" />
          <p>No rankings yet!</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl mx-auto">
          {rankings.map((item, index) => (
            <div
              key={item.id}
              className={`${getRankStyle(item.rank)} rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-[1.01] cursor-pointer`}
            >
              <div className="w-10 flex items-center justify-center">
                {getRankIcon(item.rank)}
              </div>
              
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-border flex-shrink-0">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover" />
                ) : item.icon_url ? (
                  <img src={item.icon_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">No img</div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg truncate">{item.name}</h3>
                <p className="text-text-muted text-sm truncate">@{item.username}</p>
              </div>
              
              <div className="text-right">
                <span className="text-primary font-bold text-xl">#{item.rank}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
