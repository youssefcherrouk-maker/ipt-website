'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AW0W0rZ1vipKWQzIATsva00HNuSwtHzplMu0a85MqF0ekbQjcwxGhuTE3AYjUKUNe7MDZibJprQbta-t',
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
