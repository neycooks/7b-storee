'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, X } from 'lucide-react';

interface MenuPost {
  id: number;
  category: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

const categoryNames: Record<string, string> = {
  gfx: 'GFX',
  shirts: 'Shirts',
  logos: 'Logos',
  building: 'Building',
  ugc: 'UGC',
  assets: 'Assets',
  lessons: 'Lessons',
  edits: 'Edits',
  web: 'Web',
};

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [posts, setPosts] = useState<MenuPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<MenuPost | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/menu/posts?category=${category}`)
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Category Header */}
      <div className="bg-card-bg rounded-2xl p-6 mb-8">
        <h1 className="text-white font-bold text-4xl text-center">{categoryNames[category] || category}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">No posts yet in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-card-bg rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all hover:scale-105"
            >
              <img src={post.image_url} alt={post.title} className="w-full h-40 object-cover" />
              <div className="p-3">
                <h3 className="text-white font-bold text-sm line-clamp-1">{post.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center modal-backdrop animate-fade-in p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-card-bg rounded-lg p-6 max-w-lg w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 text-text-muted hover:text-white">
              <X size={24} />
            </button>
            
            <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-64 object-cover rounded-lg mb-4" />
            <h2 className="text-white font-bold text-2xl mb-2">{selectedPost.title}</h2>
            <p className="text-text-muted text-sm mb-4">{selectedPost.description}</p>
            <p className="text-text-muted text-xs mb-4">Posted: {formatDate(selectedPost.created_at)}</p>
            
            <a
              href={selectedPost.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-primary text-black font-bold text-center rounded-lg hover:opacity-90 transition"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
