-- ============================================================
-- IPTV Premium - Database Schema
-- PostgreSQL
-- ============================================================

-- Create database (run this separately as superuser)
-- CREATE DATABASE iptv_premium;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Payments Table
-- Stores all successful payment records
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email VARCHAR(255) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  amount VARCHAR(50) NOT NULL,
  paypal_order_id VARCHAR(255) NOT NULL UNIQUE,
  paypal_capture_id VARCHAR(255) NOT NULL DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  credentials_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by PayPal order ID
CREATE INDEX IF NOT EXISTS idx_payments_paypal_order_id ON payments(paypal_order_id);

-- Index for customer email lookups
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Trial Requests Table
-- Stores all free trial requests
-- ============================================================
CREATE TABLE IF NOT EXISTS trial_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  credentials_sent BOOLEAN NOT NULL DEFAULT FALSE,
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for customer email lookups
CREATE INDEX IF NOT EXISTS idx_trial_requests_customer_email ON trial_requests(customer_email);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_trial_requests_created_at ON trial_requests(created_at DESC);

-- ============================================================
-- Customers Table (optional, for future use)
-- Stores customer information for credential management
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  whatsapp VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- IPTV Credentials Table
-- Stores credentials that will be sent to customers
-- ============================================================
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  trial_id UUID REFERENCES trial_requests(id) ON DELETE SET NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  server_url VARCHAR(500),
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credentials_customer_id ON credentials(customer_id);
CREATE INDEX IF NOT EXISTS idx_credentials_is_active ON credentials(is_active);

-- ============================================================
-- Contacts Table (optional)
-- Stores contact form submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- ============================================================
-- Admin Audit Log Table
-- Stores immutable audit trail of all admin actions
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);

-- ============================================================
-- Token Blacklist Table
-- Stores revoked JWT tokens for session invalidation
-- ============================================================
CREATE TABLE IF NOT EXISTS token_blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_jti VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(token_jti);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);
