// @ts-nocheck
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { createClient } = require('@supabase/supabase-js');

const JWT_SECRET = process.env.JWT_SECRET || 'iptv-admin-secret-key-change-in-production';

const app = express();

// ============================================================
// Security Headers
// ============================================================
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.paypal.com", "https://www.paypalobjects.com", "https://www.paypal.sandbox.com"],
      frameSrc: ["https://www.paypal.com", "https://www.paypalobjects.com", "https://www.paypal.sandbox.com"],
      connectSrc: ["'self'", "https://api-m.paypal.com", "https://api-m.paypal.sandbox.com"],
      imgSrc: ["'self'", "data:", "https://www.paypalobjects.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
}));

// ============================================================
// CORS
// ============================================================
const ALLOWED_ORIGINS = [
  'https://iptvpremium01.vercel.app',
  'https://iptv-api-proxy.youssefcherrouk.workers.dev',
  'https://iptvpro-eight.vercel.app',
  'https://iptvpro-b1ra9gn2m-luizerferly-3716s-projects.vercel.app',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('Origin not allowed'));
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

// ============================================================
// Rate Limiting
// ============================================================
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down' },
});
app.use(globalLimiter);

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

const standardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down' },
});

// ============================================================
// Helpers
// ============================================================
const jwt = require('jsonwebtoken');

function signAdminToken(username) {
  return jwt.sign(
    { username, role: 'admin', jti: `${Date.now()}-${Math.random().toString(36).substr(2, 12)}` },
    JWT_SECRET,
    { expiresIn: '1h', algorithm: 'HS256' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}

// ============================================================
// Helpers: Transform snake_case DB rows to camelCase for frontend
// ============================================================
function snakeToCamel(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    acc[camelKey] = obj[key];
    return acc;
  }, {});
}

// ============================================================
// Admin Middleware
// ============================================================
const blacklistedTokens = new Set();

// ============================================================
// Supabase Database Client
// ============================================================
const supabaseUrl = process.env.SUPABASE_URL || 'https://bvbwaicdcshvwefhwbmd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_KEY environment variable is not set');
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const decoded = verifyToken(auth.split(' ')[1]);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    if (decoded.jti && blacklistedTokens.has(decoded.jti)) {
      return res.status(401).json({ success: false, message: 'Token revoked' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired, please login again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid session' });
  }
}

// ============================================================
// PayPal Auth Helper
// ============================================================
async function getPayPalAccessToken() {
  const https = require('https');
  const clientId = process.env.PAYPAL_CLIENT_ID || 'AW0W0rZ1vipKWQzIATsva00HNuSwtHzplMu0a85MqF0ekbQjcwxGhuTE3AYjUKUNe7MDZibJprQbta-t';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EERcWPn5avjEAteRNvjLIolrxLrV7YaX6hnAl4yJnozJuOQVVBHZyHgjdpHxEIPI_nSPj0gt2ra2Lier';
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return new Promise((resolve, reject) => {
    const req = https.request(`${process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com'}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) reject(new Error('PayPal authentication failed'));
          else resolve(parsed.access_token);
        } catch { reject(new Error('PayPal authentication failed')); }
      });
    });
    req.on('error', () => reject(new Error('PayPal authentication failed')));
    req.write('grant_type=client_credentials');
    req.end();
  });
}

// ============================================================
// Routes
// ============================================================

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

function getBaseUrl(req) {
  const host = req.headers.host || 'iptvpro-eight.vercel.app';
  return `https://${host}`;
}

// --- Create PayPal Order (redirect flow) ---
app.post('/api/payment/create-order', standardLimiter, async (req, res) => {
  try {
    const { planId, email } = req.body;

    if (!planId || typeof planId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid plan selection' });
    }
    if (!email || typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const plans = {
      month1: { price: '9.99', name: '1 Month' },
      month6: { price: '29.99', name: '6 Months' },
      year1: { price: '49.99', name: '1 Year' },
    };
    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = getBaseUrl(req);
    const customId = `${planId}|${email}`;

    const https = require('https');
    const order = await new Promise((resolve, reject) => {
      const req = https.request(`${process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com'}/v2/checkout/orders`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) reject(new Error('Unable to create payment order'));
            else resolve(parsed);
          } catch { reject(new Error('Unable to create payment order')); }
        });
      });
      req.on('error', () => reject(new Error('Unable to create payment order')));
      req.write(JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: plan.price },
          description: `IPTV Premium - ${plan.name}`,
          custom_id: customId,
        }],
        application_context: {
          return_url: `${baseUrl}/api/payment/return`,
          cancel_url: `${baseUrl}/pricing`,
          user_action: 'PAY_NOW',
          brand_name: 'IPTV Premium',
        },
      }));
      req.end();
    });

    if (order.id) {
      const approveLink = order.links?.find(l => l.rel === 'approve')?.href || '';
      res.json({ success: true, data: { orderID: order.id, approvalUrl: approveLink } });
    } else {
      res.status(400).json({ success: false, message: 'Unable to create payment order' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred while creating your order. Please try again.' });
  }
});

// --- Capture PayPal Order ---
app.post('/api/payment/capture-order', standardLimiter, async (req, res) => {
  try {
    const { orderId, planId, email } = req.body;

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing order ID' });
    }
    if (!planId || typeof planId !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing plan information' });
    }
    if (!email || typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const accessToken = await getPayPalAccessToken();

    const https = require('https');
    const capture = await new Promise((resolve, reject) => {
      const req = https.request(`${process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com'}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) reject(new Error('Payment could not be completed'));
            else resolve(parsed);
          } catch { reject(new Error('Payment could not be completed')); }
        });
      });
      req.on('error', () => reject(new Error('Payment could not be completed')));
      req.write('{}');
      req.end();
    });

    if (capture.status === 'COMPLETED') {
      const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || '';
      const plans = { month1: { price: '9.99', name: '1 Month' }, month6: { price: '29.99', name: '6 Months' }, year1: { price: '49.99', name: '1 Year' } };
      const plan = plans[planId] || { price: '0', name: 'Unknown' };
      const { error: insertError } = await supabase.from('orders').insert({
        order_id: orderId,
        capture_id: captureId,
        email,
        plan_id: planId,
        plan_name: plan.name,
        amount: plan.price,
        currency: 'USD',
        status: 'paid',
        delivered: false,
      });
      if (insertError) throw new Error('Failed to save order');
      res.json({ success: true, data: { captureId, status: capture.status } });
    } else {
      res.status(400).json({ success: false, message: 'Payment was not completed. Please try again.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred while processing your payment. Please try again.' });
  }
});

// --- PayPal Return (redirect after approval) ---
app.get('/api/payment/return', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token || typeof token !== 'string') {
      return res.redirect('/pricing?error=missing_token');
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = getBaseUrl(req);
    const https = require('https');

    // Capture the order
    const capture = await new Promise((resolve, reject) => {
      const req = https.request(`${process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com'}/v2/checkout/orders/${encodeURIComponent(token)}/capture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) reject(new Error('Payment capture failed'));
            else resolve(parsed);
          } catch { reject(new Error('Payment capture failed')); }
        });
      });
      req.on('error', () => reject(new Error('Payment capture failed')));
      req.write('{}');
      req.end();
    });

    if (capture.status !== 'COMPLETED') {
      return res.redirect(`${baseUrl}/pricing?error=payment_failed`);
    }

    // Get custom_id from order to find planId/email
    let planId = 'month1';
    let email = '';

    try {
      const orderDetails = await new Promise((resolve, reject) => {
        const req = https.request(`${process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com'}/v2/checkout/orders/${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode >= 400) reject(new Error('Could not fetch order'));
              else resolve(parsed);
            } catch { reject(new Error('Could not fetch order')); }
          });
        });
        req.on('error', () => reject(new Error('Could not fetch order')));
        req.end();
      });

      const customId = orderDetails.purchase_units?.[0]?.custom_id;
      if (customId) {
        const parts = customId.split('|');
        planId = parts[0] || planId;
        email = parts[1] || '';
      }
    } catch {
      // Use defaults
    }

    // Store order in memory
    const plans = { month1: { price: '9.99', name: '1 Month' }, month6: { price: '29.99', name: '6 Months' }, year1: { price: '49.99', name: '1 Year' } };
    const plan = plans[planId] || { price: '0', name: 'Unknown' };
    const { error: insertError } = await supabase.from('orders').insert({
      order_id: token,
      capture_id: capture.id || '',
      email,
      plan_id: planId,
      plan_name: plan.name,
      amount: plan.price,
      currency: 'USD',
      status: 'paid',
      delivered: false,
    });
    if (insertError) console.error('Failed to save order from return URL:', insertError);

    res.redirect(`${baseUrl}/success?orderId=${encodeURIComponent(token)}&plan=${encodeURIComponent(planId)}&email=${encodeURIComponent(email)}`);
  } catch (err) {
    const baseUrl = getBaseUrl(req);
    res.redirect(`${baseUrl}/pricing?error=payment_error`);
  }
});

// --- Free Trial ---
app.post('/api/payment/free-trial', standardLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const { error: insertError } = await supabase.from('trials').insert({
      email,
      status: 'active',
      delivered: false,
    });
    if (insertError) throw new Error('Failed to save trial');

    res.json({ success: true, message: 'Free trial activated! Check your email for instructions.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
  }
});

// --- Contact Form ---
app.post('/api/email/contact', standardLimiter, async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }
    if (!message || typeof message !== 'string' || message.length > 5000) {
      return res.status(400).json({ success: false, message: 'Message must be under 5000 characters' });
    }

    const { error: insertError } = await supabase.from('contacts').insert({
      email,
      message,
      read: false,
    });
    if (insertError) throw new Error('Failed to save message');

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
  }
});

// --- Admin Login ---
app.post('/api/admin/login', strictLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || '';
    const adminPass = process.env.ADMIN_PASSWORD || '';

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userMatch = username.length === adminUser.length && username === adminUser;
    const passMatch = password.length === adminPass.length && password === adminPass;

    if (!userMatch || !passMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signAdminToken(username);

    res.json({ success: true, data: { token } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
});

// --- Admin Logout ---
app.post('/api/admin/logout', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    let decoded;
    try {
      decoded = verifyToken(auth.split(' ')[1]);
    } catch {
      return res.json({ success: true, message: 'Logged out' });
    }

    if (decoded.jti) {
      blacklistedTokens.add(decoded.jti);
    }

    res.json({ success: true, message: 'Logged out' });
  } catch {
    res.json({ success: true, message: 'Logged out' });
  }
});

// --- Admin: Get Orders ---
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: snakeToCamel(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

// --- Admin: Get Trials ---
app.get('/api/admin/trials', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('trials').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: snakeToCamel(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching trials' });
  }
});

// --- Admin: Get Contacts ---
app.get('/api/admin/contacts', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: snakeToCamel(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
});

// --- Admin: Update Order Delivery Status ---
app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { delivered } = req.body;
    const { data, error } = await supabase.from('orders').update({ delivered: !!delivered }).eq('id', id).select().single();
    if (error) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: snakeToCamel(data) });
  } catch {
    res.status(500).json({ success: false, message: 'Error updating order' });
  }
});

// --- Admin: Update Trial Delivery Status ---
app.patch('/api/admin/trials/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { delivered } = req.body;
    const { data, error } = await supabase.from('trials').update({ delivered: !!delivered }).eq('id', id).select().single();
    if (error) return res.status(404).json({ success: false, message: 'Trial not found' });
    res.json({ success: true, data: snakeToCamel(data) });
  } catch {
    res.status(500).json({ success: false, message: 'Error updating trial' });
  }
});

// Catch-all error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
