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
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'gamepasses'>('items');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newItem, setNewItem] = useState({ robloxId: '', name: '', price: '', iconUrl: '' });

  useEffect(() => {
    if (showAdmin) {
      checkAuth();
    }
  }, [showAdmin]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated, activeTab]);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/me');
    const data = await res.json();
    setIsAuthenticated(data.authenticated);
  };

  const handleLogin = async () => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      setIsAuthenticated(true);
    }
  };

  const fetchItems = async () => {
    const type = activeTab === 'items' ? 'item' : 'gamepass';
    const res = await fetch(`/api/admin/shop-items?type=${type}`);
    const data = await res.json();
    setItems(data.items || []);
    setSelectedIds([]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/admin/shop-items?id=${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedIds.length} item(s)?`)) return;
    for (const id of selectedIds) {
      await fetch(`/api/admin/shop-items?id=${id}`, { method: 'DELETE' });
    }
    fetchItems();
  };

  const handleCreate = async () => {
    let robloxId = newItem.robloxId;
    if (robloxId.includes('roblox.com')) {
      const match = robloxId.match(/\/(\d+)/);
      if (match) robloxId = match[1];
    }
    if (!robloxId || isNaN(parseInt(robloxId))) return;

    await fetch('/api/admin/shop-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: activeTab === 'items' ? 'item' : 'gamepass',
        robloxId: parseInt(robloxId),
        name: newItem.name || null,
        price: newItem.price ? parseInt(newItem.price) : null,
        iconUrl: newItem.iconUrl || null,
      }),
    });
    setShowCreateForm(false);
    setNewItem({ robloxId: '', name: '', price: '', iconUrl: '' });
    fetchItems();
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

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
        <p className="text-text-muted text-sm">Owned by <span onClick={() => setShowAdmin(true)} className="text-white font-bold cursor-pointer">Alonso</span></p>
        <p className="text-text-muted text-sm mt-1">Site made by <span className="text-white font-bold">ney</span></p>
      </div>

      {showAdmin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-auto">
            {!isAuthenticated ? (
              <div className="text-center">
                <h2 className="text-white font-bold text-xl mb-4">Admin Login</h2>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 mb-4"
                />
                <div className="flex gap-2 justify-center">
                  <button onClick={handleLogin} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 active:scale-[0.98] transition">Submit</button>
                  <button onClick={() => setShowAdmin(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 text-neutral-300 text-sm font-medium hover:bg-neutral-700 transition">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-2">
                    <button onClick={() => setActiveTab('items')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'items' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}>Items</button>
                    <button onClick={() => setActiveTab('gamepasses')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'gamepasses' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}>Gamepasses</button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreateForm(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 active:scale-[0.98] transition">Create</button>
                    {selectedIds.length > 0 && (
                      <button onClick={handleDeleteSelected} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition">Delete ({selectedIds.length})</button>
                    )}
                    <button onClick={() => setShowAdmin(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 text-neutral-300 text-sm font-medium hover:bg-neutral-700 transition">Close</button>
                  </div>
                </div>

                {showCreateForm && (
                  <div className="bg-neutral-800 p-4 rounded-xl mb-4">
                    <h3 className="text-white font-bold mb-3">Create New</h3>
                    <input type="text" placeholder="Roblox ID or Link (required)" value={newItem.robloxId} onChange={e => setNewItem({...newItem, robloxId: e.target.value})} className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 mb-2" />
                    <input type="text" placeholder="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 mb-2" />
                    <input type="text" placeholder="Price (R$)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 mb-2" />
                    <input type="text" placeholder="Icon URL (leave blank to auto-fetch)" value={newItem.iconUrl} onChange={e => setNewItem({...newItem, iconUrl: e.target.value})} className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 mb-3" />
                    <div className="flex gap-2">
                      <button onClick={handleCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 active:scale-[0.98] transition">Add</button>
                      <button onClick={() => setShowCreateForm(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-700 text-neutral-300 text-sm font-medium hover:bg-neutral-600 transition">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-neutral-800 p-3 rounded-xl">
                      <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded" />
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center text-neutral-500 text-xs">No img</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate">{item.name || 'Unnamed'}</p>
                        <p className="text-neutral-400 text-sm">{item.price ? `${item.price}R$` : 'Free'}</p>
                      </div>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-sm">Link</a>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
