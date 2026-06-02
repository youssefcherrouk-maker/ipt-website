'use client';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial' | 'payment_failed' | 'none' | 'guest';

export interface SubscriptionState {
  hasSubscription: boolean;
  status: SubscriptionStatus;
  userEmail?: string;
  trialUsed?: boolean;
}

export function getSubscriptionStatus(): SubscriptionState {
  if (typeof window === 'undefined') {
    return { hasSubscription: false, status: 'guest' };
  }
  const stored = localStorage.getItem('iptv_subscription');
  if (!stored) {
    return { hasSubscription: false, status: 'guest' };
  }
  try {
    const data = JSON.parse(stored);
    if (data.status === 'active' || data.status === 'trial') {
      return {
        hasSubscription: true,
        status: data.status,
        userEmail: data.email,
        trialUsed: data.trialUsed,
      };
    }
    return {
      hasSubscription: false,
      status: data.status || 'expired',
      userEmail: data.email,
    };
  } catch {
    return { hasSubscription: false, status: 'guest' };
  }
}

export function setSubscriptionStatus(data: { status: SubscriptionStatus; email?: string; trialUsed?: boolean }): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('iptv_subscription', JSON.stringify(data));
}

export function clearSubscriptionStatus(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('iptv_subscription');
}
