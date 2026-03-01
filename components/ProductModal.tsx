'use client';

import { X, Gift, Star } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  badge: string;
  stock: number;
  rating: number;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onPurchase: () => void;
  onShowCheckout: () => void;
}

export default function ProductModal({ product, onClose, onPurchase, onShowCheckout }: ProductModalProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="bg-card-bg rounded-lg p-8 max-w-md w-full mx-4 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-white font-bold text-[32px] mb-2">{product.title}</h2>
          <p className="text-primary font-bold text-xl mb-4">{product.price}</p>
          
          <p className="text-text-muted text-sm mb-4">{product.description}</p>

          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={20} 
                fill={star <= product.rating ? '#F3B25E' : 'none'}
                stroke={star <= product.rating ? '#F3B25E' : '#A0A0A0'}
              />
            ))}
          </div>

          <p className="text-text-muted text-xs mb-6">1 Review · Stock: {product.stock}</p>

          <div className="flex gap-3">
            <button
              onClick={isOutOfStock ? undefined : onShowCheckout}
              disabled={isOutOfStock}
              className={`flex-1 py-3 px-6 rounded-card font-bold text-base transition-all
                ${isOutOfStock 
                  ? 'bg-stock-disabled text-stock-disabled-text cursor-not-allowed' 
                  : 'bg-primary text-black hover:opacity-90'
                }`}
            >
              {isOutOfStock ? 'Out of stock' : 'Purchase'}
            </button>
            <button className="w-14 h-12 bg-card-bg border border-border rounded-card flex items-center justify-center">
              <Gift size={24} className="text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
