import { Router } from 'express';
import { Pool } from 'pg';
import { createPaymentController } from '../controllers/paymentController';
import { createEmailController } from '../controllers/emailController';
import { createAdminRoutes } from './admin';
import { validateBody, validateEmail, validatePlanId } from '../middleware/validation';
import { generalLimiter, paymentLimiter, freeTrialLimiter, contactLimiter } from '../middleware/rateLimiter';

export function createRoutes(pool: Pool): Router {
  const router = Router();
  const paymentController = createPaymentController(pool);
  const emailController = createEmailController(pool);

  // Apply general rate limiter to all API routes
  router.use(generalLimiter);

  // Health check
  router.get('/health', (_req, res) => {
    res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
  });

  // Payment routes — strict rate limiting
  router.post(
    '/payment/create-order',
    paymentLimiter,
    validateBody([
      { field: 'planId', required: true, validate: validatePlanId, message: 'Invalid plan selected' },
      { field: 'email', required: true, validate: (v: string) => validateEmail(v), message: 'Invalid email address' },
    ]),
    paymentController.createOrder.bind(paymentController)
  );

  router.post(
    '/payment/capture-order',
    paymentLimiter,
    validateBody([
      { field: 'orderId', required: true, message: 'Order ID is required' },
      { field: 'planId', required: true, validate: validatePlanId, message: 'Invalid plan selected' },
      { field: 'email', required: true, validate: (v: string) => validateEmail(v), message: 'Invalid email address' },
    ]),
    paymentController.captureOrder.bind(paymentController)
  );

  router.post(
    '/payment/free-trial',
    freeTrialLimiter,
    validateBody([
      { field: 'email', required: true, validate: (v: string) => validateEmail(v), message: 'Invalid email address' },
    ]),
    paymentController.freeTrial.bind(paymentController)
  );

  // PayPal webhook (no auth — verified by signature)
  router.post(
    '/payment/webhook',
    paymentController.handleWebhook.bind(paymentController)
  );

  // Contact route
  router.post(
    '/email/contact',
    contactLimiter,
    validateBody([
      { field: 'email', required: true, validate: (v: string) => validateEmail(v), message: 'Invalid email address' },
      { field: 'message', required: true, message: 'Message is required' },
    ]),
    emailController.contact
  );

  // Admin routes
  const adminRoutes = createAdminRoutes(pool);
  router.use('/admin', adminRoutes);

  return router;
}
