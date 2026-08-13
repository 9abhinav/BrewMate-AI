export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  ingredients: string[];
  flavor_profile: string[];
  caffeine_level: 'none' | 'low' | 'medium' | 'high';
  temperature: 'hot' | 'iced' | 'warm';
  size_options: string[];
  dietary_info: string[];
  calories: number;
  availability: boolean;
  pairings?: string[];
}

export interface CustomerProfile {
  name: string;
  favorite_flavors: string[];
  preferred_temperature: 'hot' | 'iced' | 'warm' | 'any';
  caffeine_preference: 'none' | 'low' | 'medium' | 'high' | 'any';
  dietary_restrictions: string[];
  budget_max: number | null;
  favorite_products: string[];
  previous_recommendations: string[];
}

export interface RecommendationOutput {
  recommendation: string;
  reason: string;
  price: number;
  product_id?: string;
  alternatives: string[];
  pairings: string[];
  category?: string;
  temperature?: string;
  caffeine_level?: string;
}

export interface ObservabilityStep {
  step_name: string;
  detail: string;
  data?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendation?: RecommendationOutput;
  suggested_actions?: string[];
  observability_trace?: ObservabilityStep[];
  latency_ms?: number;
  timestamp: string;
}

export interface StoreInfo {
  store_name: string;
  tagline: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  hours: Record<string, string>;
  ordering_and_pickup: {
    counter_pickup: string;
    curbside_pickup: string;
    dine_in: string;
    customizations: string;
  };
  delivery: {
    available: boolean;
    radius_km: number;
    min_order_amount: number;
    free_delivery_above: number;
    estimated_time_minutes: string;
  };
  loyalty_program: {
    name: string;
    earning_rate: string;
    redemption: string;
    perks: string;
  };
  faq: Array<{ question: string; answer: string }>;
}

export interface OrderItemInput {
  product_id: string;
  size?: string;
  quantity: number;
}

export interface CalculatedItem {
  product_id: string;
  name: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderCalculationResponse {
  subtotal: number;
  tax: number;
  delivery_fee: number;
  total: number;
  items: CalculatedItem[];
}
