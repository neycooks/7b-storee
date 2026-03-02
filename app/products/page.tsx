'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, Trophy, Users } from 'lucide-react';

interface RobloxItem {
  id: number;
  name: string;
  description: string;
  price: number | null;
  link: string;
  icon: string;
}

interface League {
  id: number;
  name: string;
  icon_url: string;
  join_link: string;
}

interface Team {
  id: number;
  league_id: number;
  name: string;
  logo_url: string;
}

interface TeamKit {
  id: number;
  team_id: number;
  name: string;
  roblox_id: number;
  price: number;
  thumbnail_url: string;
  link: string;
}

export default function Products() {
  const [viewMode, setViewMode] = useState<'group' | 'leagues'>('group');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<RobloxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamKits, setTeamKits] = useState<TeamKit[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [leagueView, setLeagueView] = useState<'leagues' | 'teams' | 'merch'>('leagues');

  const fetchProducts = (pageNum: number) => {
    setLoading(true);
    setError(null);
    
    fetch(`/api/items?page=${pageNum}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setProducts(data.items || []);
          setTotalPages(data.totalPages || 0);
          setTotalItems(data.totalItems || 0);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load products');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (viewMode === 'group') {
      fetchProducts(page);
    } else {
      fetchLeagues();
    }
  }, [viewMode, page]);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leagues');
      const data = await res.json();
      setLeagues(data.leagues || []);
    } catch (e) {
      console.error('Failed to fetch leagues:', e);
    }
    setLoading(false);
  };

  const fetchTeams = async (leagueId: number) => {
    try {
      const res = await fetch(`/api/teams?leagueId=${leagueId}`);
      const data = await res.json();
      setTeams(data.teams || []);
    } catch (e) {
      console.error('Failed to fetch teams:', e);
    }
  };

  const fetchTeamKits = async (teamId: number) => {
    try {
      const res = await fetch(`/api/team-kits?teamId=${teamId}`);
      const data = await res.json();
      setTeamKits(data.kits || []);
    } catch (e) {
      console.error('Failed to fetch team kits:', e);
    }
  };

  const handleLeagueClick = (league: League) => {
    setSelectedLeague(league);
    setSelectedTeam(null);
    setLeagueView('teams');
    fetchTeams(league.id);
  };

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setLeagueView('merch');
    fetchTeamKits(team.id);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {viewMode === 'group' ? (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                placeholder="Search For Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card-bg border border-border rounded-pill py-3 pl-12 pr-4 text-white placeholder-text-muted focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex bg-card-bg rounded-full p-1">
              <button
                onClick={() => { setViewMode('group'); setSelectedLeague(null); setSelectedTeam(null); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${
                  viewMode === 'group' ? 'bg-primary text-black' : 'text-white'
                }`}
              >
                <Trophy size={18} />
                Group
              </button>
              <button
                onClick={() => { setViewMode('leagues'); setSelectedLeague(null); setSelectedTeam(null); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${
                  viewMode === 'leagues' ? 'bg-primary text-black' : 'text-white'
                }`}
              >
                <Users size={18} />
                Leagues
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-text-muted">No clothing found</p>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <>
              <p className="text-text-muted text-xs mb-6">
                Showing {filteredProducts.length} of {totalItems} items (Page {page} of {totalPages})
              </p>

              <div className="grid grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => window.open(product.link, '_blank')}
                    className="product-card flex flex-col justify-between min-h-[240px] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                      <svg width="150" height="150" viewBox="0 0 100 100" fill="currentColor" className="text-white">
                        <path d="M50 5L90 30V70L50 95L10 70V30L50 5Z"/>
                      </svg>
                    </div>
                    
                    <div className="relative z-10">
                      {product.icon && (
                        <img src={product.icon} alt={product.name} className="w-full h-32 object-cover rounded mb-2" />
                      )}
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <p className={`font-bold text-sm ${
                        product.price === null ? 'text-red-400' : 'text-primary'
                      }`}>
                        {product.price === null 
                          ? 'Offsale' 
                          : product.price === 0 
                            ? 'Free' 
                            : `${product.price}R$`}
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
                <span className="text-white font-bold">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-card-bg rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border transition"
                >
                  <ChevronRight className="text-white" />
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1"></div>
            <div className="flex bg-card-bg rounded-full p-1">
              <button
                onClick={() => { setViewMode('group'); setSelectedLeague(null); setSelectedTeam(null); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${
                  viewMode === 'group' ? 'bg-primary text-black' : 'text-white'
                }`}
              >
                <Trophy size={18} />
                Group
              </button>
              <button
                onClick={() => { setViewMode('leagues'); setSelectedLeague(null); setSelectedTeam(null); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition ${
                  viewMode === 'leagues' ? 'bg-primary text-black' : 'text-white'
                }`}
              >
                <Users size={18} />
                Leagues
              </button>
            </div>
          </div>
          {leagueView === 'leagues' && !selectedLeague && (
            <div className="text-center py-10">
              <h2 className="text-white font-bold text-2xl mb-6">Leagues</h2>
              {loading ? (
                <Loader2 className="animate-spin text-primary mx-auto" size={40} />
              ) : leagues.length === 0 ? (
                <p className="text-text-muted">No leagues available</p>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {leagues.map(league => (
                    <div
                      key={league.id}
                      onClick={() => handleLeagueClick(league)}
                      className="bg-card-bg rounded-xl p-4 cursor-pointer hover:ring-2 ring-primary transition"
                    >
                      {league.icon_url ? (
                        <img src={league.icon_url} alt={league.name} className="w-20 h-20 object-cover rounded-lg mx-auto mb-3" />
                      ) : (
                        <div className="w-20 h-20 bg-border rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <Trophy className="text-text-muted" size={32} />
                        </div>
                      )}
                      <h3 className="text-white font-bold text-center">{league.name}</h3>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {leagueView === 'teams' && selectedLeague && (
            <div className="animate-fade-in">
              <button
                onClick={() => { setSelectedLeague(null); setLeagueView('leagues'); }}
                className="text-primary hover:underline mb-4"
              >
                ← Back to Leagues
              </button>
              <h2 className="text-white font-bold text-2xl mb-6">{selectedLeague.name} - Teams</h2>
              
              {teams.length === 0 ? (
                <p className="text-text-muted">No teams available</p>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {teams.map(team => (
                    <div
                      key={team.id}
                      onClick={() => handleTeamClick(team)}
                      className="bg-card-bg rounded-xl p-4 cursor-pointer hover:ring-2 ring-primary transition"
                    >
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-20 h-20 object-cover rounded-lg mx-auto mb-3" />
                      ) : (
                        <div className="w-20 h-20 bg-border rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <Users className="text-text-muted" size={32} />
                        </div>
                      )}
                      <h3 className="text-white font-bold text-center">{team.name}</h3>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {leagueView === 'merch' && selectedTeam && (
            <div className="animate-fade-in">
              <button
                onClick={() => { setSelectedTeam(null); setLeagueView('teams'); }}
                className="text-primary hover:underline mb-4"
              >
                ← Back to Teams
              </button>
              <h2 className="text-white font-bold text-2xl mb-6">{selectedTeam.name} - Kits</h2>
              
              {teamKits.length === 0 ? (
                <p className="text-text-muted">No kits available</p>
              ) : (
                <div className="grid grid-cols-5 gap-4">
                  {teamKits.map(kit => (
                    <div
                      key={kit.id}
                      onClick={() => window.open(kit.link, '_blank')}
                      className="bg-card-bg rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-primary transition"
                    >
                      {kit.thumbnail_url ? (
                        <img src={kit.thumbnail_url} alt={kit.name} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-border flex items-center justify-center">
                          <Search className="text-text-muted" size={24} />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="text-white font-bold text-sm line-clamp-2">{kit.name}</h3>
                        <p className="text-primary font-bold text-sm">{kit.price ? `${kit.price}R$` : 'Free'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
