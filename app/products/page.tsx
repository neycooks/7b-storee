'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ProductModal from '@/components/ProductModal';
import RobloxCheckoutModal from '@/components/RobloxCheckoutModal';
import ErrorModal from '@/components/ErrorModal';

interface RobloxItem {
  id: number;
  name: string;
  description: string;
  price: number | null;
  link: string;
  icon: string;
}

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<RobloxItem | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showError, setShowError] = useState(false);
  const [products, setProducts] = useState<RobloxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
                onClick={() => setSelectedProduct(product)}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-2 bg-card-bg rounded-card hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="text-white" size={20} />
              </button>
              
              <span className="text-white font-medium">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-2 bg-card-bg rounded-card hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronRight className="text-white" size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {selectedProduct && !showCheckout && (
        <ProductModal
          product={{
            id: String(selectedProduct.id),
            title: selectedProduct.name,
            price: selectedProduct.price ? `${selectedProduct.price}R$` : 'Free',
            description: selectedProduct.description || 'No description available',
            badge: 'clothing',
            stock: 1,
            rating: 5,
          }}
          onClose={() => setSelectedProduct(null)}
          onPurchase={() => handlePurchase(selectedProduct.link)}
          onShowCheckout={() => setShowCheckout(true)}
        />
      )}

      {showCheckout && selectedProduct && (
        <RobloxCheckoutModal
          product={{
            title: selectedProduct.name,
            price: selectedProduct.price ? `${selectedProduct.price}R$` : 'Free',
          }}
          onClose={() => setShowCheckout(false)}
          onPurchase={() => handlePurchase(selectedProduct.link)}
        />
      )}

      {showError && (
        <ErrorModal onClose={() => setShowError(false)} />
      )}
    </div>
  );
}
