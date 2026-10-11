/**
 * api.ts — Typed API client for Gharelu Hub
 * All frontend → backend communication goes through here.
 */

/* ─── Types (mirrored from server/db.ts) ─── */

export interface ApiUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  addresses: string[];
  vegMode: boolean;
  createdAt: number;
}

export interface ApiOrder {
  id: string;
  code: string;
  userId: string;
  type: 'delivery' | 'takeaway' | 'dinein';
  locationId: string;
  lines: Array<{
    key: string;
    dishId: string;
    qty: number;
    options: Array<{ group: string; choice: string; delta: number }>;
    note?: string;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  fee: number;
  total: number;
  placedAt: number;
  status: number;
  address?: string;
  eta: string;
  pointsEarned: number;
  couponCode?: string;
  paymentMethod: string;
}

export interface ApiReservation {
  id: string;
  code: string;
  userId: string;
  locationId: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: number;
}

export interface ApiLoyalty {
  points: number;
  tier: { name: string; minPoints: number; discount: number; color: string };
  nextTier: { name: string; minPoints: number; discount: number; color: string } | null;
  history: Array<{ id: string; type: 'earn' | 'redeem'; points: number; description: string; at: number }>;
  progressToNext: number;
}

/* ─── Core Fetch Helper ─── */

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error ?? 'Something went wrong.' };
    return { data: json as T, error: null };
  } catch (e) {
    return { data: null, error: 'Network error. Please check your connection.' };
  }
}

/* ─── Auth API ─── */

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ user: ApiUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mode: 'login', email, password }),
    }),

  loginPhone: (phone: string, password: string) =>
    apiFetch<{ user: ApiUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mode: 'login', phone, password }),
    }),

  register: (name: string, phone: string, email: string, password: string) =>
    apiFetch<{ user: ApiUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mode: 'register', name, phone, email, password }),
    }),

  me: () => apiFetch<{ user: ApiUser }>('/api/auth/me'),

  logout: () =>
    apiFetch<{ ok: boolean }>('/api/auth/me', { method: 'DELETE' }),
};

/* ─── Profile API ─── */

export const profileApi = {
  get: () => apiFetch<{ user: ApiUser }>('/api/profile'),
  update: (patch: Partial<Pick<ApiUser, 'name' | 'email' | 'vegMode' | 'addresses'>>) =>
    apiFetch<{ user: ApiUser }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
};

/* ─── Orders API ─── */

export const ordersApi = {
  list: () => apiFetch<{ orders: ApiOrder[] }>('/api/orders'),

  get: (id: string) => apiFetch<{ order: ApiOrder }>(`/api/orders/${id}`),

  place: (payload: {
    type: string;
    locationId: string;
    lines: ApiOrder['lines'];
    subtotal: number;
    tax: number;
    discount: number;
    fee: number;
    total: number;
    address?: string;
    paymentMethod: string;
    couponCode?: string;
  }) =>
    apiFetch<{ order: ApiOrder }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  advance: (id: string, status: number) =>
    apiFetch<{ order: ApiOrder }>(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

/* ─── Favorites API ─── */

export const favoritesApi = {
  list: () => apiFetch<{ dishIds: string[] }>('/api/favorites'),
  toggle: (dishId: string) =>
    apiFetch<{ dishIds: string[] }>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ dishId }),
    }),
};

/* ─── Loyalty API ─── */

export const loyaltyApi = {
  get: () => apiFetch<ApiLoyalty>('/api/loyalty'),
};

/* ─── Reservations API ─── */

export const reservationsApi = {
  list: () => apiFetch<{ reservations: ApiReservation[] }>('/api/reservations'),

  create: (payload: { locationId: string; date: string; time: string; guests: number; notes?: string }) =>
    apiFetch<{ reservation: ApiReservation }>('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancel: (id: string) =>
    apiFetch<{ ok: boolean }>('/api/reservations', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),
};

/* ─── Menu API ─── */

export type ApiSpiceLevel = 0 | 1 | 2 | 3;

export interface ApiDish {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  dietaryTags: string[];
  spiceLevel: ApiSpiceLevel;
  veg: boolean;
  bestseller?: boolean;
  available: boolean;
  branchAvailability: string[];
  weight?: string;
  shelfLife?: string;
  fresh?: boolean;
  pptHero?: boolean;
}

export interface ApiCategory {
  id: string;
  name: string;
  eyebrow: string;
  line: string;
  archetype: 'plate' | 'grill' | 'bowl' | 'round' | 'glass' | 'cup' | 'dessert';
  tint: string;
  fire?: boolean;
  smoke?: boolean;
}

export const menuApi = {
  list: (params?: { category?: string; location?: string; q?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<{ dishes: ApiDish[] }>(`/api/menu${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => apiFetch<{ dish: ApiDish }>(`/api/menu/${id}`),
  categories: () => apiFetch<{ categories: ApiCategory[] }>('/api/categories'),
};

/* ─── Secure Backend Proxy API (No raw API keys on client) ─── */

export const proxyApi = {
  // Proxied WhatsApp API dispatch
  sendWhatsApp: (payload: { phone?: string; message: string }) =>
    apiFetch<{ ok: boolean; proxied: boolean; url: string; maskedAuthToken: string }>('/api/proxy/whatsapp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Proxied Maps & Location verification
  getMapsUrl: (q: string) =>
    apiFetch<{ ok: boolean; mapUrl: string; maskedKey: string }>('/api/proxy/maps?q=' + encodeURIComponent(q)),

  // Proxied Payment verification token
  createPaymentToken: (payload: { amount: number; method: string }) =>
    apiFetch<{ ok: boolean; transactionRef: string; maskedGatewayKey: string }>('/api/proxy/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

