import { logger } from '../utils/logger';

function getPaypalBase(): string {
  return process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
}
function getPaypalClientId(): string {
  return process.env.PAYPAL_CLIENT_ID || '';
}
function getPaypalClientSecret(): string {
  return process.env.PAYPAL_CLIENT_SECRET || '';
}

interface PayPalAmount {
  currency_code: string;
  value: string;
}

interface PayPalPurchaseUnit {
  reference_id: string;
  description: string;
  amount: PayPalAmount;
}

interface PayPalOrderRequest {
  intent: 'CAPTURE';
  purchase_units: PayPalPurchaseUnit[];
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: PayPalAmount;
      }>;
    };
  }>;
}

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    status: string;
    amount?: { value: string; currency_code: string };
    billing_agreement_id?: string;
    create_time?: string;
    update_time?: string;
  };
  resource_type: string;
  summary?: string;
}

interface PlanConfig {
  value: string;
  currency: string;
  description: string;
}

const PLANS: Record<string, PlanConfig> = {
  month1: {
    value: '9.99',
    currency: 'USD',
    description: 'IPTV Premium - 1 Month Subscription',
  },
  month6: {
    value: '29.99',
    currency: 'EUR',
    description: 'IPTV Premium - 6 Months Subscription',
  },
  year1: {
    value: '49.99',
    currency: 'USD',
    description: 'IPTV Premium - 1 Year Subscription',
  },
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${getPaypalClientId()}:${getPaypalClientSecret()}`).toString('base64');

  const response = await fetch(`${getPaypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error('PayPal auth failed', { status: response.status, error });
    throw new Error('Failed to authenticate with PayPal');
  }

  const data = await response.json() as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export function resetTokenCache(): void {
  cachedToken = null;
}

export async function createOrder(planId: string): Promise<PayPalOrderResponse> {
  const plan = PLANS[planId];
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  const accessToken = await getAccessToken();

  const orderRequest: PayPalOrderRequest = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: planId,
        description: plan.description,
        amount: {
          currency_code: plan.currency,
          value: plan.value,
        },
      },
    ],
  };

  const response = await fetch(`${getPaypalBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderRequest),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error('PayPal create order failed', { status: response.status, error });
    throw new Error('Failed to create PayPal order');
  }

  const order: PayPalOrderResponse = await response.json() as PayPalOrderResponse;
  logger.info('PayPal order created', { orderId: order.id, planId });
  return order;
}

export async function captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPaypalBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    logger.error('PayPal capture failed', { status: response.status, orderId, error });
    throw new Error('Failed to capture PayPal payment');
  }

  const capture = await response.json() as PayPalCaptureResponse;
  logger.info('PayPal payment captured', { orderId, status: capture.status });
  return capture;
}

export async function getOrderDetails(orderId: string): Promise<PayPalOrderResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPaypalBase()}/v2/checkout/orders/${orderId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    logger.error('PayPal get order failed', { status: response.status, orderId, error });
    throw new Error('Failed to retrieve PayPal order');
  }

  return await response.json() as PayPalOrderResponse;
}

export async function verifyWebhookSignature(
  headers: Record<string, string | string[] | undefined>,
  body: string
): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(
      `${getPaypalBase()}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: process.env.PAYPAL_WEBHOOK_ID || '',
          webhook_event: JSON.parse(body),
        }),
      }
    );
    const result = await response.json() as { verification_status: string };
    return result.verification_status === 'SUCCESS';
  } catch {
    return false;
  }
}

export function getPlanConfig(planId: string): PlanConfig | undefined {
  return PLANS[planId];
}

export type { PayPalWebhookEvent, PayPalCaptureResponse };
