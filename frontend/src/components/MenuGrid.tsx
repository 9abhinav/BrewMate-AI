import React, { useState, useMemo } from 'react';
import { Search, Coffee, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import type { Product } from '../types';
import { ProductModal } from './ProductModal';

interface MenuGridProps {
  products: Product[];
  onAddToCart: (productName: string, price: number) => void;
  onAskAgentAboutProduct: (productName: string) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  products,
  onAddToCart,
  onAskAgentAboutProduct
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(400);
  const [selectedDietary, setSelectedDietary] = useState<string>('None');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = [
    'All', 'Espresso', 'Americano', 'Cappuccino', 'Latte', 'Mocha',
    'Cold Brew', 'Iced Latte', 'Frappuccino-style drinks', 'Tea',
    'Hot Chocolate', 'Pastries', 'Sandwiches', 'Snacks'
  ];

  const dietaryOptions = ['None', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && !p.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const textMatch = p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.flavor_profile.some(f => f.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query);
        if (!textMatch) return false;
      }
      // Price filter
      if (p.price > maxPrice) return false;
      // Dietary filter
      if (selectedDietary !== 'None') {
        const dList = p.dietary_info.map(d => d.toLowerCase());
        if (!dList.includes(selectedDietary.toLowerCase())) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery, maxPrice, selectedDietary]);

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/20 space-y-4">
        
        {/* Search & Sliders Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          
          {/* Search Bar */}
          <div className="flex-1 flex items-center gap-2 bg-stone-900/90 px-3.5 py-2.5 rounded-2xl border border-amber-500/20 focus-within:border-amber-500/50">
            <Search className="w-4 h-4 text-amber-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, flavors, ingredients..."
              className="bg-transparent text-sm text-stone-100 placeholder-stone-500 focus:outline-none w-full"
            />
          </div>

          {/* Price Range Slider */}
          <div className="flex items-center gap-3 bg-stone-900/90 px-4 py-2 rounded-2xl border border-amber-500/20">
            <span className="text-xs font-semibold text-stone-400">Max Price:</span>
            <input
              type="range"
              min="100"
              max="400"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-amber-500 cursor-pointer w-28"
            />
            <span className="text-xs font-bold text-amber-300 w-12">₹{maxPrice}</span>
          </div>

          {/* Dietary Selection */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-stone-400 whitespace-nowrap">Dietary:</span>
            {dietaryOptions.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDietary(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                  selectedDietary === d
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

        </div>

        {/* Category Tabs Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 border-t border-stone-800/60 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:text-white hover:bg-amber-500/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Product Count Label */}
      <div className="flex items-center justify-between px-2 text-xs text-stone-400 font-mono">
        <span>Showing {filteredProducts.length} of {products.length} menu items</span>
        {(selectedCategory !== 'All' || searchQuery || maxPrice < 400 || selectedDietary !== 'None') && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setMaxPrice(400);
              setSelectedDietary('None');
            }}
            className="text-amber-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-amber-500/20">
          <Coffee className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-white mb-1">No matching menu items</h3>
          <p className="text-stone-400 text-xs mb-4">Try adjusting your category, price range, or dietary filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-amber-500/15 flex flex-col justify-between transition-all group hover:-translate-y-1 bg-gradient-to-b from-[#181412] to-[#120E0C]"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    {product.category}
                  </span>
                  <span className="text-sm font-bold text-amber-400">
                    ₹{product.price}
                  </span>
                </div>

                {/* Name & Description */}
                <h3 className="font-serif font-bold text-lg text-white group-hover:text-amber-300 transition-colors mb-1">
                  {product.name}
                </h3>
                <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed mb-3">
                  {product.description}
                </p>

                {/* Flavor Badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.flavor_profile.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-stone-300 capitalize">
                      {f}
                    </span>
                  ))}
                  {product.dietary_info.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300">
                      {product.dietary_info[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 pt-3 border-t border-stone-800/80">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-amber-500/40 transition-all text-xs"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onAskAgentAboutProduct(product.name)}
                  className="px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-medium transition-all flex items-center gap-1"
                  title="Ask AI Assistant about this item"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ask AI
                </button>

                <button
                  onClick={() => onAddToCart(product.name, product.price)}
                  className="flex-1 coffee-gold-btn py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Add
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={onAddToCart}
      />

    </div>
  );
};
