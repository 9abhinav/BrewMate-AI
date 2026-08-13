import React from 'react';
import { Coffee, User, ShoppingBag, Terminal, Info } from 'lucide-react';
import type { CustomerProfile } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'menu';
  setActiveTab: (tab: 'chat' | 'menu') => void;
  onOpenProfile: () => void;
  onOpenCart: () => void;
  onOpenStoreInfo: () => void;
  onToggleObservability: () => void;
  cartCount: number;
  profile: CustomerProfile;
  showTrace: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenCart,
  onOpenStoreInfo,
  onToggleObservability,
  cartCount,
  profile,
  showTrace
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-amber-500/20 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('chat')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
            <div className="w-full h-full bg-[#0F0C0A] rounded-[10px] flex items-center justify-center">
              <Coffee className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl tracking-tight text-white">BrewMate</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">AI Agent</span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium tracking-wide">Personalized Coffee Assistant</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#181412]/80 p-1 rounded-xl border border-amber-500/10">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-stone-300 hover:text-white hover:bg-amber-500/10'
            }`}
          >
            ☕️ AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'menu'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-stone-300 hover:text-white hover:bg-amber-500/10'
            }`}
          >
            📋 Explore Menu
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* Store Info Modal Button */}
          <button
            onClick={onOpenStoreInfo}
            className="p-2 rounded-xl bg-stone-900/80 border border-amber-500/20 text-stone-300 hover:text-white hover:border-amber-500/50 transition-all"
            title="Store Info & Hours"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Dev Observability Trace Toggle */}
          <button
            onClick={onToggleObservability}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              showTrace
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-stone-900/80 border-amber-500/20 text-stone-400 hover:text-stone-200'
            }`}
            title="Toggle Agent Observability Trace"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">⚡ Dev Trace</span>
          </button>

          {/* Customer Profile Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-amber-500/20 text-stone-200 hover:border-amber-500/50 transition-all"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline text-xs font-medium text-amber-200">{profile.name}</span>
          </button>

          {/* Cart / Order Calculator Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
            title="View Order Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
