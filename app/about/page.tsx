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

export default function About() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'clothing' | 'gamepasses'>('clothing');
  const [clothingItems, setClothingItems] = useState<ShopItem[]>([]);
  const [gamepassItems, setGamepassItems] = useState<ShopItem[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newItem, setNewItem] = useState({ robloxId: '', name: '', price: '', iconUrl: '' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (showLogin || showAdmin)) {
      checkAuth();
    }
  }, [mounted, showLogin, showAdmin]);

  useEffect(() => {
    if (isAuthenticated && showAdmin) {
      fetchItems();
    }
  }, [isAuthenticated, showAdmin]);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/me');
    const data = await res.json();
    setIsAuthenticated(data.authenticated);
  };

  const handleLogin = async () => {
    setLoginError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      setShowLogin(false);
      setShowAdmin(true);
      setIsAuthenticated(true);
    } else {
      setLoginError('Incorrect password');
    }
  };

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

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item? This will remove it from the shop.')) return;
    
    const res = await fetch(`/api/admin/shop-items?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setClothingItems(prev => prev.filter(item => item.id !== id));
      setGamepassItems(prev => prev.filter(item => item.id !== id));
    } else {
      alert('Failed to delete item');
    }
  };

  const handleCreate = async () => {
    let robloxId = newItem.robloxId;
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
        type,
        robloxId: parseInt(robloxId),
        name: newItem.name || null,
        price: newItem.price ? parseInt(newItem.price) : null,
        iconUrl: newItem.iconUrl || null,
      }),
    });

    if (res.ok) {
      setShowCreateForm(false);
      setNewItem({ robloxId: '', name: '', price: '', iconUrl: '' });
      await fetchItems();
    } else {
      alert('Failed to create item');
    }
  };

  const items = activeTab === 'clothing' ? clothingItems : gamepassItems;

  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-6">ABOUT US</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {aboutInfo.map((info, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`bg-card-bg rounded-card p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              activeIndex === index ? 'ring-2 ring-primary' : ''
            }`}
          >
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
        <p className="text-text-muted text-sm">Owned by <span onClick={() => { setShowLogin(true); }} className="text-white font-bold cursor-pointer">Alonso</span></p>
        <p className="text-text-muted text-sm mt-1">Site made by <span className="text-white font-bold">ney</span></p>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
          <div className="bg-card-bg rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-bold text-xl">Admin Login</h2>
                <button type="button" onClick={() => setShowLogin(false)} className="text-text-muted hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-app-bg border border-border rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-primary mb-4"
              />
              {loginError && <p className="text-red-400 text-sm mb-4">{loginError}</p>}
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-black font-bold py-3 rounded-xl hover:opacity-90 transition">Submit</button>
                <button type="button" onClick={() => setShowLogin(false)} className="px-6 py-3 bg-app-bg text-text-muted font-medium rounded-xl hover:bg-border transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdmin && isAuthenticated && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setShowAdmin(false)}>
          <div className="bg-card-bg rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-white font-bold text-xl">Admin Panel</h2>
              <button onClick={() => setShowAdmin(false)} className="text-text-muted hover:text-white p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 p-6 pb-0">
              <button
                onClick={() => setActiveTab('clothing')}
                className={`px-6 py-3 rounded-xl font-bold transition ${
                  activeTab === 'clothing' 
                    ? 'bg-primary text-black' 
                    : 'bg-app-bg text-text-muted hover:text-white'
                }`}
              >
                Clothing
              </button>
              <button
                onClick={() => setActiveTab('gamepasses')}
                className={`px-6 py-3 rounded-xl font-bold transition ${
                  activeTab === 'gamepasses' 
                    ? 'bg-primary text-black' 
                    : 'bg-app-bg text-text-muted hover:text-white'
                }`}
              >
                Gamepasses
              </button>
              <div className="flex-1"></div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:opacity-90 transition"
              >
                + Create
              </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <div className="p-6 pb-0">
                <div className="bg-app-bg rounded-xl p-4 mb-4">
                  <h3 className="text-white font-bold mb-3">Create New {activeTab === 'clothing' ? 'Clothing' : 'Gamepass'}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Roblox ID or Link (required)"
                      value={newItem.robloxId}
                      onChange={e => setNewItem({...newItem, robloxId: e.target.value})}
                      className="col-span-2 bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Name"
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Price (R$)"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                      className="bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Icon URL (optional)"
                      value={newItem.iconUrl}
                      onChange={e => setNewItem({...newItem, iconUrl: e.target.value})}
                      className="col-span-2 bg-card-bg border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleCreate} className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm hover:opacity-90 transition">Add</button>
                    <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-app-bg text-text-muted rounded-lg font-medium text-sm hover:text-white transition">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Items Grid */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="text-center text-text-muted py-8">Loading...</div>
              ) : items.length === 0 ? (
                <div className="text-center text-text-muted py-8">No {activeTab} found</div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {items.map(item => (
                    <div key={item.id} className="bg-app-bg rounded-xl overflow-hidden hover:ring-2 hover:ring-primary/50 transition group relative">
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                      
                      {/* Thumbnail */}
                      <div className="aspect-square bg-border flex items-center justify-center">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-3">
                        <p className="text-white font-bold text-sm truncate">{item.name || 'Unnamed'}</p>
                        <p className="text-primary font-bold text-sm">{item.price ? `${item.price}R$` : 'Free'}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${item.type === 'gamepass' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                          {item.type === 'gamepass' ? 'Gamepass' : 'Clothing'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
