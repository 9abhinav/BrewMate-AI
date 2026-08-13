import React from 'react';
import { X, ShoppingBag, Thermometer, Zap } from 'lucide-react';
import type { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (productName: string, price: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-[#161210] shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 text-stone-400 hover:text-white border border-stone-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {product.category}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2 mb-1">
            {product.name}
          </h2>
          <p className="text-amber-400 font-bold text-xl">₹{product.price}</p>
        </div>

        {/* Description */}
        <p className="text-stone-300 text-sm leading-relaxed mb-6">
          {product.description}
        </p>

        {/* Product Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-400 block mb-1">Temperature</span>
            <span className="text-stone-200 font-semibold flex items-center gap-1 capitalize">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> {product.temperature}
            </span>
          </div>

          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-400 block mb-1">Caffeine Level</span>
            <span className="text-stone-200 font-semibold flex items-center gap-1 capitalize">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> {product.caffeine_level}
            </span>
          </div>

          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-400 block mb-1">Calories</span>
            <span className="text-stone-200 font-semibold">{product.calories} kcal</span>
          </div>

          <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-400 block mb-1">Availability</span>
            <span className={`font-semibold ${product.availability ? 'text-emerald-400' : 'text-rose-400'}`}>
              {product.availability ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Ingredients & Flavors */}
        <div className="space-y-3 mb-6 text-xs">
          <div>
            <span className="text-stone-400 font-semibold block mb-1">Ingredients:</span>
            <div className="flex flex-wrap gap-1.5">
              {product.ingredients.map((ing, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-stone-300">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-stone-400 font-semibold block mb-1">Flavor Profile:</span>
            <div className="flex flex-wrap gap-1.5">
              {product.flavor_profile.map((flv, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 capitalize">
                  {flv}
                </span>
              ))}
            </div>
          </div>

          {product.dietary_info.length > 0 && (
            <div>
              <span className="text-stone-400 font-semibold block mb-1">Dietary Badges:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.dietary_info.map((d, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <button
          onClick={() => {
            onAddToCart(product.name, product.price);
            onClose();
          }}
          className="w-full coffee-gold-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Order (₹{product.price})
        </button>

      </div>
    </div>
  );
};
