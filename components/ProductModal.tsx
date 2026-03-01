'use client';

import { X } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  badge: string;
  stock: number;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onPurchase: () => void;
}

export default function ProductModal({ product, onClose, onPurchase }: ProductModalProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="bg-card-bg rounded-lg p-8 max-w-md w-full mx-4 animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-white font-bold text-[32px] mb-2">{product.title}</h2>
          <p className="text-primary font-bold text-xl mb-6">{product.price}</p>
          
          <button
            onClick={isOutOfStock ? undefined : onPurchase}
            disabled={isOutOfStock}
            className={`w-full py-3 px-6 rounded-card font-bold text-base transition-all
              ${isOutOfStock 
                ? 'bg-stock-disabled text-stock-disabled-text cursor-not-allowed' 
                : 'bg-primary text-black hover:opacity-90 hover:scale-105'
              }`}
          >
            {isOutOfStock ? 'Out of stock' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
