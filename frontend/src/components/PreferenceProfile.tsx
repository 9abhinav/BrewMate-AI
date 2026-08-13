import React, { useState } from 'react';
import { X, User, DollarSign, Thermometer, Zap, Shield, Save, Check } from 'lucide-react';
import type { CustomerProfile } from '../types';

interface PreferenceProfileProps {
  profile: CustomerProfile;
  onSaveProfile: (newProfile: CustomerProfile) => void;
  onClose: () => void;
}

export const PreferenceProfile: React.FC<PreferenceProfileProps> = ({
  profile,
  onSaveProfile,
  onClose
}) => {
  const [name, setName] = useState(profile.name);
  const [flavors, setFlavors] = useState<string[]>(profile.favorite_flavors);
  const [temperature, setTemperature] = useState<'hot' | 'iced' | 'warm' | 'any'>(profile.preferred_temperature);
  const [caffeine, setCaffeine] = useState<'none' | 'low' | 'medium' | 'high' | 'any'>(profile.caffeine_preference);
  const [dietary, setDietary] = useState<string[]>(profile.dietary_restrictions);
  const [budget, setBudget] = useState<number | null>(profile.budget_max);

  const flavorOptions = ['sweet', 'chocolate', 'bold', 'creamy', 'fruity', 'nutty', 'roasted', 'spiced'];
  const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];

  const toggleFlavor = (flv: string) => {
    setFlavors(prev =>
      prev.includes(flv) ? prev.filter(f => f !== flv) : [...prev, flv]
    );
  };

  const toggleDietary = (d: string) => {
    setDietary(prev =>
      prev.includes(d) ? prev.filter(item => item !== d) : [...prev, d]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name,
      favorite_flavors: flavors,
      preferred_temperature: temperature,
      caffeine_preference: caffeine,
      dietary_restrictions: dietary,
      budget_max: budget
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-[#161210] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 text-stone-400 hover:text-white border border-stone-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              Customer Recommendation Profile
            </h2>
            <p className="text-xs text-stone-400">BrewMate AI uses this to personalize every response</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Customer Name */}
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-900 border border-amber-500/20 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none"
              placeholder="e.g. Abhinav"
            />
          </div>

          {/* Temperature Preference */}
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> Temperature Preference
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['any', 'iced', 'hot', 'warm'] as const).map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTemperature(t)}
                  className={`py-2 rounded-xl font-semibold capitalize border transition-all ${
                    temperature === t
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Caffeine Preference */}
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Caffeine Level
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['any', 'none', 'low', 'medium', 'high'] as const).map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCaffeine(c)}
                  className={`py-2 rounded-xl font-semibold capitalize border transition-all text-[11px] ${
                    caffeine === c
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Limit */}
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Maximum Budget (₹)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[null, 200, 300, 400].map((b, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setBudget(b)}
                  className={`py-2 rounded-xl font-semibold border transition-all ${
                    budget === b
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  {b === null ? 'Any Price' : `Under ₹${b}`}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Flavors */}
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5">Favorite Flavor Profiles</label>
            <div className="flex flex-wrap gap-2">
              {flavorOptions.map(flv => {
                const active = flavors.includes(flv);
                return (
                  <button
                    type="button"
                    key={flv}
                    onClick={() => toggleFlavor(flv)}
                    className={`px-3 py-1.5 rounded-xl capitalize font-medium border transition-all ${
                      active
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 inline mr-1" />}
                    {flv}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Dietary Restrictions
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(d => {
                const active = dietary.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDietary(d)}
                    className={`px-3 py-1.5 rounded-xl font-medium border transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 inline mr-1" />}
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-800">
            <button
              type="submit"
              className="w-full coffee-gold-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Preferences Profile
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
