'use client';
import { useEffect, useState } from 'react';
import {
  adminGetOrders, adminGetTrials, adminGetContacts,
  adminUpdateOrderStatus, adminUpdateTrialStatus,
  adminLogout,
} from '@/utils/api';

type Tab = 'payments' | 'trials' | 'messages';

interface StatCard {
  label: string;
  value: string | number;
  color: string;
  icon: string;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('payments');
  const [orders, setOrders] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchData = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) { window.location.href = '/admin/login'; return; }
    setLoading(true);
    Promise.all([
      adminGetOrders(token).then(r => { if (r.success) setOrders(r.data || []); }),
      adminGetTrials(token).then(r => { if (r.success) setTrials(r.data || []); }),
      adminGetContacts(token).then(r => { if (r.success) setMessages(r.data || []); }),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) await adminLogout(token);
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  const toggleDelivered = async (type: 'order' | 'trial', id: number, current: boolean) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setUpdating(id);
    if (type === 'order') {
      await adminUpdateOrderStatus(token, id, !current);
    } else {
      await adminUpdateTrialStatus(token, id, !current);
    }
    setUpdating(null);
    fetchData();
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleString() : '-';

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.amount || '0'), 0);
  const deliveredOrders = orders.filter(o => o.delivered).length;

  const stats: StatCard[] = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: 'from-green-600 to-emerald-500', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Total Orders', value: orders.length, color: 'from-purple-600 to-pink-500', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Delivered', value: deliveredOrders, color: 'from-blue-600 to-cyan-500', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Free Trials', value: trials.length, color: 'from-amber-500 to-orange-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Messages', value: messages.length, color: 'from-rose-500 to-red-500', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Pending Delivery', value: orders.filter(o => !o.delivered).length, color: 'from-yellow-500 to-amber-500', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  ];

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
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Data Analyst Dashboard</h1>
              <p className="text-sm text-white/40">Manage payments, deliveries, trials, and messages</p>
            </div>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200">
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="relative bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
              <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${s.color} group-hover:opacity-[0.06] transition-opacity`} />
              <svg className={`w-6 h-6 mb-2 bg-gradient-to-br ${s.color} bg-clip-text text-transparent`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
              </svg>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['payments', 'trials', 'messages'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg capitalize transition-all duration-200 ${
                tab === t
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                  : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              {t === 'payments' ? 'Payments' : t === 'trials' ? 'Free Trials' : 'Messages'}
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/10">
                {t === 'payments' ? orders.length : t === 'trials' ? trials.length : messages.length}
              </span>
            </button>
          ))}
        </div>

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
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Plan</th>
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Order ID</th>
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Delivered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4 text-white/60 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                        <td className="px-4 py-4 text-white/80">{o.email}</td>
                        <td className="px-4 py-4 text-white/80">{o.planName}</td>
                        <td className="px-4 py-4 text-white/80 font-medium">${o.amount}</td>
                        <td className="px-4 py-4">
                          <code className="text-white/30 text-[11px] font-mono bg-white/5 px-2 py-1 rounded">{o.orderId}</code>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 capitalize">
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleDelivered('order', o.id, o.delivered)}
                            disabled={updating === o.id}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                              o.delivered
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                            } disabled:opacity-50`}
                          >
                            {updating === o.id ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={o.delivered ? 'M5 13l4 4L19 7' : 'M12 9v2m0 4h.01'} />
                              </svg>
                            )}
                            {o.delivered ? 'Delivered' : 'Pending'}
                          </button>
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
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Delivered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {trials.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4 text-white/60 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                        <td className="px-4 py-4 text-white/80">{t.email}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 capitalize">
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleDelivered('trial', t.id, t.delivered)}
                            disabled={updating === t.id}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                              t.delivered
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                            } disabled:opacity-50`}
                          >
                            {updating === t.id ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.delivered ? 'M5 13l4 4L19 7' : 'M12 9v2m0 4h.01'} />
                              </svg>
                            )}
                            {t.delivered ? 'Delivered' : 'Pending'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Messages Table */}
        {tab === 'messages' && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            {messages.length === 0 ? (
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
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {messages.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4 text-white/60 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                        <td className="px-4 py-4 text-white/80">{c.email}</td>
                        <td className="px-4 py-4 text-white/60 max-w-md">
                          <p className="truncate">{c.message}</p>
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
