-- Migration to create properties and ai_errors tables for the "Next Home" project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(15, 2),
    parish TEXT,
    bedrooms INT,
    bathrooms INT,
    lot_size NUMERIC(15, 2),
    amenities JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    assigned_agent_id UUID,
    seo_description TEXT,
    meta_title TEXT,
    meta_description TEXT,
    buyer_persona TEXT,
    competitiveness TEXT,
    ai_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for multi-tenant performance and triggered polling
CREATE INDEX idx_properties_tenant_ai_processed ON properties(tenant_id, ai_processed) WHERE status = 'active';
CREATE INDEX idx_properties_lookup ON properties(parish, bedrooms, status, tenant_id);

-- Error Logging Table
CREATE TABLE IF NOT EXISTS ai_errors (
    id SERIAL PRIMARY KEY,
    workflow_id TEXT,
    node_name TEXT,
    property_id UUID,
    tenant_id UUID,
    error_message TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
