-- ==============================================================================
-- ILLUMINATE WORKSHOP PLATFORM - DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- Target: Supabase / PostgreSQL 14+
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    college VARCHAR(255) NOT NULL,
    department VARCHAR(150) NOT NULL,
    year_of_study VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    expectations TEXT,
    referral_code VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'pending_payment', 'cancelled'
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid', 'exempt', 'refunded'
    payment_id VARCHAR(100),
    synced_to_sheets BOOLEAN NOT NULL DEFAULT FALSE,
    sheets_synced_at TIMESTAMPTZ,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast lookups and duplicate checks
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations (email);
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations (phone);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_college ON registrations (college);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations (status);

-- 2. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ADMIN', -- 'SUPER_ADMIN', 'ADMIN', 'VIEWER'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g. 'ADMIN_LOGIN', 'EXPORT_EXCEL', 'SYNC_SHEETS', 'UPDATE_STATUS', 'DELETE_REGISTRATION'
    target VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- 4. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON registrations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER update_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- Row Level Security (RLS) policies
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous registration insertion only
CREATE POLICY "Allow public insert to registrations"
    ON registrations FOR INSERT
    WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service_role full access to registrations"
    ON registrations FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service_role full access to admins"
    ON admins FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service_role full access to audit_logs"
    ON audit_logs FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service_role full access to system_settings"
    ON system_settings FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');
