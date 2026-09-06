import type { AdminOverview, AdminProvider, AdminService, AdminUser, CategoryFee } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

export const adminApi = {
  requestOtp: (phone: string) =>
    fetch(`${BASE_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    }).then((r) => r.json()),

  verifyOtp: (phone: string, code: string) =>
    fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    }).then((r) => r.json()),

  overview: (token: string) => request<AdminOverview>('/api/admin/dashboard/overview', token),
  users: async (token: string) => (await request<{ users: AdminUser[] }>('/api/admin/users', token)).users,
  providers: async (token: string) =>
    (await request<{ providers: AdminProvider[] }>('/api/admin/providers', token)).providers,
  services: async (token: string) => (await request<{ services: AdminService[] }>('/api/admin/services', token)).services,
  categoriesFees: async (token: string) =>
    (await request<{ config: { defaultPlatformFeePercent: number; categories: CategoryFee[] } }>(
      '/api/admin/config/categories-fees',
      token,
    )).config,
};
