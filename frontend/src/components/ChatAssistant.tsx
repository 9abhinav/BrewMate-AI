import React, { useState, useRef, useEffect } from 'react';
import { Send, Coffee, Sparkles, User, Loader2, RefreshCw } from 'lucide-react';
import type { ChatMessage, CustomerProfile } from '../types';
import { RecommendationCard } from './RecommendationCard';

interface ChatAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  profile: CustomerProfile;
  onAddToCart: (productName: string, price: number) => void;
  onCalculateOrder: (productName: string) => void;
  onResetChat: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  messages,
  onSendMessage,
  isLoading,
  profile,
  onAddToCart,
  onCalculateOrder,
  onResetChat
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[680px] glass-panel rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl">
      
      {/* Chat Header Bar */}
      <div className="px-6 py-4 bg-stone-900/90 border-b border-amber-500/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-900" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-white flex items-center gap-2">
              BrewMate Assistant
            </h2>
            <p className="text-xs text-stone-400">Online • Ready to recommend coffee & pairings</p>
          </div>
        </div>

        <button
          onClick={onResetChat}
          className="p-2 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all text-xs flex items-center gap-1.5 border border-transparent hover:border-amber-500/20"
          title="Clear Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-b from-[#120E0C] to-[#0F0C0A]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-800 border border-amber-500/30 text-amber-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
            </div>

            {/* Message Bubble Content */}
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[88%]`}>
              
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-medium rounded-tr-none shadow-lg shadow-amber-600/10'
                  : 'bg-stone-900/90 border border-amber-500/15 text-stone-200 rounded-tl-none shadow-md'
              }`}>
                {/* Formatted Markdown-like text */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text}
                </div>

                {/* Render Embedded Recommendation Card if Present */}
                {msg.recommendation && (
                  <RecommendationCard
                    recommendation={msg.recommendation}
                    onAddToCart={onAddToCart}
                    onCalculateOrder={onCalculateOrder}
                  />
                )}
              </div>

              {/* Action Pills */}
              {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {msg.suggested_actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(act)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-stone-900/80 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 hover:text-amber-200 transition-all"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp & Latency */}
              <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-stone-500 font-mono">
                <span>{msg.timestamp}</span>
                {msg.latency_ms && (
                  <span>• {msg.latency_ms} ms</span>
                )}
              </div>

            </div>
          </div>
        ))}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-stone-800 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-amber-500/15 text-stone-300 text-xs flex items-center gap-2 rounded-tl-none">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>BrewMate AI is analyzing preferences & retrieving menu items...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-stone-900/95 border-t border-amber-500/15">
        <div className="flex items-center gap-2 bg-[#0F0C0A] p-2 rounded-2xl border border-amber-500/20 focus-within:border-amber-500/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask BrewMate AI, ${profile.name}... (e.g. "Cold chocolate drink under ₹300")`}
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="coffee-gold-btn p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-stone-950" />
          </button>
        </div>
      </form>

    </div>
  );
};
