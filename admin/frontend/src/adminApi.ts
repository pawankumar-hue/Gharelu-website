import type { Dish, Order, Reservation, User, DashboardMetrics, MenuCategory } from './types';

const TOKEN_KEY = 'gharelu_hub_admin_token';
const ADMIN_USER_KEY = 'gharelu_hub_admin_user';

export const ORDER_STAGES = [
  { label: 'Order Received', desc: 'Sent to master kitchen', color: 'text-[#681121] border-[#681121]/45' },
  { label: 'Woodfire Roasting', desc: 'Fresh small-batch roasting', color: 'text-[#b87319] border-[#D48924]/50' },
  { label: 'Heritage Spice Toss', desc: '78-yr recipe seasoning', color: 'text-[#b88c57] border-[#D1A673]/75' },
  { label: 'Packed & Stamped', desc: 'Vacuum nitrogen sealed', color: 'text-[var(--ink-soft)] border-[var(--rule)]' },
  { label: 'Rider Out for Delivery', desc: 'On route in Bhopal', color: 'text-[#1D2E47] border-[#1D2E47]/35' },
  { label: 'At Your Doorstep', desc: 'Delivered piping fresh', color: 'text-[#3d7044] border-[#4E8B56]/50' },
  { label: 'Completed & Enjoyed', desc: 'Points awarded', color: 'text-[var(--ink-faint)] border-[var(--rule)]' },
];

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
  getUser: () => {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (u: any) => localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(u)),
};

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    authStorage.clearToken();
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with code ${res.status}`);
  }
  return data as T;
}

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    req<{ ok: boolean; token: string; admin: any }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => req<{ ok: boolean; admin: any }>('/api/admin/me'),

  // Stats
  getStats: () =>
    req<{
      metrics: DashboardMetrics;
      categoryDistribution: Record<string, number>;
      recentOrders: Order[];
    }>('/api/admin/stats'),

  // Products
  getProducts: (params?: { category?: string; search?: string; available?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return req<{ products: Dish[]; categories: MenuCategory[] }>(`/api/admin/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id: string) => req<{ product: Dish }>(`/api/admin/products/${id}`),
  createProduct: (data: Partial<Dish>) =>
    req<{ ok: boolean; product: Dish; message: string }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: Partial<Dish>) =>
    req<{ ok: boolean; product: Dish; message: string }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleProduct: (id: string) =>
    req<{ ok: boolean; product: Dish }>(`/api/admin/products/${id}/toggle`, {
      method: 'PATCH',
    }),
  deleteProduct: (id: string) =>
    req<{ ok: boolean; message: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    }),
  uploadImage: (dataUrl: string, filename: string) =>
    req<{ ok: boolean; imageUrl: string; filename: string }>('/api/admin/upload-image', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename }),
    }),

  // Orders
  getOrders: (params?: { status?: string; type?: string; locationId?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return req<{ orders: Order[] }>(`/api/admin/orders${qs ? `?${qs}` : ''}`);
  },
  updateOrderStatus: (id: string, status: number) =>
    req<{ ok: boolean; order: Order }>(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Reservations
  getReservations: () => req<{ reservations: Reservation[] }>('/api/admin/reservations'),
  updateReservationStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled') =>
    req<{ ok: boolean; reservation: Reservation }>(`/api/admin/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Users
  getUsers: () => req<{ users: User[] }>('/api/admin/users'),

  // Categories (menu chapters)
  getCategories: () => req<{ categories: MenuCategory[] }>('/api/admin/categories'),
  createCategory: (data: Partial<MenuCategory>) =>
    req<{ ok: boolean; category: MenuCategory }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<MenuCategory>) =>
    req<{ ok: boolean; category: MenuCategory }>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    req<{ ok: boolean; message: string }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }),
};
