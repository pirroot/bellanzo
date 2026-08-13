const isServer = typeof window === 'undefined';

export const API_BASE = isServer
  ? process.env.INTERNAL_API_BASE || 'http://127.0.0.1:8000/api'
  : process.env.NEXT_PUBLIC_API_BASE || '/api';

export const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE || '';

export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  const idx = path.indexOf('/media/');
  if (idx !== -1) return path.slice(idx);
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE}${path}`;
}

type FetchOpts = RequestInit & { auth?: boolean };

async function doFetch(
  endpoint: string,
  rest: RequestInit,
  headers: Record<string, string>
): Promise<Response> {
  return fetch(`${API_BASE}${endpoint}`, { ...rest, headers });
}

function buildHeaders(
  base: Record<string, string>,
  body: RequestInit['body'],
  token?: string | null
): Record<string, string> {
  const h = { ...base };
  if (!(body instanceof FormData)) h['Content-Type'] = 'application/json';
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function apiFetch<T>(endpoint: string, opts: FetchOpts = {}): Promise<T> {
  const { auth, headers: rawHeaders, ...rest } = opts;
  const base = (rawHeaders as Record<string, string>) ?? {};
  const isClient = typeof window !== 'undefined';

  let token = auth && isClient ? localStorage.getItem('access_token') : null;
  let res = await doFetch(endpoint, rest, buildHeaders(base, rest.body, token));

  if (res.status === 401 && auth && isClient) {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('access_token', data.access);
          token = data.access;
          res = await doFetch(endpoint, rest, buildHeaders(base, rest.body, token));
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } catch {}
    }
  }

  if (!res.ok) {
    let detail = `Error (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch {}
    const err = new Error(detail) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export async function serverFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

import type { Cart, Order, Payment, CreateOrderData } from './types';

export async function getCart(): Promise<Cart> {
  return apiFetch<Cart>('/cart/', { auth: true });
}

export async function addToCart(
  productId: number,
  quantity: number = 1
): Promise<{ message: string; product: string; quantity: number }> {
  return apiFetch('/cart/add/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function removeFromCart(productId: number): Promise<{ message: string }> {
  return apiFetch('/cart/remove/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ product_id: productId }),
  });
}

export async function updateCartQuantity(
  productId: number,
  quantity: number
): Promise<{ message: string; product: string; quantity: number }> {
  return apiFetch('/cart/update_quantity/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function clearCart(): Promise<{ message: string }> {
  return apiFetch('/cart/clear/', {
    method: 'POST',
    auth: true,
  });
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  return apiFetch<Order>('/orders/create_order/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function getOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders/', { auth: true });
}

export async function getOrder(id: number): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}/`, { auth: true });
}

export async function cancelOrder(id: number): Promise<{ message: string; status: string }> {
  return apiFetch(`/orders/${id}/cancel/`, {
    method: 'POST',
    auth: true,
  });
}

export async function getOrderHistory(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders/history/', { auth: true });
}

export async function initiatePayment(orderId: number): Promise<{
  message: string;
  order_id: number;
  amount: number;
  gateway_url: string;
}> {
  return apiFetch('/payments/initiate/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ order_id: orderId }),
  });
}

export async function verifyPayment(
  orderId: number,
  authority: string,
  status: string
): Promise<{ message: string; order_id: number; ref_id: string }> {
  return apiFetch('/payments/verify/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ order_id: orderId, authority, status }),
  });
}

export async function adminGetOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/admin/orders/', { auth: true });
}

export async function adminUpdateOrderStatus(
  orderId: number,
  status: string,
  trackingCode?: string
): Promise<Order> {
  return apiFetch<Order>(`/admin/orders/${orderId}/update_status/`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ status, tracking_code: trackingCode || '' }),
  });
}
