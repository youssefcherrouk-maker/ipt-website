import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { sendContactNotification } from '../services/emailService';
import { logger } from '../utils/logger';

export function createEmailController(pool: Pool) {
  return {
    /**
     * Handles contact form submissions
     * POST /api/email/contact
     * Body: { email: string, message: string }
     */
    async contact(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { email, message } = req.body;

        // Save to database
        try {
          await pool.query(
            'INSERT INTO contacts (email, message) VALUES ($1, $2)',
            [email, message]
          );
          logger.info('Contact message saved to DB', { email });
        } catch (dbError) {
          logger.error('Failed to save contact to DB', {
            error: dbError instanceof Error ? dbError.message : 'Unknown error',
          });
        }

        // Try email notification (best-effort)
        sendContactNotification(email, message).catch((err) => {
          logger.warn('Contact email notification failed', {
            email,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        });

        res.json({
          success: true,
          message: 'Message sent successfully',
        });
      } catch (error) {
        next(error);
      }
    },
  };
}
