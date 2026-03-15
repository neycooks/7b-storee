'use client';

import { useState, useEffect } from 'react';
import { Loader2, Crown, Medal, Award } from 'lucide-react';

interface Ranking {
  id: number;
  name: string;
  username: string;
  icon_url: string | null;
  thumbnail_url: string | null;
  rank: string;
  category: string;
  created_at: string;
}

const RANK_ORDER = ['Beginner', 'AMT', 'NOR', 'INT', 'ADV', 'PRO', 'ELT'];

const RANK_COLORS: Record<string, string> = {
  'Beginner': 'bg-gray-500',
  'AMT': 'bg-gray-400',
  'NOR': 'bg-blue-500',
  'INT': 'bg-green-500',
  'ADV': 'bg-purple-500',
  'PRO': 'bg-yellow-500',
  'ELT': 'bg-red-500',
};

const CATEGORY_COLORS: Record<string, string> = {
  'CLOTHING': 'bg-blue-500',
  'KITS': 'bg-green-500',
  'SHIRTS': 'bg-purple-500',
  'GFX': 'bg-pink-500',
  'BUILDINGS': 'bg-amber-500',
  'EDITS': 'bg-cyan-500',
  'ARTS': 'bg-red-500',
  'UGCS': 'bg-indigo-500',
  'MODELING': 'bg-teal-500',
};

const RANK_SHORT: Record<string, string> = {
  'Beginner': 'BEG',
  'AMT': 'AMT',
  'NOR': 'NOR',
  'INT': 'INT',
  'ADV': 'ADV',
  'PRO': 'PRO',
  'ELT': 'ELT',
};

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

  const getRankIcon = (rank: string) => {
    if (rank === 'ELT') return <Crown className="text-yellow-400" size={24} />;
    if (rank === 'PRO') return <Medal className="text-gray-300" size={24} />;
    if (rank === 'ADV') return <Award className="text-amber-600" size={24} />;
    return null;
  };

  const getRankStyle = (rank: string) => {
    if (rank === 'ELT') return 'bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-400';
    if (rank === 'PRO') return 'bg-gradient-to-r from-gray-400/20 to-transparent border-l-4 border-gray-300';
    if (rank === 'ADV') return 'bg-gradient-to-r from-purple-500/20 to-transparent border-l-4 border-purple-400';
    if (rank === 'INT') return 'bg-gradient-to-r from-green-500/20 to-transparent border-l-4 border-green-400';
    if (rank === 'NOR') return 'bg-gradient-to-r from-blue-500/20 to-transparent border-l-4 border-blue-400';
    return 'bg-card-bg border-l-4 border-transparent hover:border-primary/50';
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-3xl mb-2 text-center">7B Academy Rankings</h1>
      <p className="text-text-muted text-center mb-8 text-sm">Showcase your skill level and experience in the design community</p>

      <div className="bg-card-bg rounded-xl p-4 mb-6 max-w-2xl mx-auto">
        <h3 className="text-white font-bold mb-3">How to get a rank</h3>
        <ul className="text-text-muted text-sm space-y-1">
          <li>• Showcase your work in the server so staff can review it</li>
          <li>• Apply for a rank by opening a ticket in #tickets</li>
        </ul>
      </div>

      <div className="bg-card-bg rounded-xl p-4 mb-6 max-w-2xl mx-auto">
        <h3 className="text-white font-bold mb-3">Rank Progression</h3>
        <div className="flex flex-wrap gap-2">
          {RANK_ORDER.map((r) => (
            <span key={r} className={`px-3 py-1 rounded-full text-xs font-bold text-white ${RANK_COLORS[r]}`}>
              {RANK_SHORT[r]}
            </span>
          ))}
        </div>
        <p className="text-text-muted text-xs mt-2">Beginner → AMT → NOR → INT → ADV → PRO → ELT</p>
      </div>

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
          {rankings.map((item) => (
            <div
              key={item.id}
              className={`${getRankStyle(item.rank)} rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-[1.01]`}
            >
              <div className="w-10 flex items-center justify-center">
                {getRankIcon(item.rank) || <span className="text-text-muted font-bold text-lg">{RANK_ORDER.indexOf(item.rank) + 1}</span>}
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
                <div className="flex items-center gap-2 flex-wrap">
                  {item.category && item.category !== 'CLOTHING' && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${CATEGORY_COLORS[item.category] || 'bg-gray-500'}`}>
                      {item.category}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${RANK_COLORS[item.rank] || 'bg-gray-500'}`}>
                    {RANK_SHORT[item.rank] || item.rank}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg truncate">{item.name}</h3>
                <p className="text-text-muted text-sm truncate">@{item.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
