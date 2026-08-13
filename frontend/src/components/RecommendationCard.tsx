import React from 'react';
import { Sparkles, ShoppingBag, ArrowRight, CheckCircle2, Thermometer, Zap } from 'lucide-react';
import type { RecommendationOutput } from '../types';

interface RecommendationCardProps {
  recommendation: RecommendationOutput;
  onAddToCart: (productName: string, price: number) => void;
  onCalculateOrder: (productName: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAddToCart,
  onCalculateOrder
}) => {
  return (
    <div className="mt-4 rounded-2xl glass-panel p-5 border border-amber-500/30 bg-gradient-to-br from-[#1C1714] to-[#14100E] shadow-xl shadow-black/40">
      
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-amber-500/15">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Top AI Recommendation</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/30">
          ₹{recommendation.price}
        </div>
      </div>

      {/* Recommended Item Name & Metadata Tags */}
      <div className="mb-3">
        <h3 className="text-xl font-serif font-bold text-white mb-2">
          {recommendation.recommendation}
        </h3>
        
        <div className="flex flex-wrap gap-2 text-xs">
          {recommendation.category && (
            <span className="px-2.5 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
              {recommendation.category}
            </span>
          )}
          {recommendation.temperature && (
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/50 flex items-center gap-1 capitalize">
              <Thermometer className="w-3 h-3" /> {recommendation.temperature}
            </span>
          )}
          {recommendation.caffeine_level && (
            <span className="px-2.5 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/50 flex items-center gap-1 capitalize">
              <Zap className="w-3 h-3" /> {recommendation.caffeine_level} caffeine
            </span>
          )}
        </div>
      </div>

      {/* Rationale Explanation */}
      <div className="mb-4 bg-stone-900/60 p-3.5 rounded-xl border border-amber-500/10">
        <p className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Why it fits your taste:
        </p>
        <p className="text-xs text-stone-300 leading-relaxed">
          {recommendation.reason}
        </p>
      </div>

      {/* Alternatives & Pairings */}
      {(recommendation.alternatives.length > 0 || recommendation.pairings.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
          {recommendation.alternatives.length > 0 && (
            <div className="bg-stone-900/40 p-2.5 rounded-lg border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">You might also like:</span>
              <ul className="text-stone-300 space-y-0.5">
                {recommendation.alternatives.map((alt, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="text-amber-500">•</span> {alt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.pairings.length > 0 && (
            <div className="bg-stone-900/40 p-2.5 rounded-lg border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">🥐 Best Food Pairing:</span>
              <ul className="text-amber-200 font-medium space-y-0.5">
                {recommendation.pairings.map((pair, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span>✨</span> {pair}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800">
        <button
          onClick={() => onAddToCart(recommendation.recommendation, recommendation.price)}
          className="flex-1 coffee-gold-btn px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Order (₹{recommendation.price})
        </button>

        <button
          onClick={() => onCalculateOrder(recommendation.recommendation)}
          className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-all flex items-center gap-1"
        >
          Calculate Cost <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
