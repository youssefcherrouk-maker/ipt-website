import { Router } from 'express';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

export function createAdminRoutes(pool: Pool): Router {
  const router = Router();

  router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const adminUser = process.env.ADMIN_USERNAME || '';
    const adminPass = process.env.ADMIN_PASSWORD || '';

    if (!username || !password || username !== adminUser || password !== adminPass) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, data: { token } });
  });

  router.get('/orders', requireAdmin, async (_req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM payments ORDER BY created_at DESC'
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
  });

  router.get('/trials', requireAdmin, async (_req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM trial_requests ORDER BY created_at DESC'
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch trials' });
    }
  });

  router.get('/contacts', requireAdmin, async (_req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM contacts ORDER BY created_at DESC'
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
    }
  });

  return router;
}
