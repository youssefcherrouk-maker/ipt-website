import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import * as paypalService from '../services/paypal';
import { sendPaymentConfirmationToAdmin, sendTrialRequestToAdmin, sendCustomerPurchaseConfirmation } from '../services/emailService';
import { PaymentModel } from '../models/Payment';
import { TrialRequestModel } from '../models/TrialRequest';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface PlanInfo {
  id: string;
  name: string;
}

const PLANS: Record<string, PlanInfo> = {
  free: { id: 'free', name: '24 Hours Free Trial' },
  month1: { id: 'month1', name: '1 Month Subscription' },
  month6: { id: 'month6', name: '6 Months Subscription' },
  year1: { id: 'year1', name: '1 Year Subscription' },
};

const processedIdempotencyKeys = new Map<string, { status: string; data?: unknown }>();

export function createPaymentController(pool: Pool) {
  const paymentModel = new PaymentModel(pool);
  const trialModel = new TrialRequestModel(pool);

  const checkIdempotency = (key: string): boolean => {
    if (!key) return false;
    if (processedIdempotencyKeys.has(key)) {
      logger.info('Idempotent request detected', { key });
      return true;
    }
    processedIdempotencyKeys.set(key, { status: 'processing' });
    setTimeout(() => processedIdempotencyKeys.delete(key), 60 * 60 * 1000);
    return false;
  };

  return {
    async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { planId, idempotencyKey } = req.body;

        if (planId === 'free') {
          throw new AppError('Free trial does not require payment', 400);
        }

        if (idempotencyKey && checkIdempotency(idempotencyKey)) {
          res.json({ success: true, data: { orderID: null, cached: true } });
          return;
        }

        const plan = PLANS[planId];
        if (!plan) {
          throw new AppError('Invalid plan selected', 400);
        }

        const config = paypalService.getPlanConfig(planId);
        if (!config) {
          throw new AppError('Plan configuration not found', 500);
        }

        const order = await paypalService.createOrder(planId);

        res.json({
          success: true,
          data: { orderID: order.id },
        });
      } catch (error) {
        next(error);
      }
    },

    async captureOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { orderId, planId, email } = req.body;

        const plan = PLANS[planId];
        if (!plan) {
          throw new AppError('Invalid plan selected', 400);
        }

        const existing = await paymentModel.findByOrderId(orderId);
        if (existing) {
          logger.info('Duplicate capture attempt blocked', { orderId });
          res.json({
            success: true,
            data: { status: 'already_completed' },
          });
          return;
        }

        const capture = await paypalService.captureOrder(orderId);

        const captureDetails = capture.purchase_units[0]?.payments?.captures[0];
        const amount = captureDetails
          ? `${captureDetails.amount.value} ${captureDetails.amount.currency_code}`
          : 'Unknown';

        await paymentModel.create({
          customer_email: email,
          plan_id: planId,
          plan_name: plan.name,
          amount,
          paypal_order_id: orderId,
          paypal_capture_id: captureDetails?.id || '',
          status: 'completed',
        });

        await sendPaymentConfirmationToAdmin(email, plan.name, amount, orderId);
        await sendCustomerPurchaseConfirmation(email, plan.name);

        logger.info('Payment captured successfully', { orderId, planId, email, amount });

        res.json({
          success: true,
          data: { status: capture.status },
        });
      } catch (error) {
        next(error);
      }
    },

    async freeTrial(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { email } = req.body;

        const existing = await trialModel.findByEmail(email);
        if (existing && existing.status !== 'expired') {
          logger.info('Duplicate trial request blocked', { email });
          res.json({
            success: true,
            message: 'A free trial was already requested for this email. Please check your inbox or contact support.',
          });
          return;
        }

        const trial = await trialModel.create(email);

        await sendTrialRequestToAdmin(email);

        logger.info('Free trial request created', { email, trialId: trial.id });

        res.json({
          success: true,
          message: 'Free trial request submitted successfully',
        });
      } catch (error) {
        next(error);
      }
    },

    async handleWebhook(req: Request, res: Response, _next: NextFunction): Promise<void> {
      try {
        const signatureValid = await paypalService.verifyWebhookSignature(
          req.headers as Record<string, string | string[] | undefined>,
          JSON.stringify(req.body)
        );

        if (!signatureValid) {
          logger.warn('Invalid PayPal webhook signature');
          res.status(401).json({ success: false });
          return;
        }

        const event = req.body as paypalService.PayPalWebhookEvent;

        switch (event.event_type) {
          case 'PAYMENT.CAPTURE.REFUNDED':
          case 'PAYMENT.CAPTURE.DENIED':
            if (event.resource?.id) {
              const payment = await paymentModel.findByOrderId(event.resource.id);
              if (payment) {
                logger.info('Payment status updated via webhook', {
                  orderId: event.resource.id,
                  event: event.event_type,
                });
              }
            }
            break;
          default:
            logger.debug('Unhandled webhook event', { eventType: event.event_type });
        }

        res.json({ success: true });
      } catch (error) {
        logger.error('Webhook processing failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        res.status(500).json({ success: false });
      }
    },
  };
}
