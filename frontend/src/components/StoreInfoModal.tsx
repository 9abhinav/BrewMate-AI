import React from 'react';
import { X, Store, Clock, MapPin, Phone, Mail, Award, HelpCircle } from 'lucide-react';
import type { StoreInfo } from '../types';

interface StoreInfoModalProps {
  storeInfo: StoreInfo | null;
  onClose: () => void;
}

export const StoreInfoModal: React.FC<StoreInfoModalProps> = ({ storeInfo, onClose }) => {
  if (!storeInfo) return null;

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
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              {storeInfo.store_name}
            </h2>
            <p className="text-xs text-amber-400 font-medium">{storeInfo.tagline}</p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-stone-300">
          
          {/* Location & Contact */}
          <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 text-amber-300">
              <MapPin className="w-4 h-4" /> Location & Landmark
            </h3>
            <p className="leading-relaxed">
              {storeInfo.location.address}, {storeInfo.location.city}, {storeInfo.location.state} - {storeInfo.location.pincode}
            </p>
            <p className="text-stone-400 text-[11px]">Landmark: {storeInfo.location.landmark}</p>
            
            <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-stone-300">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-amber-400" /> {storeInfo.contact.phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-amber-400" /> {storeInfo.contact.email}</span>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5 text-amber-300">
              <Clock className="w-4 h-4" /> Opening Hours
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {Object.entries(storeInfo.hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between p-2 rounded-xl bg-stone-950/60 border border-stone-800">
                  <span className="font-semibold text-stone-200">{day}</span>
                  <span className="text-amber-400">{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loyalty Program */}
          <div className="bg-gradient-to-r from-amber-950/40 to-stone-900 p-4 rounded-2xl border border-amber-500/20">
            <h3 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5 text-amber-400">
              <Award className="w-4 h-4" /> {storeInfo.loyalty_program.name} Rewards
            </h3>
            <p className="mb-1 leading-relaxed">{storeInfo.loyalty_program.earning_rate}</p>
            <p className="text-amber-300 font-semibold mb-1">{storeInfo.loyalty_program.redemption}</p>
            <p className="text-stone-400 text-[11px]">{storeInfo.loyalty_program.perks}</p>
          </div>

          {/* FAQs */}
          <div>
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5 text-amber-300">
              <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
            </h3>
            <div className="space-y-2.5">
              {storeInfo.faq.map((faq, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                  <h4 className="font-semibold text-white">Q: {faq.question}</h4>
                  <p className="text-stone-300 text-[11px] leading-relaxed">A: {faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
