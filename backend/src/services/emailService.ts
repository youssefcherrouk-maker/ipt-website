import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  adminEmail: string;
}

function getConfig(): EmailConfig {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@iptvpremium.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@iptvpremium.com',
  };
}

function createTransporter(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

export async function sendPaymentConfirmationToAdmin(
  customerEmail: string,
  planName: string,
  amount: string,
  orderId: string
): Promise<boolean> {
  const config = getConfig();
  const transporter = createTransporter(config);

  const subject = `[IPTV Premium] New Payment Received - ${planName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .field { margin-bottom: 20px; }
    .field-label { font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
    .field-value { font-size: 16px; color: #1e293b; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #16a34a; }
    .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 New Payment Received</h1>
    </div>
    <div class="content">
      <p style="color: #475569; font-size: 16px;">A customer has successfully completed a payment.</p>
      <div class="divider"></div>
      <div class="field">
        <div class="field-label">Customer Email</div>
        <div class="field-value">${customerEmail}</div>
      </div>
      <div class="field">
        <div class="field-label">Package</div>
        <div class="field-value">${planName}</div>
      </div>
      <div class="field">
        <div class="field-label">Amount</div>
        <div class="field-value">${amount}</div>
      </div>
      <div class="field">
        <div class="field-label">Order ID</div>
        <div class="field-value" style="font-family: monospace; font-size: 14px;">${orderId}</div>
      </div>
      <div class="field">
        <div class="field-label">Status</div>
        <div><span class="badge badge-success">COMPLETED</span></div>
      </div>
      <div class="divider"></div>
      <p style="color: #475569;">
        <strong>Action Required:</strong> Please prepare IPTV credentials for this customer and send them to the email above.
      </p>
    </div>
    <div class="footer">
      <p>IPTV Premium - Automated Notification</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: config.from,
      to: config.adminEmail,
      subject,
      html,
    });
    logger.info('Payment confirmation email sent to admin', { customerEmail, planName, orderId });
    return true;
  } catch (error) {
    logger.error('Failed to send payment confirmation email', {
      customerEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

export async function sendTrialRequestToAdmin(
  customerEmail: string
): Promise<boolean> {
  const config = getConfig();
  const transporter = createTransporter(config);

  const subject = '[IPTV Premium] New Free Trial Request';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .field { margin-bottom: 20px; }
    .field-label { font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
    .field-value { font-size: 16px; color: #1e293b; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-warning { background: #fef3c7; color: #d97706; }
    .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Free Trial Request</h1>
    </div>
    <div class="content">
      <p style="color: #475569; font-size: 16px;">A user has signed up for a free trial.</p>
      <div class="divider"></div>
      <div class="field">
        <div class="field-label">Customer Email</div>
        <div class="field-value">${customerEmail}</div>
      </div>
      <div class="field">
        <div class="field-label">Plan</div>
        <div class="field-value">24 Hours Free Trial</div>
      </div>
      <div class="field">
        <div class="field-label">Status</div>
        <div><span class="badge badge-warning">PENDING ACTIVATION</span></div>
      </div>
      <div class="divider"></div>
      <p style="color: #475569;">
        <strong>Action Required:</strong> Please activate the free trial for this customer and send the access credentials to the email above.
      </p>
    </div>
    <div class="footer">
      <p>IPTV Premium - Automated Notification</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: config.from,
      to: config.adminEmail,
      subject,
      html,
    });
    logger.info('Trial request email sent to admin', { customerEmail });
    return true;
  } catch (error) {
    logger.error('Failed to send trial request email', {
      customerEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

export async function sendCustomerPurchaseConfirmation(
  customerEmail: string,
  planName: string
): Promise<boolean> {
  const config = getConfig();
  const transporter = createTransporter(config);

  const subject = 'Welcome to IPTV Premium - Payment Confirmed';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; }
    .btn { display: inline-block; padding: 12px 24px; background: #7c3aed; color: #fff; text-decoration: none; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to IPTV Premium!</h1>
    </div>
    <div class="content">
      <p style="color: #475569; font-size: 16px;">Thank you for your purchase!</p>
      <div class="info-box">
        <p style="margin: 0; color: #16a34a; font-weight: 600;">${planName}</p>
        <p style="margin: 8px 0 0; color: #475569;">Your payment has been confirmed and your order is being processed.</p>
      </div>
      <p style="color: #475569;">You will receive your IPTV login credentials within the next 24 hours. Our team is preparing your account manually.</p>
      <p style="color: #475569;">If you have any questions, please contact our support team at <a href="mailto:support@iptvpremium.com" style="color: #7c3aed;">support@iptvpremium.com</a>.</p>
    </div>
    <div class="footer">
      <p>IPTV Premium - Premium IPTV Streaming Service</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: config.from,
      to: customerEmail,
      subject,
      html,
    });
    logger.info('Purchase confirmation email sent to customer', { customerEmail, planName });
    return true;
  } catch (error) {
    logger.error('Failed to send customer purchase email', {
      customerEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

export async function sendContactNotification(
  customerEmail: string,
  message: string
): Promise<boolean> {
  const config = getConfig();
  const transporter = createTransporter(config);

  const subject = `[IPTV Premium] New Contact Message from ${customerEmail}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .field { margin-bottom: 20px; }
    .field-label { font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
    .field-value { font-size: 16px; color: #1e293b; }
    .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 8px; }
    .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ New Contact Message</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">From</div>
        <div class="field-value">${customerEmail}</div>
      </div>
      <div class="field">
        <div class="field-label">Message</div>
        <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
    <div class="footer">
      <p>IPTV Premium - Automated Notification</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: config.from,
      to: config.adminEmail,
      subject,
      html,
    });
    logger.info('Contact notification email sent to admin', { customerEmail });
    return true;
  } catch (error) {
    logger.error('Failed to send contact notification email', {
      customerEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
