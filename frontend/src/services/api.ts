import type {
  CustomerProfile, Product, StoreInfo, OrderItemInput,
  OrderCalculationResponse, ObservabilityStep, RecommendationOutput
} from '../types';

const getApiUrl = (endpoint: string): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!envUrl) {
    return `/api${path}`;
  }
  const baseUrl = envUrl.replace(/\/$/, '');
  if (baseUrl.endsWith('/api')) {
    return `${baseUrl}${path}`;
  }
  return `${baseUrl}/api${path}`;
};

export interface ChatResponseData {
  message: string;
  recommendation?: RecommendationOutput;
  suggested_actions?: string[];
  observability_trace?: ObservabilityStep[];
  latency_ms?: number;
}

export const api = {
  async sendChatMessage(message: string, profile: CustomerProfile): Promise<ChatResponseData> {
    const res = await fetch(getApiUrl('/chat'), {
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

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/menu?${queryString}` : '/menu';
    const res = await fetch(getApiUrl(endpoint));
    if (!res.ok) {
      throw new Error(`Menu API error: ${res.statusText}`);
    }
    const data = await res.json();
    return data.products;
  },

  async fetchProductDetails(productId: string): Promise<{ product: Product; pairings: Product[] }> {
    const res = await fetch(getApiUrl(`/menu/${productId}`));
    if (!res.ok) {
      throw new Error(`Product details API error: ${res.statusText}`);
    }
    return await res.json();
  },

  async fetchStoreInfo(): Promise<StoreInfo> {
    const res = await fetch(getApiUrl('/store'));
    if (!res.ok) {
      throw new Error(`Store info API error: ${res.statusText}`);
    }
    return await res.json();
  },

  async calculateOrder(items: OrderItemInput[]): Promise<OrderCalculationResponse> {
    const res = await fetch(getApiUrl('/order/calculate'), {
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
    const res = await fetch(getApiUrl('/observability'));
    if (!res.ok) {
      throw new Error(`Observability API error: ${res.statusText}`);
    }
    return await res.json();
  }
};
