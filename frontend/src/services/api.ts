import type {
  CustomerProfile, Product, StoreInfo, OrderItemInput,
  OrderCalculationResponse, ObservabilityStep, RecommendationOutput
} from '../types';

const API_BASE = '/api';

export interface ChatResponseData {
  message: string;
  recommendation?: RecommendationOutput;
  suggested_actions?: string[];
  observability_trace?: ObservabilityStep[];
  latency_ms?: number;
}

export const api = {
  async sendChatMessage(message: string, profile: CustomerProfile): Promise<ChatResponseData> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        profile
      })
    });
    if (!res.ok) {
      throw new Error(`Chat API error: ${res.statusText}`);
    }
    return await res.json();
  },

  async fetchMenu(params?: {
    query?: string;
    category?: string;
    max_price?: number;
    dietary?: string;
    caffeine?: string;
    temperature?: string;
  }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params?.max_price) searchParams.append('max_price', params.max_price.toString());
    if (params?.dietary && params.dietary !== 'None') searchParams.append('dietary', params.dietary);
    if (params?.caffeine && params.caffeine !== 'any') searchParams.append('caffeine', params.caffeine);
    if (params?.temperature && params.temperature !== 'any') searchParams.append('temperature', params.temperature);

    const res = await fetch(`${API_BASE}/menu?${searchParams.toString()}`);
    if (!res.ok) {
      throw new Error(`Menu API error: ${res.statusText}`);
    }
    const data = await res.json();
    return data.products;
  },

  async fetchProductDetails(productId: string): Promise<{ product: Product; pairings: Product[] }> {
    const res = await fetch(`${API_BASE}/menu/${productId}`);
    if (!res.ok) {
      throw new Error(`Product details API error: ${res.statusText}`);
    }
    return await res.json();
  },

  async fetchStoreInfo(): Promise<StoreInfo> {
    const res = await fetch(`${API_BASE}/store`);
    if (!res.ok) {
      throw new Error(`Store info API error: ${res.statusText}`);
    }
    return await res.json();
  },

  async calculateOrder(items: OrderItemInput[]): Promise<OrderCalculationResponse> {
    const res = await fetch(`${API_BASE}/order/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (!res.ok) {
      throw new Error(`Order calculation error: ${res.statusText}`);
    }
    return await res.json();
  },

  async fetchObservabilityTraces(): Promise<any> {
    const res = await fetch(`${API_BASE}/observability`);
    if (!res.ok) {
      throw new Error(`Observability API error: ${res.statusText}`);
    }
    return await res.json();
  }
};
