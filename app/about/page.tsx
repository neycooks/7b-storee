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
  const [newItem, setNewItem] = useState({ robloxId: '', name: '', price: '' });

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

  const handleDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} item(s)?`)) return;
    for (const id of selectedIds) {
      await fetch(`/api/admin/shop-items?id=${id}`, { method: 'DELETE' });
    }
    fetchItems();
  };

  const handleCreate = async () => {
    await fetch('/api/admin/shop-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: activeTab === 'items' ? 'item' : 'gamepass',
        robloxId: parseInt(newItem.robloxId),
        name: newItem.name || null,
        price: newItem.price ? parseInt(newItem.price) : null,
      }),
    });
    setShowCreateForm(false);
    setNewItem({ robloxId: '', name: '', price: '' });
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
        <p className="text-text-muted text-sm">Owned by <span onClick={() => setShowAdmin(true)} className="text-white font-bold cursor-pointer hover:text-primary">Alonso</span></p>
        <p className="text-text-muted text-sm mt-1">Site made by <span className="text-white font-bold">ney</span></p>
      </div>

      {showAdmin && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-card-bg rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
            {!isAuthenticated ? (
              <div className="text-center">
                <h2 className="text-white font-bold text-xl mb-4">Admin Login</h2>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-app-bg border border-border rounded p-2 text-white w-full mb-4"
                />
                <button onClick={handleLogin} className="bg-primary text-black px-4 py-2 rounded font-bold">Submit</button>
                <button onClick={() => setShowAdmin(false)} className="ml-2 text-text-muted">Cancel</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <button onClick={() => setActiveTab('items')} className={`px-4 py-2 rounded ${activeTab === 'items' ? 'bg-primary text-black' : 'bg-app-bg text-white'}`}>Items</button>
                    <button onClick={() => setActiveTab('gamepasses')} className={`px-4 py-2 rounded ${activeTab === 'gamepasses' ? 'bg-primary text-black' : 'bg-app-bg text-white'}`}>Gamepasses</button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreateForm(true)} className="bg-primary text-black px-4 py-2 rounded font-bold">Create</button>
                    {selectedIds.length > 0 && (
                      <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded font-bold">Delete ({selectedIds.length})</button>
                    )}
                    <button onClick={() => setShowAdmin(false)} className="text-text-muted px-4 py-2">Close</button>
                  </div>
                </div>

                {showCreateForm && (
                  <div className="bg-app-bg p-4 rounded mb-4">
                    <h3 className="text-white font-bold mb-2">Create New</h3>
                    <input type="text" placeholder="Roblox ID" value={newItem.robloxId} onChange={e => setNewItem({...newItem, robloxId: e.target.value})} className="bg-card-bg border border-border rounded p-2 text-white w-full mb-2" />
                    <input type="text" placeholder="Name (optional)" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="bg-card-bg border border-border rounded p-2 text-white w-full mb-2" />
                    <input type="text" placeholder="Price (optional)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="bg-card-bg border border-border rounded p-2 text-white w-full mb-2" />
                    <div className="flex gap-2">
                      <button onClick={handleCreate} className="bg-primary text-black px-4 py-2 rounded font-bold">Add</button>
                      <button onClick={() => setShowCreateForm(false)} className="text-text-muted px-4 py-2">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-app-bg p-3 rounded">
                      <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                      {item.thumbnail_url && <img src={item.thumbnail_url} alt={item.name} className="w-10 h-10 object-cover rounded" />}
                      <div className="flex-1">
                        <p className="text-white font-bold">{item.name}</p>
                        <p className="text-text-muted text-sm">{item.price ? `${item.price}R$` : 'Free'}</p>
                      </div>
                      <a href={item.link || `#`} target="_blank" rel="noopener noreferrer" className="text-primary text-sm">Link</a>
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
