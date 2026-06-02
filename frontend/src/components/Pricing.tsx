'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useLanguage } from '@/i18n/LanguageContext';
import { PLANS, createPayPalOrder, capturePayPalOrder, submitFreeTrial } from '@/utils/api';
import type { Plan } from '@/utils/api';

function PlanCard({
  plan,
  t,
}: {
  plan: Plan & { trans: typeof import('@/i18n/en').default['pricing']['free'] };
  t: ReturnType<typeof useLanguage>['t'];
}) {
  const [email, setEmail] = useState('');
  const emailRef = useRef('');
  const [emailError, setEmailError] = useState('');
  const [showPayPal, setShowPayPal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      setEmailError(t.pricing.emailRequired);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError(t.pricing.emailInvalid);
      return false;
    }
    setEmailError('');
    return true;
  };

  const generateIdempotencyKey = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${plan.id}`;

  const handleFreeTrial = async () => {
    if (!validateEmail(email)) return;
    setLoading(true);
    const result = await submitFreeTrial(email);
    setLoading(false);
    if (result.success) {
      setStatus('success');
      setTimeout(() => {
        window.location.href = `/success?plan=free&email=${encodeURIComponent(email)}`;
      }, 1500);
    } else {
      alert(result.message || 'An error occurred');
    }
  };

  const handleBuyClick = () => {
    if (!validateEmail(email)) return;
    setShowPayPal(true);
  };

  const handleApprove = useCallback(async (data: { orderID: string }) => {
    const curEmail = emailRef.current;
    setLoading(true);
    const result = await capturePayPalOrder(data.orderID, plan.id, curEmail);
    setLoading(false);
    if (result.success) {
      setOrderId(data.orderID);
      setStatus('success');
      setTimeout(() => {
        window.location.href = `/success?orderId=${data.orderID}&plan=${plan.id}&email=${encodeURIComponent(curEmail)}`;
      }, 1500);
    } else {
      alert('Payment capture failed. Please contact support.');
    }
  }, [plan.id]);

  const handleCreateOrder = useCallback(async () => {
    const key = generateIdempotencyKey();
    const result = await createPayPalOrder(plan.id, emailRef.current, key);
    if (result.success && result.data?.orderID) {
      return result.data.orderID;
    }
    throw new Error(result.message || 'Failed to create PayPal order');
  }, [plan.id]);

  if (status === 'success') {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{plan.id === 'free' ? t.success.trialTitle : t.success.title}</h3>
        <p className="text-dark-300 text-sm">{plan.id === 'free' ? t.success.trialMessage : t.success.message}</p>
      </div>
    );
  }

  return (
    <div
      className={`animate-on-scroll relative flex flex-col glass-card-hover p-6 lg:p-8 group ${
        plan.popular
          ? 'border-purple-500/40 ring-1 ring-purple-500/20 glow-purple scale-[1.02] lg:scale-105'
          : 'hover:scale-[1.02]'
      } transition-all duration-500`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full shadow-lg shadow-purple-500/30">
            {plan.popular}
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6 pt-2">
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">{plan.trans.name}</h3>
        <p className="text-sm text-dark-300">{plan.trans.duration}</p>
        <div className="mt-4">
          <span className="text-4xl font-extrabold gradient-text">{plan.trans.price}</span>
          {plan.value > 0 && (
            <span className="text-dark-300 text-sm ml-1">/{plan.id === 'month1' ? 'mo' : plan.id === 'month6' ? '6mo' : 'yr'}</span>
          )}
        </div>
        <p className="text-sm text-dark-300 mt-3">{plan.trans.description}</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.trans.features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm text-dark-200 group-hover:text-white/70 transition-colors duration-300" style={{ transitionDelay: `${i * 50}ms` }}>
            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* Email Input */}
      <div className="mb-4">
        <input
          type="email"
          placeholder={t.pricing.emailPlaceholder}
          value={email}
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);
            emailRef.current = val;
            if (emailError) validateEmail(val);
          }}
          className="input-field text-sm"
          disabled={loading}
        />
        {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
      </div>

      {/* CTA / PayPal Button */}
      {plan.id === 'free' ? (
        <button
          onClick={handleFreeTrial}
          disabled={loading}
          className="btn-gold w-full"
        >
          {loading ? t.pricing.processing : plan.trans.cta}
        </button>
      ) : !showPayPal ? (
        <button
          onClick={handleBuyClick}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? t.pricing.processing : plan.trans.cta}
        </button>
      ) : (
        <div className="min-h-[150px]">
          <PayPalButtons
            style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
            createOrder={handleCreateOrder}
            onApprove={handleApprove}
            onError={(err) => {
              console.error('PayPal Error:', err);
              alert('PayPal Error: ' + (err?.message || err || 'Payment failed'));
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const plans = [
    { ...PLANS.free, trans: t.pricing.free },
    { ...PLANS.month1, trans: t.pricing.month1 },
    { ...PLANS.month6, trans: t.pricing.month6 },
    { ...PLANS.year1, trans: t.pricing.year1 },
  ];

  return (
    <section id="pricing" ref={sectionRef} className="relative py-24 bg-dark-900 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="animate-on-scroll text-center mb-16">
          <h2 className="section-title gradient-text">{t.pricing.title}</h2>
          <p className="section-subtitle">{t.pricing.subtitle}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
