import { Pool } from 'pg';

/**
 * TrialRequest model schema:
 * - id: UUID primary key
 * - customer_email: Email of the trial user
 * - status: Trial status (pending, activated, expired)
 * - credentials_sent: Whether trial credentials were sent
 * - activated_at: When the trial was activated
 * - expires_at: When the trial expires (24h after activation)
 * - created_at: Timestamp of request
 */

export interface TrialRequest {
  id: string;
  customer_email: string;
  status: 'pending' | 'activated' | 'expired';
  credentials_sent: boolean;
  activated_at: Date | null;
  expires_at: Date | null;
  created_at: Date;
}

export class TrialRequestModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(email: string): Promise<TrialRequest> {
    const { rows } = await this.pool.query(
      `INSERT INTO trial_requests (customer_email, status)
       VALUES ($1, 'pending')
       RETURNING *`,
      [email]
    );
    return rows[0];
  }

  async findByEmail(email: string): Promise<TrialRequest | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM trial_requests WHERE customer_email = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  async activate(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE trial_requests
       SET status = 'activated', activated_at = NOW(), expires_at = NOW() + INTERVAL '24 hours'
       WHERE id = $1`,
      [id]
    );
  }

  async markCredentialsSent(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE trial_requests SET credentials_sent = true WHERE id = $1',
      [id]
    );
  }

  async getAll(): Promise<TrialRequest[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM trial_requests ORDER BY created_at DESC'
    );
    return rows;
  }
}
