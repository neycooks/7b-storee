'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import ProductModal from '@/components/ProductModal';
import RobloxCheckoutModal from '@/components/RobloxCheckoutModal';
import ErrorModal from '@/components/ErrorModal';

interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  badge: string;
  stock: number;
  rating: number;
}

const products: Product[] = [
  { id: '1', title: 'Bail (400R$)', price: '400R$', description: 'Bail option for temporary release', badge: 'other', stock: 10, rating: 5 },
  { id: '2', title: 'Supercup VIP Seating Allocation', price: '500R$', description: 'Premium VIP seating for all matches', badge: 'hospitality', stock: 5, rating: 4 },
  { id: '3', title: 'Season 9 BFL Cup VIP Tickets', price: '100R$', description: 'Season 9 BFL Cup Final VIP Tickets', badge: 'hospitality', stock: 0, rating: 1 },
  { id: '4', title: 'Bail (3000R$)', price: '3,000R$', description: 'Premium bail option', badge: 'other', stock: 3, rating: 5 },
  { id: '5', title: 'Match Day Premium Pass', price: '250R$', description: 'Access to all premium match features', badge: 'hospitality', stock: 20, rating: 4 },
  { id: '6', title: 'Training Facility Access', price: '150R$', description: 'Exclusive training facility access', badge: 'other', stock: 15, rating: 3 },
  { id: '7', title: 'Team Jersey Bundle', price: '350R$', description: 'Complete team jersey collection', badge: 'merchandise', stock: 8, rating: 5 },
  { id: '8', title: 'Stadium Tour', price: '75R$', description: 'Behind the scenes stadium tour', badge: 'other', stock: 25, rating: 4 },
  { id: '9', title: 'Player Contract Premium', price: '1,200R$', description: 'Premium player contract benefits', badge: 'other', stock: 2, rating: 5 },
  { id: '10', title: 'Championship Trophy Display', price: '800R$', description: 'Virtual trophy display for your profile', badge: 'merchandise', stock: 6, rating: 4 },
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showError, setShowError] = useState(false);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePurchase = () => {
    setShowCheckout(false);
    setShowError(true);
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

      <p className="text-text-muted text-xs mb-6">Showing {filteredProducts.length} out of {products.length} results</p>

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
              <span className="bg-black text-text-muted text-[10px] px-2 py-1 rounded-sm inline-block">
                {product.badge}
              </span>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-base mb-1">{product.title}</h3>
              <p className="text-primary font-bold text-sm">{product.price}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && !showCheckout && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onPurchase={() => {}}
          onShowCheckout={() => setShowCheckout(true)}
        />
      )}

      {showCheckout && selectedProduct && (
        <RobloxCheckoutModal
          product={selectedProduct}
          onClose={() => setShowCheckout(false)}
          onPurchase={handlePurchase}
        />
      )}

      {showError && (
        <ErrorModal onClose={() => setShowError(false)} />
      )}
    </div>
  );
}
