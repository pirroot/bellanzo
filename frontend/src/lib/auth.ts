import { API_BASE } from './api';

export async function login(phone: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });

  if (!res.ok) throw new Error('نام کاربری یا رمز عبور اشتباه است.');
  const data = await res.json();
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  return data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function isAuthed() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}
