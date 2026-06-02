import { Pool } from 'pg';

/**
 * Payment model schema:
 * - id: UUID primary key
 * - customer_email: Email of the paying customer
 * - plan_id: The purchased plan identifier
 * - plan_name: Human-readable plan name
 * - amount: Payment amount with currency
 * - paypal_order_id: PayPal order reference
 * - paypal_capture_id: PayPal capture reference
 * - status: Payment status (completed, pending, failed)
 * - credentials_sent: Whether IPTV credentials were sent to customer
 * - created_at: Timestamp of payment
 * - updated_at: Last update timestamp
 */

export interface Payment {
  id: string;
  customer_email: string;
  plan_id: string;
  plan_name: string;
  amount: string;
  paypal_order_id: string;
  paypal_capture_id: string;
  status: 'completed' | 'pending' | 'failed';
  credentials_sent: boolean;
  created_at: Date;
  updated_at: Date;
}

export class PaymentModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'credentials_sent'>): Promise<Payment> {
    const { rows } = await this.pool.query(
      `INSERT INTO payments (customer_email, plan_id, plan_name, amount, paypal_order_id, paypal_capture_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        payment.customer_email,
        payment.plan_id,
        payment.plan_name,
        payment.amount,
        payment.paypal_order_id,
        payment.paypal_capture_id,
        payment.status,
      ]
    );
    return rows[0];
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM payments WHERE paypal_order_id = $1',
      [orderId]
    );
    return rows[0] || null;
  }

  async markCredentialsSent(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE payments SET credentials_sent = true, updated_at = NOW() WHERE id = $1',
      [id]
    );
  }

  async getAll(): Promise<Payment[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM payments ORDER BY created_at DESC'
    );
    return rows;
  }
}
