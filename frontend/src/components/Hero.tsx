import React from 'react';
import { Sparkles, Coffee } from 'lucide-react';
import type { CustomerProfile } from '../types';

interface HeroProps {
  onSelectPrompt: (prompt: string) => void;
  profile: CustomerProfile;
  onOpenProfile: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectPrompt, profile, onOpenProfile }) => {
  const samplePrompts = [
    "I want something sweet but not too strong",
    "What coffee would you recommend under ₹300?",
    "I like cold drinks with chocolate flavor",
    "What is best for someone who doesn't like coffee?",
    "What pastry goes well with a Caffè Latte?",
    "I'm visiting for the first time. What should I try?"
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-10 mb-8 border border-amber-500/20 bg-gradient-to-br from-[#181412] via-[#120E0C] to-[#0F0C0A]">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Powered by Google ADK & RAG Architecture</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-3 leading-tight">
          What are you in the mood for, <span className="coffee-gradient-text">{profile.name}</span>? ☕️
        </h1>

        <p className="text-stone-300 text-sm sm:text-base mb-6 max-w-2xl leading-relaxed">
          Ask BrewMate AI for personalized coffee, tea, and snack recommendations grounded in our live menu, ingredients, caffeine levels, and dietary preferences.
        </p>

        {/* User Profile Pill */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-stone-300 bg-stone-900/60 p-3 rounded-2xl border border-amber-500/10">
          <span className="font-semibold text-amber-400 flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5" /> Your Profile:
          </span>
          {profile.preferred_temperature !== 'any' && (
            <span className="px-2 py-0.5 rounded-md bg-stone-800 border border-amber-500/20 capitalize">
              {profile.preferred_temperature}
            </span>
          )}
          {profile.caffeine_preference !== 'any' && (
            <span className="px-2 py-0.5 rounded-md bg-stone-800 border border-amber-500/20 capitalize">
              {profile.caffeine_preference} caffeine
            </span>
          )}
          {profile.budget_max && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Under ₹{profile.budget_max}
            </span>
          )}
          {profile.dietary_restrictions.map(d => (
            <span key={d} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {d}
            </span>
          ))}
          <button
            onClick={onOpenProfile}
            className="ml-auto text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
          >
            Edit Profile
          </button>
        </div>

        {/* Prompt Suggestions */}
        <div>
          <p className="text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wider">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(prompt)}
                className="text-xs px-3 py-2 rounded-xl bg-stone-900/80 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/50 text-stone-200 hover:text-amber-200 transition-all text-left"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
