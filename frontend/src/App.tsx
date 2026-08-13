import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ChatAssistant } from './components/ChatAssistant';
import { MenuGrid } from './components/MenuGrid';
import { PreferenceProfile } from './components/PreferenceProfile';
import { OrderCalculatorModal } from './components/OrderCalculatorModal';
import { ObservabilityDrawer } from './components/ObservabilityDrawer';
import { StoreInfoModal } from './components/StoreInfoModal';
import { api } from './services/api';
import type { CustomerProfile, Product, ChatMessage, ObservabilityStep, StoreInfo } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'menu'>('chat');
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);

  // Customer Profile State
  const [profile, setProfile] = useState<CustomerProfile>({
    name: 'Abhinav',
    favorite_flavors: ['chocolate', 'sweet', 'creamy'],
    preferred_temperature: 'iced',
    caffeine_preference: 'medium',
    dietary_restrictions: ['Vegetarian'],
    budget_max: 300,
    favorite_products: [],
    previous_recommendations: []
  });

  // Chat Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Cart / Order state
  const [cart, setCart] = useState<Array<{ name: string; price: number; quantity: number; size: string }>>([]);

  // Modals & Drawers state
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [showStoreInfoModal, setShowStoreInfoModal] = useState<boolean>(false);
  const [showObservabilityTrace, setShowObservabilityTrace] = useState<boolean>(false);
  const [activeTrace, setActiveTrace] = useState<ObservabilityStep[]>([]);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | undefined>(undefined);

  // Load initial menu data and initial welcome chat
  useEffect(() => {
    loadData();
    sendWelcomeMessage();
  }, []);

  const loadData = async () => {
    try {
      const menuData = await api.fetchMenu();
      setProducts(menuData);
      const infoData = await api.fetchStoreInfo();
      setStoreInfo(infoData);
    } catch (e) {
      console.error('Failed to load menu or store info', e);
    }
  };

  const sendWelcomeMessage = () => {
    const welcomeMsg: ChatMessage = {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Welcome to BrewMate Coffee House! ☕️✨\n\nI'm your AI Barista assistant. Based on your profile preferences for **cold, sweet, chocolatey drinks** under **₹300**, what can I craft or recommend for you today?`,
      suggested_actions: [
        'Recommend a cold drink under ₹300',
        'What coffee goes best with a croissant?',
        'I don\'t drink caffeine. What should I order?',
        'What are your store opening hours?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await api.sendChatMessage(text, profile);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: response.message,
        recommendation: response.recommendation,
        suggested_actions: response.suggested_actions,
        observability_trace: response.observability_trace,
        latency_ms: response.latency_ms,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (response.observability_trace) {
        setActiveTrace(response.observability_trace);
      }
      setLastLatencyMs(response.latency_ms);
    } catch (e) {
      console.error('Chat error', e);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I ran into an issue connecting to our barista engine. Please try again in a moment!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAddToCart = (productName: string, price: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === productName);
      if (existing) {
        return prev.map((item) =>
          item.name === productName ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { name: productName, price, quantity: 1, size: 'Regular' }];
    });
    setShowCartModal(true);
  };

  const handleCalculateOrderForProduct = (productName: string) => {
    const prod = products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
    const price = prod ? prod.price : 280;
    handleAddToCart(productName, price);
  };

  const handleAskAgentAboutProduct = (productName: string) => {
    setActiveTab('chat');
    handleSendMessage(`Tell me more about ${productName}. What are its ingredients, flavor profile, and best food pairings?`);
  };

  const handleResetChat = () => {
    sendWelcomeMessage();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0C0A] text-stone-100 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenCart={() => setShowCartModal(true)}
        onOpenStoreInfo={() => setShowStoreInfoModal(true)}
        onToggleObservability={() => setShowObservabilityTrace(!showObservabilityTrace)}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        profile={profile}
        showTrace={showObservabilityTrace}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        
        {/* Hero Section */}
        <Hero
          onSelectPrompt={(p) => {
            setActiveTab('chat');
            handleSendMessage(p);
          }}
          profile={profile}
          onOpenProfile={() => setShowProfileModal(true)}
        />

        {/* Tab Views */}
        {activeTab === 'chat' ? (
          <ChatAssistant
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            profile={profile}
            onAddToCart={handleAddToCart}
            onCalculateOrder={handleCalculateOrderForProduct}
            onResetChat={handleResetChat}
          />
        ) : (
          <MenuGrid
            products={products}
            onAddToCart={handleAddToCart}
            onAskAgentAboutProduct={handleAskAgentAboutProduct}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-amber-500/15 py-6 px-4 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 BrewMate AI — Google Gen AI Academy APAC Cohort 3 (Track 1)</p>
          <p className="flex items-center gap-2">
            <span>Built with Google ADK</span> • <span>RAG Pipeline</span> • <span>Cloud Run Ready</span>
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {showProfileModal && (
        <PreferenceProfile
          profile={profile}
          onSaveProfile={(newProf) => setProfile(newProf)}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showCartModal && (
        <OrderCalculatorModal
          cart={cart}
          onUpdateCart={(newCart) => setCart(newCart)}
          onClose={() => setShowCartModal(false)}
        />
      )}

      {showStoreInfoModal && (
        <StoreInfoModal
          storeInfo={storeInfo}
          onClose={() => setShowStoreInfoModal(false)}
        />
      )}

      {showObservabilityTrace && (
        <ObservabilityDrawer
          trace={activeTrace}
          latencyMs={lastLatencyMs}
          onClose={() => setShowObservabilityTrace(false)}
        />
      )}

    </div>
  );
}

export default App;
