'use client';
import { useEffect, useState } from 'react';
import { adminGetOrders, adminGetTrials, adminGetContacts, adminLogout } from '@/utils/api';

interface Order {
  id: string;
  customer_email: string;
  plan_id: string;
  plan_name: string;
  amount: string;
  paypal_order_id: string;
  paypal_capture_id: string;
  status: string;
  created_at: string;
}

interface Trial {
  id: string;
  customer_email: string;
  status: string;
  created_at: string;
  activated_at: string | null;
  expires_at: string | null;
}

interface Contact {
  id: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

type Tab = 'payments' | 'trials' | 'contacts';

export default function AdminOrders() {
  const [tab, setTab] = useState<Tab>('payments');
  const [orders, setOrders] = useState<Order[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    Promise.all([
      adminGetOrders(token).then((r) => {
        if (r.success) setOrders(r.data || []);
        else if (r.message?.includes('Unauthorized') || r.message?.includes('expired')) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
          return;
        }
      }),
      adminGetTrials(token).then((r) => {
        if (r.success) setTrials(r.data || []);
      }),
      adminGetContacts(token).then((r) => {
        if (r.success) setContacts(r.data || []);
      }),
    ]).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) await adminLogout(token);
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleString() : '-';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Owner Dashboard</h1>
              <p className="text-sm text-white/40">Manage payments, trials, and messages</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setTab('payments')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              tab === 'payments'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            Payments
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/10">{orders.length}</span>
          </button>
          <button
            onClick={() => setTab('trials')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              tab === 'trials'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            Free Trials
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/10">{trials.length}</span>
          </button>
          <button
            onClick={() => setTab('contacts')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              tab === 'contacts'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            Messages
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/10">{contacts.length}</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Payments Table */}
        {tab === 'payments' && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-white/30 text-sm">No payments yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Plan</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Order ID</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-white/60 whitespace-nowrap">{formatDate(o.created_at)}</td>
                        <td className="px-6 py-4 text-white/80">{o.customer_email}</td>
                        <td className="px-6 py-4 text-white/80">{o.plan_name}</td>
                        <td className="px-6 py-4 text-white/80 font-medium">{o.amount}</td>
                        <td className="px-6 py-4">
                          <code className="text-white/30 text-[11px] font-mono bg-white/5 px-2 py-1 rounded">{o.paypal_order_id}</code>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Trials Table */}
        {tab === 'trials' && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            {trials.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-white/30 text-sm">No free trials yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Activated</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {trials.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-white/60 whitespace-nowrap">{formatDate(t.created_at)}</td>
                        <td className="px-6 py-4 text-white/80">{t.customer_email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            t.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : 'bg-green-500/10 text-green-400 border-green-500/20'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/60 whitespace-nowrap">{formatDate(t.activated_at)}</td>
                        <td className="px-6 py-4 text-white/60 whitespace-nowrap">{formatDate(t.expires_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Contacts Table */}
        {tab === 'contacts' && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            {contacts.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-white/30 text-sm">No messages yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Message</th>
                      <th className="text-left px-6 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {contacts.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-white/60 whitespace-nowrap">{formatDate(c.created_at)}</td>
                        <td className="px-6 py-4 text-white/80">{c.email}</td>
                        <td className="px-6 py-4 text-white/60 max-w-md">
                          <p className="truncate">{c.message}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            c.is_read
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {c.is_read ? 'Read' : 'New'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
