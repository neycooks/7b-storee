'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductModal from '@/components/ProductModal';
import RobloxCheckoutModal from '@/components/RobloxCheckoutModal';
import ErrorModal from '@/components/ErrorModal';
import { RobloxItem } from '@/types/roblox';

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<RobloxItem | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showError, setShowError] = useState(false);
  const [products, setProducts] = useState<RobloxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchProducts = (pageNum: number) => {
    setLoading(true);
    fetch(`/api/items?page=${pageNum}`)
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setProducts(data.items);
          setTotalPages(data.totalPages || 1);
          setHasMore(data.hasMore || false);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePurchase = (productUrl: string) => {
    window.open(productUrl, '_blank');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-full max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Search For Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card-bg border border-border rounded-pill py-3 pl-12 pr-4 text-white placeholder-text-muted focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <p className="text-text-muted text-xs mb-6">
        {loading ? 'Loading...' : `Page ${page} of ${totalPages}`}
      </p>

      <div className="grid grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="product-card flex flex-col justify-between min-h-[240px] relative overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <svg width="150" height="150" viewBox="0 0 100 100" fill="currentColor" className="text-white">
                <path d="M50 5L90 30V70L50 95L10 70V30L50 5Z"/>
              </svg>
            </div>
            
            <div>
              {product.icon && (
                <img src={product.icon} alt="" className="w-12 h-12 rounded mb-2 object-cover" />
              )}
            </div>
            
            <div>
              <h3 className="text-white font-bold text-base mb-1">{product.name}</h3>
              <p className="text-primary font-bold text-sm">{product.price}</p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="p-2 bg-card-bg rounded-card hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="text-white" size={20} />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 rounded-card font-bold text-sm ${
                  pageNum === page 
                    ? 'bg-primary text-black' 
                    : 'bg-card-bg text-white hover:bg-border'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="p-2 bg-card-bg rounded-card hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="text-white" size={20} />
          </button>
        </div>
      )}

      {selectedProduct && !showCheckout && (
        <ProductModal
          product={{
            id: selectedProduct.id,
            title: selectedProduct.name,
            price: selectedProduct.price,
            description: selectedProduct.description,
            badge: 'store',
            stock: 1,
            rating: 5,
          }}
          onClose={() => setSelectedProduct(null)}
          onPurchase={() => handlePurchase(selectedProduct.url)}
          onShowCheckout={() => setShowCheckout(true)}
        />
      )}

      {showCheckout && selectedProduct && (
        <RobloxCheckoutModal
          product={{
            title: selectedProduct.name,
            price: selectedProduct.price,
          }}
          onClose={() => setShowCheckout(false)}
          onPurchase={() => handlePurchase(selectedProduct.url)}
        />
      )}

      {showError && (
        <ErrorModal onClose={() => setShowError(false)} />
      )}
    </div>
  );
}
