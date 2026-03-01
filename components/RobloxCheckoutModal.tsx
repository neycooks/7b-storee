'use client';

import { X } from 'lucide-react';

interface RobloxCheckoutModalProps {
  product: {
    title: string;
    price: string;
  };
  onClose: () => void;
  onPurchase: () => void;
}

export default function RobloxCheckoutModal({ product, onClose, onPurchase }: RobloxCheckoutModalProps) {
  const priceNum = parseInt(product.price.replace('R$', '').replace(',', ''));
  
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#1e1e1e] rounded-lg w-full max-w-sm mx-4 overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#2a2a2a] p-4 flex items-center justify-between">
          <h3 className="text-white font-bold">Buy Robux and Item</h3>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#00b06f] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <button onClick={onClose} className="text-text-muted hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-4 p-3 bg-[#252525] rounded-md">
            <div className="w-12 h-12 bg-[#3d3d3d] rounded flex items-center justify-center">
              <span className="text-white text-xs">ITEM</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{product.title}</p>
              <p className="text-white text-sm">{product.price}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-text-muted">Balance after</span>
            <div className="flex items-center gap-2">
              <span className="text-white line-through">5,250</span>
              <span className="text-white">→</span>
              <span className="text-white font-medium">{(5250 - priceNum).toLocaleString()}</span>
              <span className="text-[#00b06f] text-xs">ROBUX</span>
            </div>
          </div>

          <div className="text-right mb-6">
            <span className="text-text-muted text-xs">59.99€</span>
          </div>

          <button 
            onClick={onPurchase}
            className="w-full bg-roblox-blue text-white font-bold py-3 rounded hover:opacity-90 transition-opacity"
          >
            Buy
          </button>

          <p className="text-[#666] text-[10px] mt-3 text-center">
            Your payment method will be charged. Roblox Terms of Use apply.
          </p>
        </div>
      </div>
    </div>
  );
}
