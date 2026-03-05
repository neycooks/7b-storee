'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, Trophy, Users } from 'lucide-react';

export const revalidate = 0;

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
  
  const [openLeague, setOpenLeague] = useState<number | null>(null);
  const [openTeam, setOpenTeam] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<RobloxItem | null>(null);

  const fetchProducts = (pageNum: number) => {
    setLoading(true);
    setError(null);
    
    fetch(`/api/items?page=${pageNum}&pageSize=${pageSize}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        console.log('[Products] Items data:', data);
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
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'group') {
      fetchProducts(page);
    }
  }, [viewMode, page]);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leagues', { cache: 'no-store' });
      const data = await res.json();
      console.log('[Products] Leagues data:', data);
      setLeagues(data.leagues || []);
    } catch (e) {
      console.error('Failed to fetch leagues:', e);
    }
    setLoading(false);
  };

  const fetchTeams = async (leagueId: number) => {
    try {
      const res = await fetch(`/api/teams?leagueId=${leagueId}`, { cache: 'no-store' });
      const data = await res.json();
      setTeams(data.teams || []);
    } catch (e) {
      console.error('Failed to fetch teams:', e);
    }
  };

  const fetchTeamKits = async (teamId: number) => {
    try {
      const res = await fetch(`/api/team-kits?teamId=${teamId}`, { cache: 'no-store' });
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

  const toggleLeague = (leagueId: number) => {
    if (openLeague === leagueId) {
      setOpenLeague(null);
      setOpenTeam(null);
    } else {
      setOpenLeague(leagueId);
      setOpenTeam(null);
      fetchTeams(leagueId);
    }
  };

  const toggleTeam = (teamId: number) => {
    setOpenTeam(prev => prev === teamId ? null : teamId);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isGroupView = viewMode === 'group';

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        {isGroupView && (
          <div className="relative w-full sm:max-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Search Products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card-bg border border-border rounded-pill py-2.5 sm:py-3 pl-12 pr-4 text-white placeholder-text-muted focus:outline-none focus:border-primary/50"
            />
          </div>
        )}
        {isGroupView && <div className="flex-1"></div>}
        <div className="flex bg-card-bg rounded-full p-1 h-fit">
          <button
            onClick={() => { setViewMode('group'); setSelectedLeague(null); setSelectedTeam(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition ${
              isGroupView ? 'bg-primary text-black' : 'text-white'
            }`}
          >
            <Trophy size={18} />
            Group
          </button>
          <button
            onClick={() => { setViewMode('leagues'); setSelectedLeague(null); setSelectedTeam(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition ${
              !isGroupView ? 'bg-primary text-black' : 'text-white'
            }`}
          >
            <Users size={18} />
            Leagues
          </button>
        </div>
      </div>

      {isGroupView ? (
        <>

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

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="product-card flex flex-col justify-between min-h-[160px] md:min-h-[200px] relative overflow-hidden cursor-pointer"
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
          <h2 className="text-white font-bold text-2xl mb-6">Leagues</h2>
          {loading ? (
            <Loader2 className="animate-spin text-primary mx-auto" size={40} />
          ) : leagues.length === 0 ? (
            <p className="text-text-muted">No leagues available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {leagues.map(league => {
                const isLeagueOpen = openLeague === league.id;
                const isTeamsOpen = isLeagueOpen && openTeam !== null;
                const leagueTeams = teams.filter(t => t.league_id === league.id);
                
                return (
                  <div
                    key={league.id}
                    className={`bg-card-bg rounded-xl overflow-hidden transition-all duration-300 ease-out ${isLeagueOpen ? 'col-span-4 ring-2 ring-primary' : 'hover:ring-2 ring-primary/50 cursor-pointer'}`}
                    onClick={() => !isLeagueOpen && toggleLeague(league.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        {league.icon_url ? (
                          <img src={league.icon_url} alt={league.name} className="w-12 h-12 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 bg-border rounded-lg flex items-center justify-center">
                            <Trophy className="text-text-muted" size={24} />
                          </div>
                        )}
                        {league.join_link && !isLeagueOpen && (
                          <a
                            href={league.join_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1 bg-primary text-black text-xs font-bold rounded-full hover:opacity-90 transition"
                          >
                            Join
                          </a>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-sm mb-2">{league.name}</h3>
                      
                      {isLeagueOpen && (
                        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                          <div className="flex items-center justify-between mb-3">
                            {league.join_link && (
                              <a
                                href={league.join_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-1.5 bg-primary text-black text-sm font-bold rounded-full hover:opacity-90 transition"
                              >
                                Join Server
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenLeague(null);
                                setOpenTeam(null);
                              }}
                              className="text-text-muted hover:text-white text-sm"
                            >
                              Close ✕
                            </button>
                          </div>
                          
                          {leagueTeams.length > 0 ? (
                            <>
                              <p className="text-text-muted text-xs mb-2">Teams:</p>
                              <div className="grid grid-cols-3 gap-2 mb-4">
                                {leagueTeams.map(team => {
                                  const isTeamOpen = openTeam === team.id;
                                  return (
                                    <button
                                      key={team.id}
                                      className={`p-2 rounded-lg border text-center text-xs transition-all ${
                                        isTeamOpen 
                                          ? 'border-primary bg-primary/20 text-white' 
                                          : 'border-border bg-app-bg text-text-muted hover:text-white hover:border-primary/50'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTeam(team.id);
                                        if (openTeam !== team.id) {
                                          fetchTeamKits(team.id);
                                        }
                                      }}
                                    >
                                      {team.logo_url ? (
                                        <img src={team.logo_url} alt={team.name} className="w-8 h-8 rounded-full mx-auto mb-1 object-cover" />
                                      ) : (
                                        <Users size={16} className="mx-auto mb-1" />
                                      )}
                                      <span className="line-clamp-1">{team.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {openTeam && teamKits.length > 0 && (
                                <div className="animate-fade-in">
                                  <p className="text-text-muted text-xs mb-2">
                                    Kits for <span className="text-white font-semibold">{teams.find(t => t.id === openTeam)?.name}</span>
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {teamKits.map(kit => {
                                      const currentLeague = leagues.find(l => l.id === teams.find(t => t.id === openTeam)?.league_id);
                                      const currentTeam = teams.find(t => t.id === openTeam);
                                      return (
                                        <div
                                          key={kit.id}
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              await fetch('/api/webhooks/purchase', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                  type: 'league',
                                                  item: {
                                                    id: kit.id,
                                                    name: kit.name,
                                                    price: kit.price,
                                                    link: kit.link,
                                                    thumbnail_url: kit.thumbnail_url
                                                  },
                                                  leagueInfo: {
                                                    leagueName: currentLeague?.name,
                                                    teamName: currentTeam?.name
                                                  }
                                                })
                                              });
                                            } catch (e) {
                                              console.error('Webhook error:', e);
                                            }
                                            window.open(kit.link, '_blank');
                                          }}
                                          className="bg-app-bg rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
                                        >
                                          {kit.thumbnail_url ? (
                                            <img src={kit.thumbnail_url} alt={kit.name} className="w-full h-16 object-cover" />
                                          ) : (
                                            <div className="w-full h-16 bg-border flex items-center justify-center">
                                              <Search className="text-text-muted" size={20} />
                                            </div>
                                          )}
                                          <div className="p-2">
                                            <p className="text-white text-xs line-clamp-1">{kit.name}</p>
                                            <p className="text-primary font-bold text-xs">{kit.price ? `${kit.price}R$` : 'Free'}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-text-muted text-sm">No teams in this league</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center modal-backdrop animate-fade-in p-4" onClick={() => setSelectedProduct(null)}>
          <div 
            className="bg-card-bg rounded-lg p-4 md:p-8 max-w-sm w-full animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="text-center">
              {selectedProduct.icon && (
                <img src={selectedProduct.icon} alt={selectedProduct.name} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg mx-auto mb-4" />
              )}
              <h2 className="text-white font-bold text-lg md:text-2xl mb-2">{selectedProduct.name}</h2>
              <p className="text-primary font-bold text-lg md:text-xl mb-4 md:mb-6">
                {selectedProduct.price === null ? 'Offsale' : selectedProduct.price === 0 ? 'Free' : `${selectedProduct.price}R$`}
              </p>
              
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/webhooks/purchase', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'clothing',
                        item: {
                          id: selectedProduct.id,
                          name: selectedProduct.name,
                          price: selectedProduct.price,
                          link: selectedProduct.link,
                          thumbnail_url: selectedProduct.icon
                        }
                      })
                    });
                  } catch (e) {
                    console.error('Webhook error:', e);
                  }
                  window.open(selectedProduct.link, '_blank');
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
