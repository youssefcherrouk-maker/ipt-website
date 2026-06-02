// API calls are proxied through Cloudflare Worker to avoid exposing Vercel bypass token
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BYPASS_PARAM = '';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}${BYPASS_PARAM}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function createPayPalOrder(
  planId: string,
  email: string,
  idempotencyKey?: string
): Promise<ApiResponse<{ orderID: string }>> {
  return request('/payment/create-order', {
    method: 'POST',
    body: JSON.stringify({ planId, email, idempotencyKey }),
  });
}

export async function capturePayPalOrder(
  orderId: string,
  planId: string,
  email: string
): Promise<ApiResponse<{ status: string }>> {
  return request('/payment/capture-order', {
    method: 'POST',
    body: JSON.stringify({ orderId, planId, email }),
  });
}

export async function submitFreeTrial(
  email: string
): Promise<ApiResponse> {
  return request('/payment/free-trial', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function submitContact(
  email: string,
  message: string
): Promise<ApiResponse> {
  return request('/email/contact', {
    method: 'POST',
    body: JSON.stringify({ email, message }),
  });
}

export async function adminLogin(username: string, password: string): Promise<ApiResponse<{ token: string }>> {
  return request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function adminLogout(token: string): Promise<ApiResponse> {
  return fetch(`${API_URL}/admin/logout${BYPASS_PARAM}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json());
}

export async function adminGetTrials(token: string): Promise<ApiResponse<any[]>> {
  const res = await fetch(`${API_URL}/admin/trials${BYPASS_PARAM}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) return { success: false, message: data.message || 'Failed to fetch trials' };
  return { success: true, data: data.data };
}

export async function adminGetOrders(token: string): Promise<ApiResponse<any[]>> {
  const res = await fetch(`${API_URL}/admin/orders${BYPASS_PARAM}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) return { success: false, message: data.message || 'Failed to fetch orders' };
  return { success: true, data: data.data };
}

export async function adminGetContacts(token: string): Promise<ApiResponse<any[]>> {
  const res = await fetch(`${API_URL}/admin/contacts${BYPASS_PARAM}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) return { success: false, message: data.message || 'Failed to fetch contacts' };
  return { success: true, data: data.data };
}

export interface Plan {
  id: string;
  name: string;
  duration: string;
  price: string;
  currency: string;
  value: number;
  description: string;
  features: string[];
  popular?: string;
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free Trial',
    duration: '24 Hours',
    price: 'Free',
    currency: 'USD',
    value: 0,
    description: 'Test our service risk-free with full access for 24 hours.',
    features: [
      'Full channel access',
      'HD & 4K streaming',
      'All devices supported',
      'No credit card required',
    ],
  },
  month1: {
    id: 'month1',
    name: '1 Month',
    duration: 'Monthly',
    price: '$9.99',
    currency: 'USD',
    value: 9.99,
    description: 'Perfect for short-term entertainment needs.',
    features: [
      'Full channel access',
      'HD & 4K streaming',
      'All devices supported',
      '24/7 support',
    ],
  },
  month6: {
    id: 'month6',
    name: '6 Months',
    duration: 'Semi-Annual',
    price: '$29.99',
    currency: 'USD',
    value: 29.99,
    description: 'Best value for regular viewers. Save more!',
    features: [
      'Full channel access',
      'HD & 4K streaming',
      'All devices supported',
      '24/7 priority support',
    ],
    popular: 'Most Popular',
  },
  year1: {
    id: 'year1',
    name: '1 Year',
    duration: 'Annual',
    price: '$49.99',
    currency: 'USD',
    value: 49.99,
    description: 'Ultimate savings for long-term entertainment.',
    features: [
      'Full channel access',
      'HD & 4K streaming',
      'All devices supported',
      '24/7 VIP support',
      'Extra bonus channels',
    ],
    popular: 'Best Value',
  },
};
