'use client';

import { useState, useEffect } from 'react';

const aboutInfo = [
  {
    title: 'High Quality',
    description: 'We provide only the highest quality football kits and accessories. Every item is carefully selected and verified for quality assurance.',
  },
  {
    title: 'Widespread Community',
    description: 'Join thousands of satisfied customers worldwide. Our community continues to grow every day with players from all corners of Roblox.',
  },
  {
    title: 'Fast Delivery',
    description: 'Instant delivery system ensures you get your items immediately after purchase. No waiting, just gaming.',
  },
  {
    title: 'Best Prices',
    description: 'Competitive pricing on all products. We offer the best value for your Robux with regular discounts and deals.',
  },
  {
    title: 'Exclusive Items',
    description: 'Access exclusive kits and items you won\'t find anywhere else. Limited edition products available for a limited time.',
  },
  {
    title: 'Trusted Platform',
    description: 'Years of experience serving the Roblox community. Trusted by thousands of players worldwide.',
  },
];

interface ShopItem {
  id: number;
  roblox_id: number;
  name: string;
  price: number | null;
  thumbnail_url: string | null;
  link: string | null;
  type: string;
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

interface MenuPost {
  id: number;
  category: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

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

const RANK_OPTIONS = ['Beginner', 'AMT', 'NOR', 'INT', 'ADV', 'PRO', 'ELT'];
const CATEGORY_OPTIONS = ['CLOTHING', 'KITS', 'SHIRTS', 'GFX', 'BUILDINGS', 'EDITS', 'ARTS', 'UGCS', 'MODELING'];

export default function About() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'clothing' | 'gamepasses' | 'leagues' | 'menu' | 'rankings'>('clothing');
  const [leagueSubTab, setLeagueSubTab] = useState<'league' | 'teams' | 'merch'>('league');
  const [clothingItems, setClothingItems] = useState<ShopItem[]>([]);
  const [gamepassItems, setGamepassItems] = useState<ShopItem[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamKits, setTeamKits] = useState<TeamKit[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [editForm, setEditForm] = useState({ robloxId: '', name: '', price: '', iconUrl: '', link: '' });
  const [loading, setLoading] = useState(false);
  const [newLeague, setNewLeague] = useState({ name: '', iconUrl: '', joinLink: '' });
  const [newTeam, setNewTeam] = useState({ leagueId: 0, name: '', logoUrl: '', teamCount: '1' });
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newKit, setNewKit] = useState({ name: '', robloxId: '', price: '', thumbnailUrl: '', link: '' });
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingKit, setEditingKit] = useState<TeamKit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuPosts, setMenuPosts] = useState<MenuPost[]>([]);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('gfx');
  const [newMenuPost, setNewMenuPost] = useState({ title: '', description: '', imageUrl: '' });
  const [editingMenuPost, setEditingMenuPost] = useState<MenuPost | null>(null);
  const [draggedItem, setDraggedItem] = useState<ShopItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [newRanking, setNewRanking] = useState({ name: '', username: '', iconUrl: '', thumbnailUrl: '', rank: 'Beginner', category: 'CLOTHING' });
  const [editingRanking, setEditingRanking] = useState<Ranking | null>(null);
  const [rankingDragIdx, setRankingDragIdx] = useState<number | null>(null);
  const [rankingDragOverIdx, setRankingDragOverIdx] = useState<number | null>(null);
  const [rankingsChanged, setRankingsChanged] = useState(false);

  useEffect(() => {
    if (showAdmin) {
      fetchItems();
    }
  }, [showAdmin, activeTab]);

  useEffect(() => {
    if (showAdmin && activeTab === 'leagues') {
      fetchLeagues();
    }
  }, [showAdmin, activeTab]);

  useEffect(() => {
    if (showAdmin && activeTab === 'leagues' && leagueSubTab === 'teams' && selectedLeague) {
      fetchTeams(selectedLeague.id);
    }
  }, [showAdmin, activeTab, leagueSubTab, selectedLeague]);

  useEffect(() => {
    if (showAdmin && activeTab === 'leagues' && leagueSubTab === 'merch' && selectedTeam) {
      fetchTeamKits(selectedTeam.id);
    }
  }, [showAdmin, activeTab, leagueSubTab, selectedTeam]);

  useEffect(() => {
    if (showAdmin && activeTab === 'menu') {
      fetchMenuPosts();
    }
  }, [showAdmin, activeTab, selectedMenuCategory]);

  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/rankings');
      const data = await res.json();
      setRankings(data.rankings || []);
    } catch (e) {
      console.error('Failed to fetch rankings:', e);
    }
  };

  useEffect(() => {
    if (showAdmin && activeTab === 'rankings') {
      fetchRankings();
    }
  }, [showAdmin, activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shop-items?type=item');
      const data = await res.json();
      setClothingItems(data.items || []);
      
      const res2 = await fetch('/api/admin/shop-items?type=gamepass');
      const data2 = await res2.json();
      setGamepassItems(data2.items || []);
    } catch (e) {
      console.error('Failed to fetch items:', e);
    }
    setLoading(false);
  };

  const fetchLeagues = async () => {
    const res = await fetch('/api/admin/leagues');
    const data = await res.json();
    setLeagues(data.leagues || []);
  };

  const fetchTeams = async (leagueId: number) => {
    const res = await fetch(`/api/admin/teams?leagueId=${leagueId}`);
    const data = await res.json();
    setTeams(data.teams || []);
  };

  const fetchTeamKits = async (teamId: number) => {
    const res = await fetch(`/api/admin/team-kits?teamId=${teamId}`);
    const data = await res.json();
    setTeamKits(data.kits || []);
  };

  const fetchMenuPosts = async () => {
    try {
      const res = await fetch(`/api/menu/posts?category=${selectedMenuCategory}`);
      const data = await res.json();
      setMenuPosts(data.posts || []);
    } catch (e) {
      console.error('Failed to fetch menu posts:', e);
    }
  };

  const handleCreateMenuPost = async () => {
    if (!newMenuPost.title || !newMenuPost.description || !newMenuPost.imageUrl) {
      alert('Please fill in all fields');
      return;
    }
    const res = await fetch('/api/menu/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: selectedMenuCategory,
        title: newMenuPost.title,
        description: newMenuPost.description,
        image_url: newMenuPost.imageUrl,
      }),
    });
    if (res.ok) {
      setNewMenuPost({ title: '', description: '', imageUrl: '' });
      setShowCreateForm(false);
      fetchMenuPosts();
    }
  };

  const handleEditMenuPost = (post: MenuPost) => {
    setEditingMenuPost(post);
    setNewMenuPost({ title: post.title, description: post.description, imageUrl: post.image_url });
    setShowCreateForm(true);
  };

  const handleSaveMenuPost = async () => {
    if (!editingMenuPost || !newMenuPost.title || !newMenuPost.description || !newMenuPost.imageUrl) {
      alert('Please fill in all fields');
      return;
    }
    const res = await fetch('/api/menu/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingMenuPost.id,
        category: selectedMenuCategory,
        title: newMenuPost.title,
        description: newMenuPost.description,
        image_url: newMenuPost.imageUrl,
      }),
    });
    if (res.ok) {
      setEditingMenuPost(null);
      setNewMenuPost({ title: '', description: '', imageUrl: '' });
      setShowCreateForm(false);
      fetchMenuPosts();
    }
  };

  const handleDeleteMenuPost = async (id: number) => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await fetch(`/api/menu/posts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMenuPosts();
      }
    } catch (e) {
      console.error('Failed to delete menu post:', e);
    }
  };

  const handleCreateRanking = async () => {
    if (!newRanking.name || !newRanking.username) {
      alert('Please fill in name and username');
      return;
    }
    const res = await fetch('/api/rankings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newRanking.name,
        username: newRanking.username,
        icon_url: newRanking.iconUrl,
        thumbnail_url: newRanking.thumbnailUrl,
        rank: newRanking.rank,
        category: newRanking.category,
      }),
    });
    if (res.ok) {
      setNewRanking({ name: '', username: '', iconUrl: '', thumbnailUrl: '', rank: 'Beginner', category: 'CLOTHING' });
      setShowCreateForm(false);
      fetchRankings();
    }
  };

  const handleDeleteRanking = async (id: number) => {
    if (!confirm('Delete this ranking?')) return;
    try {
      const res = await fetch(`/api/rankings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRankings();
      }
    } catch (e) {
      console.error('Failed to delete ranking:', e);
    }
  };

  const handleRankingDragStart = (e: React.DragEvent, index: number) => {
    setRankingDragIdx(index);
  };

  const handleRankingDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setRankingDragOverIdx(index);
  };

  const handleRankingDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (rankingDragIdx === null) return;
    const newRankings = [...rankings];
    const [moved] = newRankings.splice(rankingDragIdx, 1);
    newRankings.splice(dropIndex, 0, moved);
    setRankings(newRankings);
    setRankingDragIdx(null);
    setRankingDragOverIdx(null);
    setRankingsChanged(true);
  };

  const handleSaveRankingsOrder = async () => {
    try {
      const res = await fetch('/api/rankings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: rankings.map((r) => ({ id: r.id, rank: r.rank, category: r.category }))
        })
      });
      if (res.ok) {
        setRankingsChanged(false);
        fetchRankings();
        alert('Order saved!');
      }
    } catch (e) {
      console.error('Failed to save rankings order:', e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    try {
      const res = await fetch(`/api/admin/shop-items?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      console.log('[Admin] Delete response:', data);
      if (res.ok) {
        setClothingItems(prev => prev.filter(item => item.id !== id));
        setGamepassItems(prev => prev.filter(item => item.id !== id));
      } else {
        alert('Failed to delete: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('[Admin] Delete error:', e);
      alert('Failed to delete item');
    }
  };

  const handleCreate = async () => {
    let robloxId = editForm.robloxId;
    if (robloxId.includes('roblox.com')) {
      const match = robloxId.match(/\/(\d+)/);
      if (match) robloxId = match[1];
    }
    if (!robloxId || isNaN(parseInt(robloxId))) {
      alert('Please enter a valid Roblox ID');
      return;
    }
    const type = activeTab === 'clothing' ? 'item' : 'gamepass';
    const res = await fetch('/api/admin/shop-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type, robloxId: parseInt(robloxId), name: editForm.name || null, price: editForm.price ? parseInt(editForm.price) : null, iconUrl: editForm.iconUrl || null,
      }),
    });
    if (res.ok) {
      setShowCreateForm(false);
      setEditForm({ robloxId: '', name: '', price: '', iconUrl: '', link: '' });
      fetchItems();
    }
  };

  const handleEdit = (item: ShopItem) => {
    setEditingItem(item);
    setEditForm({ robloxId: item.roblox_id.toString(), name: item.name || '', price: item.price?.toString() || '', iconUrl: item.thumbnail_url || '', link: item.link || '' });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const type = activeTab === 'clothing' ? 'item' : 'gamepass';
    const res = await fetch('/api/admin/shop-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingItem.id, type, robloxId: parseInt(editForm.robloxId) || editingItem.roblox_id, name: editForm.name || null, price: editForm.price ? parseInt(editForm.price) : null, iconUrl: editForm.iconUrl || null, link: editForm.link || null,
      }),
    });
    if (res.ok) {
      setEditingItem(null);
      fetchItems();
    }
  };

  const handleSaveLeague = async () => {
    if (!newLeague.name) { alert('Please enter a league name'); return; }
    const res = await fetch('/api/admin/leagues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingLeague?.id, name: newLeague.name, iconUrl: newLeague.iconUrl, joinLink: newLeague.joinLink,
      }),
    });
    if (res.ok) {
      setNewLeague({ name: '', iconUrl: '', joinLink: '' });
      setEditingLeague(null);
      fetchLeagues();
    }
  };

  const handleEditLeague = (league: League) => {
    setEditingLeague(league);
    setNewLeague({ name: league.name, iconUrl: league.icon_url || '', joinLink: league.join_link || '' });
    setShowCreateForm(true);
  };

  const handleDeleteLeague = async (id: number) => {
    if (!confirm('Delete this league and all its teams?')) return;
    await fetch(`/api/admin/leagues?id=${id}`, { method: 'DELETE' });
    fetchLeagues();
  };

  const handleSaveTeam = async () => {
    if (!newTeam.name || !selectedLeague) { alert('Please enter team name'); return; }
    const res = await fetch('/api/admin/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingTeam?.id, leagueId: selectedLeague.id, name: newTeam.name, logoUrl: newTeam.logoUrl }),
    });
    if (res.ok) {
      setNewTeam({ leagueId: 0, name: '', logoUrl: '', teamCount: '1' });
      setEditingTeam(null);
      fetchTeams(selectedLeague.id);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeam({ leagueId: team.league_id, name: team.name, logoUrl: team.logo_url || '', teamCount: '1' });
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm('Delete this team?')) return;
    await fetch(`/api/admin/teams?id=${id}`, { method: 'DELETE' });
    if (selectedLeague) fetchTeams(selectedLeague.id);
  };

  const handleSaveKit = async () => {
    if (!newKit.name || !selectedTeam) { alert('Please enter kit name'); return; }
    let robloxId = newKit.robloxId;
    if (robloxId.includes('roblox.com')) {
      const match = robloxId.match(/\/(\d+)/);
      if (match) robloxId = match[1];
    }
    const res = await fetch('/api/admin/team-kits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingKit?.id, teamId: selectedTeam.id, name: newKit.name, robloxId: robloxId ? parseInt(robloxId) : null, price: newKit.price ? parseInt(newKit.price) : null, thumbnailUrl: newKit.thumbnailUrl, link: newKit.link || `https://www.roblox.com/catalog/${robloxId}`,
      }),
    });
    if (res.ok) {
      setNewKit({ name: '', robloxId: '', price: '', thumbnailUrl: '', link: '' });
      setEditingKit(null);
      fetchTeamKits(selectedTeam.id);
    }
  };

  const handleEditKit = (kit: TeamKit) => {
    setEditingKit(kit);
    setNewKit({ name: kit.name, robloxId: kit.roblox_id?.toString() || '', price: kit.price?.toString() || '', thumbnailUrl: kit.thumbnail_url || '', link: kit.link || '' });
  };

  const handleDeleteKit = async (id: number) => {
    if (!confirm('Delete this kit?')) return;
    await fetch(`/api/admin/team-kits?id=${id}`, { method: 'DELETE' });
    if (selectedTeam) fetchTeamKits(selectedTeam.id);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (res.ok) { setShowLogin(false); setShowAdmin(true); setPassword(''); }
    else { setLoginError('Incorrect password'); }
  };

  const handleDragStart = (e: React.DragEvent, item: ShopItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const currentItems = activeTab === 'clothing' ? clothingItems : activeTab === 'gamepasses' ? gamepassItems : [];
    const itemIndex = currentItems.findIndex(i => i.id === draggedItem.id);
    if (itemIndex === -1) return;

    const newItems = [...currentItems];
    newItems.splice(itemIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    if (activeTab === 'clothing') {
      setClothingItems(newItems);
    } else if (activeTab === 'gamepasses') {
      setGamepassItems(newItems);
    }

    setDraggedItem(null);
    setDragOverIndex(null);
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    const currentItems = activeTab === 'clothing' ? clothingItems : activeTab === 'gamepasses' ? gamepassItems : [];
    const type = activeTab === 'clothing' ? 'item' : 'gamepass';
    
    try {
      const res = await fetch('/api/admin/shop-items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: currentItems.map((item, index) => ({ id: item.id, sort_order: index })),
          type
        })
      });
      if (res.ok) {
        setOrderChanged(false);
        alert('Order saved!');
      }
    } catch (e) {
      console.error('Failed to save order:', e);
    }
  };

  const items = activeTab === 'clothing' ? clothingItems : activeTab === 'gamepasses' ? gamepassItems : [];
  const filteredItems = items.filter(item => !searchQuery || (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredLeagues = leagues.filter(l => !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredTeams = teams.filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredKits = teamKits.filter(k => !searchQuery || k.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-6">ABOUT US</h1>
      <div className="grid grid-cols-2 gap-4">
        {aboutInfo.map((info, index) => (
          <div key={index} onClick={() => setActiveIndex(index)} className={`bg-card-bg rounded-card p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeIndex === index ? 'ring-2 ring-primary' : ''}`}>
            <h3 className="text-white font-bold text-lg mb-2">{info.title}</h3>
            <p className="text-text-muted text-sm">{info.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-card-bg rounded-card p-6 animate-fade-in-up" key={activeIndex}>
        <h3 className="text-white font-bold text-xl mb-3">{aboutInfo[activeIndex].title}</h3>
        <p className="text-text-muted text-sm leading-relaxed">{aboutInfo[activeIndex].description}</p>
      </div>
      <div className="mt-8 text-center">
        <p className="text-text-muted text-sm">Owned by <span onClick={() => setShowLogin(true)} className="text-white font-bold cursor-pointer">Alonso</span></p>
        <p className="text-text-muted text-sm mt-1">Site made by <span className="text-white font-bold">ney</span></p>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
          <div className="bg-card-bg rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleLogin}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-bold text-xl">Admin Login</h2>
                <button type="button" onClick={() => setShowLogin(false)} className="text-text-muted hover:text-white">✕</button>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="w-full bg-app-bg border border-border rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-primary mb-4" />
              {loginError && <p className="text-red-400 text-sm mb-4">{loginError}</p>}
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-black font-bold py-3 rounded-xl hover:opacity-90 transition">Submit</button>
                <button type="button" onClick={() => setShowLogin(false)} className="px-6 py-3 bg-app-bg text-text-muted font-medium rounded-xl hover:bg-border transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdmin && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setShowAdmin(false)}>
          <div className="bg-card-bg rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-white font-bold text-xl">Admin Panel</h2>
              <button onClick={() => setShowAdmin(false)} className="text-text-muted hover:text-white p-2">✕</button>
            </div>

            <div className="flex gap-4 p-6 pt-0 items-center">
              <div className="flex gap-2">
                <button onClick={() => { setActiveTab('clothing'); setSelectedLeague(null); setSelectedTeam(null); setSearchQuery(''); }} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'clothing' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted hover:text-white'}`}>Clothing</button>
                <button onClick={() => { setActiveTab('gamepasses'); setSelectedLeague(null); setSelectedTeam(null); setSearchQuery(''); }} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'gamepasses' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted hover:text-white'}`}>Gamepasses</button>
                <button onClick={() => { setActiveTab('leagues'); setLeagueSubTab('league'); setSelectedLeague(null); setSelectedTeam(null); setSearchQuery(''); }} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'leagues' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted hover:text-white'}`}>Leagues</button>
                <button onClick={() => { setActiveTab('menu'); setSelectedMenuCategory('gfx'); setSearchQuery(''); }} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'menu' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted hover:text-white'}`}>Menu</button>
                <button onClick={() => { setActiveTab('rankings'); setSearchQuery(''); }} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'rankings' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted hover:text-white'}`}>Rankings</button>
              </div>
              <div className="flex-1"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-app-bg border border-border rounded-lg px-3 py-2 text-white text-sm w-48"
                />
              </div>
            </div>

            {activeTab !== 'leagues' && activeTab !== 'menu' && (
              <div className="flex gap-4 px-6 pb-0">
                <button onClick={() => setShowCreateForm(true)} className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:opacity-90 transition">+ Create</button>
              </div>
            )}

            {activeTab === 'leagues' && (
              <div className="flex gap-2 px-6 pb-0 items-center">
                <button onClick={() => { setLeagueSubTab('league'); setSelectedLeague(null); setSelectedTeam(null); setSearchQuery(''); }} className={`px-4 py-2 rounded-lg font-bold text-sm ${leagueSubTab === 'league' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted'}`}>Leagues</button>
                <button onClick={() => { setLeagueSubTab('teams'); setSelectedTeam(null); setSearchQuery(''); }} className={`px-4 py-2 rounded-lg font-bold text-sm ${leagueSubTab === 'teams' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted'}`}>Teams</button>
                <button onClick={() => { setLeagueSubTab('merch'); setSearchQuery(''); }} className={`px-4 py-2 rounded-lg font-bold text-sm ${leagueSubTab === 'merch' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted'}`}>Merch</button>
              </div>
            )}

            {(showCreateForm || editingItem) && activeTab !== 'leagues' && activeTab !== 'menu' && (
              <div className="p-6 pt-4">
                <div className="bg-app-bg rounded-xl p-4 mb-4">
                  <h3 className="text-white font-bold mb-3">{editingItem ? 'Edit Item' : 'Create New'}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Roblox ID" value={editForm.robloxId} onChange={e => setEditForm({...editForm, robloxId: e.target.value})} className="col-span-2 bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                    <input type="text" placeholder="Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                    <input type="text" placeholder="Price (R$)" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                    <input type="text" placeholder="Link" value={editForm.link} onChange={e => setEditForm({...editForm, link: e.target.value})} className="col-span-2 bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                    <input type="text" placeholder="Icon URL" value={editForm.iconUrl} onChange={e => setEditForm({...editForm, iconUrl: e.target.value})} className="col-span-2 bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={editingItem ? handleSaveEdit : handleCreate} className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm">{editingItem ? 'Save' : 'Add'}</button>
                    <button onClick={() => { setShowCreateForm(false); setEditingItem(null); }} className="px-4 py-2 bg-app-bg text-text-muted rounded-lg font-medium text-sm">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leagues' && leagueSubTab === 'league' && (
              <div className="p-6">
                <div className="flex gap-4 mb-4">
                  <button onClick={() => setShowCreateForm(true)} className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:opacity-90 transition">+ Create League</button>
                </div>
                {showCreateForm && (
                  <div className="bg-app-bg rounded-xl p-4 mb-4">
                    <h3 className="text-white font-bold mb-3">{editingLeague ? 'Edit League' : 'Create League'}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="League Name" value={newLeague.name} onChange={e => setNewLeague({...newLeague, name: e.target.value})} className="col-span-2 bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                      <input type="text" placeholder="Icon URL" value={newLeague.iconUrl} onChange={e => setNewLeague({...newLeague, iconUrl: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                      <input type="text" placeholder="Join Link" value={newLeague.joinLink} onChange={e => setNewLeague({...newLeague, joinLink: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={handleSaveLeague} className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm">Save</button>
                      <button onClick={() => { setShowCreateForm(false); setEditingLeague(null); }} className="px-4 py-2 bg-app-bg text-text-muted rounded-lg font-medium text-sm">Cancel</button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-4">
                  {filteredLeagues.map(league => (
                    <div key={league.id} className="bg-app-bg rounded-xl p-4 relative group">
                      <button onClick={() => handleEditLeague(league)} className="absolute top-2 right-10 w-6 h-6 bg-blue-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100">✎</button>
                      <button onClick={() => handleDeleteLeague(league.id)} className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100">✕</button>
                      {league.icon_url ? <img src={league.icon_url} alt={league.name} className="w-16 h-16 object-cover rounded-lg mx-auto mb-2" /> : <div className="w-16 h-16 bg-border rounded-lg mx-auto mb-2" />}
                      <p className="text-white font-bold text-center">{league.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'leagues' && leagueSubTab === 'teams' && (
              <div className="p-6">
                {!selectedLeague ? (
                  <div className="grid grid-cols-4 gap-4">
                    {leagues.map(league => (
                      <div key={league.id} onClick={() => { setSelectedLeague(league); fetchTeams(league.id); }} className="bg-app-bg rounded-xl p-4 cursor-pointer hover:ring-2 ring-primary">
                        {league.icon_url ? <img src={league.icon_url} alt={league.name} className="w-16 h-16 object-cover rounded-lg mx-auto mb-2" /> : <div className="w-16 h-16 bg-border rounded-lg mx-auto mb-2" />}
                        <p className="text-white font-bold text-center">{league.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setSelectedLeague(null)} className="text-primary hover:underline mb-4">← Back to Leagues</button>
                    <h3 className="text-white font-bold mb-4">{selectedLeague.name} - Teams</h3>
                    <div className="flex gap-4 mb-4 flex-wrap">
                      <input type="text" placeholder="Team Name" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} className="bg-app-bg border border-border rounded-lg px-3 py-2 text-white" />
                      <input type="text" placeholder="Logo URL" value={newTeam.logoUrl} onChange={e => setNewTeam({...newTeam, logoUrl: e.target.value})} className="bg-app-bg border border-border rounded-lg px-3 py-2 text-white" />
                      <button onClick={handleSaveTeam} className="px-6 py-2 bg-primary text-black rounded-lg font-bold">{editingTeam ? 'Save' : 'Add'} Team</button>
                      {editingTeam && <button onClick={() => { setEditingTeam(null); setNewTeam({ leagueId: 0, name: '', logoUrl: '', teamCount: '1' }); }} className="px-4 py-2 bg-app-bg text-text-muted rounded-lg font-medium">Cancel</button>}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {filteredTeams.map(team => (
                        <div key={team.id} className="bg-app-bg rounded-xl p-4 relative group">
                          <button onClick={() => handleEditTeam(team)} className="absolute top-2 right-10 w-6 h-6 bg-blue-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100">✎</button>
                          <button onClick={() => handleDeleteTeam(team.id)} className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100">✕</button>
                          {team.logo_url ? <img src={team.logo_url} alt={team.name} className="w-16 h-16 object-cover rounded-lg mx-auto mb-2" /> : <div className="w-16 h-16 bg-border rounded-lg mx-auto mb-2" />}
                          <p className="text-white font-bold text-center">{team.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leagues' && leagueSubTab === 'merch' && (
              <div className="p-6">
                {!selectedLeague ? (
                  <div className="grid grid-cols-4 gap-4">
                    {leagues.map(league => (
                      <div key={league.id} onClick={() => { setSelectedLeague(league); fetchTeams(league.id); setSelectedTeam(null); }} className="bg-app-bg rounded-xl p-4 cursor-pointer hover:ring-2 ring-primary">
                        {league.icon_url ? <img src={league.icon_url} alt={league.name} className="w-16 h-16 object-cover rounded-lg mx-auto mb-2" /> : <div className="w-16 h-16 bg-border rounded-lg mx-auto mb-2" />}
                        <p className="text-white font-bold text-center">{league.name}</p>
                      </div>
                    ))}
                  </div>
                ) : !selectedTeam ? (
                  <div>
                    <button onClick={() => setSelectedLeague(null)} className="text-primary hover:underline mb-4">← Back to Leagues</button>
                    <h3 className="text-white font-bold mb-4">{selectedLeague.name} - Select Team</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {teams.map(team => (
                        <div key={team.id} onClick={() => { setSelectedTeam(team); fetchTeamKits(team.id); }} className="bg-app-bg rounded-xl p-4 cursor-pointer hover:ring-2 ring-primary">
                          {team.logo_url ? <img src={team.logo_url} alt={team.name} className="w-16 h-16 object-cover rounded-lg mx-auto mb-2" /> : <div className="w-16 h-16 bg-border rounded-lg mx-auto mb-2" />}
                          <p className="text-white font-bold text-center">{team.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setSelectedTeam(null)} className="text-primary hover:underline mb-4">← Back to Teams</button>
                    <h3 className="text-white font-bold mb-4">{selectedTeam.name} - Kits</h3>
                    <div className="flex gap-4 mb-4 flex-wrap">
                      <input type="text" placeholder="Kit Name" value={newKit.name} onChange={e => setNewKit({...newKit, name: e.target.value})} className="bg-app-bg border border-border rounded-lg px-3 py-2 text-white" />
                      <input type="text" placeholder="Roblox ID" value={newKit.robloxId} onChange={e => setNewKit({...newKit, robloxId: e.target.value})} className="bg-app-bg border border-border rounded-lg px-3 py-2 text-white" />
                      <input type="text" placeholder="Price" value={newKit.price} onChange={e => setNewKit({...newKit, price: e.target.value})} className="bg-app-bg border border-border rounded-lg px-3 py-2 text-white" />
                      <input type="text" placeholder="Icon URL" value={newKit.thumbnailUrl} onChange={e => setNewKit({...newKit, thumbnailUrl: e.target.value})} className="bg-app-bg border border-border rounded-lg px-3 py-2 text-white" />
                      <button onClick={handleSaveKit} className="px-6 py-2 bg-primary text-black rounded-lg font-bold">{editingKit ? 'Save' : 'Add'} Kit</button>
                      {editingKit && <button onClick={() => { setEditingKit(null); setNewKit({ name: '', robloxId: '', price: '', thumbnailUrl: '', link: '' }); }} className="px-4 py-2 bg-app-bg text-text-muted rounded-lg font-medium">Cancel</button>}
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      {filteredKits.map(kit => (
                        <div key={kit.id} className="bg-app-bg rounded-xl overflow-hidden relative group">
                          <button onClick={() => handleEditKit(kit)} className="absolute top-2 right-10 w-6 h-6 bg-blue-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 z-10">✎</button>
                          <button onClick={() => handleDeleteKit(kit.id)} className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 z-10">✕</button>
                          {kit.thumbnail_url ? <img src={kit.thumbnail_url} alt={kit.name} className="w-full h-24 object-cover" /> : <div className="w-full h-24 bg-border" />}
                          <div className="p-2">
                            <p className="text-white font-bold text-xs truncate">{kit.name}</p>
                            <p className="text-primary font-bold text-sm">{kit.price}R$</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="p-6">
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['gfx', 'shirts', 'logos', 'building', 'ugc', 'assets', 'lessons', 'edits', 'web'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedMenuCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm ${selectedMenuCategory === cat ? 'bg-primary text-black' : 'bg-app-bg text-text-muted'}`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 mb-4">
                  <button onClick={() => { setShowCreateForm(true); setEditingMenuPost(null); setNewMenuPost({ title: '', description: '', imageUrl: '' }); }} className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:opacity-90 transition">+ Create Post</button>
                </div>

                {showCreateForm && (
                  <div className="bg-app-bg rounded-xl p-4 mb-4">
                    <h3 className="text-white font-bold mb-3">{editingMenuPost ? 'Edit Post' : 'Create New Post'}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <input type="text" placeholder="Title" value={newMenuPost.title} onChange={e => setNewMenuPost({...newMenuPost, title: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                      <input type="text" placeholder="Description" value={newMenuPost.description} onChange={e => setNewMenuPost({...newMenuPost, description: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                      <input type="text" placeholder="Image URL" value={newMenuPost.imageUrl} onChange={e => setNewMenuPost({...newMenuPost, imageUrl: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={editingMenuPost ? handleSaveMenuPost : handleCreateMenuPost} className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm">{editingMenuPost ? 'Save' : 'Add'}</button>
                      <button onClick={() => { setShowCreateForm(false); setEditingMenuPost(null); setNewMenuPost({ title: '', description: '', imageUrl: '' }); }} className="px-4 py-2 bg-app-bg text-text-muted rounded-lg font-medium text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-4">
                  {menuPosts.map(post => (
                    <div key={post.id} className="bg-app-bg rounded-xl overflow-hidden relative group">
                      <button onClick={() => handleEditMenuPost(post)} className="absolute top-2 right-10 w-6 h-6 bg-blue-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 z-10">✎</button>
                      <button onClick={() => handleDeleteMenuPost(post.id)} className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 z-10">✕</button>
                      {post.image_url ? <img src={post.image_url} alt={post.title} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-border" />}
                      <div className="p-3">
                        <p className="text-white font-bold text-sm truncate">{post.title}</p>
                        <p className="text-text-muted text-xs truncate">{post.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rankings' && (
              <div className="p-6">
                <div className="flex gap-4 mb-4">
                  <button onClick={() => { setShowCreateForm(true); setEditingRanking(null); setNewRanking({ name: '', username: '', iconUrl: '', thumbnailUrl: '', rank: 'Beginner', category: 'CLOTHING' }); }} className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:opacity-90 transition">+ Add Ranking</button>
                </div>

                {showCreateForm && (
                  <div className="bg-app-bg rounded-xl p-4 mb-4">
                    <h3 className="text-white font-bold mb-3">Add New Ranking</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Name" value={newRanking.name} onChange={e => setNewRanking({...newRanking, name: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                      <input type="text" placeholder="Username" value={newRanking.username} onChange={e => setNewRanking({...newRanking, username: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                      <input type="text" placeholder="Icon URL" value={newRanking.iconUrl} onChange={e => setNewRanking({...newRanking, iconUrl: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                      <input type="text" placeholder="Thumbnail URL" value={newRanking.thumbnailUrl} onChange={e => setNewRanking({...newRanking, thumbnailUrl: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm" />
                      <select value={newRanking.rank} onChange={e => setNewRanking({...newRanking, rank: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm">
                        {RANK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select value={newRanking.category} onChange={e => setNewRanking({...newRanking, category: e.target.value})} className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm">
                        {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={handleCreateRanking} className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm">Add</button>
                      <button onClick={() => { setShowCreateForm(false); setEditingRanking(null); }} className="px-4 py-2 bg-app-bg text-text-muted rounded-lg font-medium text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {rankings.map((item, index) => (
                    <div 
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleRankingDragStart(e, index)}
                      onDragOver={(e) => handleRankingDragOver(e, index)}
                      onDrop={(e) => handleRankingDrop(e, index)}
                      className={`bg-app-bg rounded-xl p-4 flex items-center gap-4 cursor-move ${rankingDragOverIdx === index ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      <div className="w-8 flex items-center justify-center text-text-muted font-bold">{index + 1}</div>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-border">
                        {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover" /> : item.icon_url ? <img src={item.icon_url} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">No img</div>}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold">{item.name}</p>
                        <p className="text-text-muted text-sm">@{item.username}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${item.category !== 'CLOTHING' ? (item.category === 'GFX' ? 'bg-pink-500' : item.category === 'BUILDINGS' ? 'bg-amber-500' : 'bg-blue-500') : 'bg-blue-500'}`}>{item.category}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${item.rank === 'ELT' ? 'bg-red-500' : item.rank === 'PRO' ? 'bg-yellow-500' : item.rank === 'ADV' ? 'bg-purple-500' : item.rank === 'INT' ? 'bg-green-500' : item.rank === 'NOR' ? 'bg-blue-500' : 'bg-gray-500'}`}>{item.rank}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteRanking(item.id)} className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm">✕</button>
                    </div>
                  ))}
                </div>

                {rankingsChanged && (
                  <div className="fixed bottom-6 right-6 z-50">
                    <button onClick={handleSaveRankingsOrder} className="px-6 py-3 bg-primary text-black font-bold rounded-xl shadow-lg hover:opacity-90 transition">
                      Save Order
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab !== 'leagues' && activeTab !== 'menu' && activeTab !== 'rankings' && (
              <div className="flex-1 overflow-auto p-6">
                {loading ? <div className="text-center text-text-muted py-8">Loading...</div> : filteredItems.length === 0 ? <div className="text-center text-text-muted py-8">No items</div> : (
                  <div className="grid grid-cols-4 gap-4">
                    {filteredItems.map((item, index) => (
                      <div 
                        key={item.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`bg-app-bg rounded-xl overflow-hidden hover:ring-2 ring-primary/50 transition group relative cursor-move ${dragOverIndex === index ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        <button className="absolute top-2 left-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10 cursor-grab">☰</button>
                        <button onClick={() => handleEdit(item)} className="absolute top-2 right-12 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">✎</button>
                        <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">✕</button>
                        <div className="aspect-square bg-border flex items-center justify-center">
                          {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover" /> : <div className="text-text-muted">No img</div>}
                        </div>
                        <div className="p-3">
                          <p className="text-white font-bold text-sm truncate">{item.name || 'Unnamed'}</p>
                          <p className="text-primary font-bold text-sm">{item.price ? `${item.price}R$` : 'Free'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {orderChanged && (
                  <div className="fixed bottom-6 right-6 z-50">
                    <button onClick={handleSaveOrder} className="px-6 py-3 bg-primary text-black font-bold rounded-xl shadow-lg hover:opacity-90 transition">
                      Save Order
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
