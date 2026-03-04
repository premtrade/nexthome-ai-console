-- Migration to create leads table for AI lead scoring and matching

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    raw_inquiry TEXT,
    ai_score INTEGER DEFAULT 0,
    ai_assessment JSONB DEFAULT '{}'::jsonb,
    matched_property_ids UUID[] DEFAULT '{}'::uuid[],
    status TEXT DEFAULT 'new', -- new, contacted, qualified, lost
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for lead lookups and status filtering
CREATE INDEX idx_leads_tenant_status ON leads(tenant_id, status);
CREATE INDEX idx_leads_email ON leads(email);
