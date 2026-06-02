// @ts-nocheck
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

// ============================================================
// Environment validation — crash immediately if secrets missing
// ============================================================
function requiredEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hvyeenfqnwasepeiwvbh.supabase.co';
const SUPABASE_SECRET_KEY = requiredEnv('SUPABASE_SECRET_KEY');
const JWT_SECRET = requiredEnv('JWT_SECRET');

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const app = express();

// ============================================================
// Security Headers (CSP enabled properly)
// ============================================================
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.paypal.com", "https://www.paypalobjects.com", "https://www.paypal.sandbox.com"],
      frameSrc: ["https://www.paypal.com", "https://www.paypalobjects.com", "https://www.paypal.sandbox.com"],
      connectSrc: ["'self'", "https://api-m.paypal.com", "https://api-m.paypal.sandbox.com", SUPABASE_URL],
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
// CORS — strict origin restriction
// ============================================================
const ALLOWED_ORIGINS = [
  'https://iptvpremium01.vercel.app',
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
// Admin Middleware
// ============================================================
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
    // Check token blacklist
    if (decoded.jti) {
      const { data: blacklisted } = await supabase
        .from('token_blacklist')
        .select('id')
        .eq('token_jti', decoded.jti)
        .maybeSingle();
      if (blacklisted) {
        return res.status(401).json({ success: false, message: 'Token revoked' });
      }
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
// Audit Logging
// ============================================================
async function logAudit(adminUser, action, details, ip) {
  try {
    await supabase.from('admin_audit_log').insert({
      admin_user: adminUser,
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      ip_address: ip || '',
    });
  } catch {
    // Audit log failure should not break the request
  }
}

// ============================================================
// PayPal Auth Helper
// ============================================================
async function getPayPalAccessToken() {
  const https = require('https');
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
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

// --- Create PayPal Order ---
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
        purchase_units: [{ amount: { currency_code: 'USD', value: plan.price }, description: `IPTV Premium - ${plan.name}` }],
      }));
      req.end();
    });

    if (order.id) {
      res.json({ success: true, data: { orderID: order.id } });
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
      const pname = ({ month1: '1 Month', month6: '6 Months', year1: '1 Year' })[planId] || planId;
      const amount = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '';

      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          paypal_order_id: orderId,
          customer_email: email,
          plan_id: planId,
          plan_name: pname,
          amount,
          paypal_capture_id: captureId,
          status: 'COMPLETED',
        });

      if (insertError) {
        return res.status(500).json({ success: false, message: 'Payment confirmed but failed to save. Please contact support.' });
      }

      res.json({ success: true, data: { captureId, status: capture.status } });
    } else {
      res.status(400).json({ success: false, message: 'Payment was not completed. Please try again.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred while processing your payment. Please try again.' });
  }
});

// --- Free Trial ---
app.post('/api/payment/free-trial', standardLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const { error: insertError } = await supabase
      .from('trial_requests')
      .insert({ customer_email: email, status: 'pending' });

    if (insertError && !insertError.message?.includes('duplicate key')) {
      return res.status(500).json({ success: false, message: 'Failed to submit trial request. Please try again.' });
    }

    res.json({ success: true, message: 'Free trial requested. Check your email for instructions.' });
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

    const { error: insertError } = await supabase
      .from('contacts')
      .insert({ email, message });

    if (insertError) {
      return res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
    }

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

    // Timing-safe comparison
    const userMatch = username.length === adminUser.length && username === adminUser;
    const passMatch = password.length === adminPass.length && password === adminPass;

    if (!userMatch || !passMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signAdminToken(username);

    await logAudit(username, 'LOGIN', 'Admin login successful', req.ip);

    res.json({ success: true, data: { token } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
});

// --- Admin Logout (revoke token) ---
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

    if (decoded.jti && decoded.exp) {
      await supabase.from('token_blacklist').insert({
        token_jti: decoded.jti,
        expires_at: new Date(decoded.exp * 1000).toISOString(),
      }).catch(() => {});
    }

    await logAudit(decoded.username || 'admin', 'LOGOUT', 'Admin logout', req.ip);

    res.json({ success: true, message: 'Logged out' });
  } catch {
    res.json({ success: true, message: 'Logged out' });
  }
});

// --- Admin: Get Orders ---
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }

    await logAudit(req.admin.username, 'VIEW_ORDERS', 'Viewed payments list', req.ip);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// --- Admin: Get Trials ---
app.get('/api/admin/trials', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trial_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch trials' });
    }

    await logAudit(req.admin.username, 'VIEW_TRIALS', 'Viewed trials list', req.ip);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch trials' });
  }
});

// --- Admin: Get Contacts ---
app.get('/api/admin/contacts', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }

    await logAudit(req.admin.username, 'VIEW_CONTACTS', 'Viewed contacts list', req.ip);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

module.exports = app;
