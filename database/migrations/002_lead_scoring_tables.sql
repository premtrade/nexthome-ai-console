-- Lead Management Tables for Lead Scoring Pipeline

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Property preferences
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  location VARCHAR(255),
  bedrooms INTEGER,
  bathrooms DECIMAL(5, 1),
  must_haves TEXT,
  
  -- Lead scoring
  lead_score INTEGER DEFAULT 0,
  purchase_likelihood DECIMAL(5, 2), -- 0-100
  budget_verification VARCHAR(50),
  seriousness VARCHAR(50),
  timeline_urgency VARCHAR(50),
  priority VARCHAR(50) DEFAULT 'MEDIUM',
  
  -- Preferences
  contact_method VARCHAR(50), -- email, phone, text, call
  timeline VARCHAR(100),
  source VARCHAR(100), -- website, social, referral, etc.
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'NEW', -- NEW, QUALIFIED, CONTACTED, VIEWING, NEGOTIATING, CLOSED, LOST
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  contacted_at TIMESTAMP,
  
  CONSTRAINT fk_leads_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create lead property matches
CREATE TABLE IF NOT EXISTS lead_property_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Match scoring
  match_score DECIMAL(5, 2), -- 0-100
  match_reasons JSONB, -- Array of match reasons
  mismatch_reasons JSONB, -- Array of reasons not perfect
  
  -- Status
  shown_at TIMESTAMP,
  interest_level VARCHAR(50), -- high, medium, low, no_interest
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_match_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Create CRM tasks for agent follow-up
CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Task details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  action_type VARCHAR(50), -- call, email, text, showing, followup, etc.
  
  -- Assignment & priority
  assigned_to VARCHAR(255), -- agent/user ID
  priority VARCHAR(50) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, COMPLETED, CANCELLED
  due_date TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  
  -- Follow-up chain
  parent_task_id UUID REFERENCES crm_tasks(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_task_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create lead scoring history (audit trail)
CREATE TABLE IF NOT EXISTS lead_scoring_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Scoring details
  old_lead_score INTEGER,
  new_lead_score INTEGER,
  scoring_factors JSONB, -- What influenced the score
  ai_response JSONB, -- Full AI response data
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_history_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_leads_tenant ON leads(tenant_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_lead_score ON leads(lead_score DESC);

CREATE INDEX idx_matches_lead ON lead_property_matches(lead_id);
CREATE INDEX idx_matches_property ON lead_property_matches(property_id);
CREATE INDEX idx_matches_score ON lead_property_matches(match_score DESC);

CREATE INDEX idx_tasks_tenant ON crm_tasks(tenant_id);
CREATE INDEX idx_tasks_lead ON crm_tasks(lead_id);
CREATE INDEX idx_tasks_status ON crm_tasks(status);
CREATE INDEX idx_tasks_priority ON crm_tasks(priority);
CREATE INDEX idx_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX idx_tasks_assigned ON crm_tasks(assigned_to);

CREATE INDEX idx_scoring_lead ON lead_scoring_history(lead_id);
CREATE INDEX idx_scoring_created ON lead_scoring_history(created_at DESC);
