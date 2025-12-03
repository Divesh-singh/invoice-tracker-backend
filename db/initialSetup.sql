-- ============================
--   INVOICE MANAGEMENT SYSTEM DB SCHEMA
-- ============================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables (clean rebuild)
-- DANGER: THIS WILL DELETE ALL DATA, ONLY RUN IF WE NEED TO RESET THE DB(UNCOMMENT TO USE)
-- DROP TABLE IF EXISTS paid_bills CASCADE;
-- DROP TABLE IF EXISTS bills CASCADE;
-- DROP TABLE IF EXISTS "user" CASCADE;
-- DROP TABLE IF EXISTS user_type CASCADE;

-- ============================
-- USER TYPE TABLE
-- ============================
CREATE TABLE IF NOT EXISTS user_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    access_level INT NOT NULL CHECK (access_level IN (1, 2, 3))
);

-- Preload user types
INSERT INTO user_type (id, name, access_level) VALUES
(gen_random_uuid(), 'user', 1),
(gen_random_uuid(), 'admin', 2),
(gen_random_uuid(), 'superadmin', 3);

-- ============================
-- USER TABLE
-- ============================
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    usertypeid UUID NOT NULL REFERENCES user_type(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_update_timestamp
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================
-- BILLS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    bill_amount NUMERIC(12, 2) NOT NULL CHECK (bill_amount >= 0),
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    added_by UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    invoice_pdf_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- PAID BILLS TABLE (PAYMENTS)
-- ============================
CREATE TABLE IF NOT EXISTS paid_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    added_by UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    payment_invoice_url TEXT,
    amount_received NUMERIC(12, 2) NOT NULL CHECK (amount_received >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for report optimization
CREATE INDEX IF NOT EXISTS idx_paid_bills_bill_id ON paid_bills(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_created_at ON bills(created_at);