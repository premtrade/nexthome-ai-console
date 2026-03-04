/**
 * Lead Scoring API Client
 * Handles communication with n8n lead scoring workflow
 */

export interface LeadSubmissionRequest {
  name: string;
  email: string;
  phone?: string;
  budget_min: string | number;
  budget_max: string | number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  must_haves?: string;
  timeline: string;
  source: string;
  contact_method: string;
  tenant_id: string;
}

export interface PropertyMatch {
  property_id: string;
  address?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  match_score: number;
  match_reasons: string[];
  mismatch_reasons: string[];
}

export interface LeadScoringResponse {
  success: boolean;
  lead: {
    id: string;
    name: string;
    email: string;
    lead_score: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  matched_properties: PropertyMatch[];
  next_actions: string[];
  timestamp: string;
}

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 
  'http://localhost:5678/webhook/score-lead';

/**
 * Submit a new lead for scoring and property matching
 */
export async function submitLeadForScoring(
  leadData: LeadSubmissionRequest
): Promise<LeadScoringResponse> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error(
        `Lead scoring API error: ${response.status} ${response.statusText}`
      );
    }

    const data: LeadScoringResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Lead submission failed:', error);
    throw error;
  }
}

/**
 * Fetch lead details by ID
 */
export async function getLeadById(
  leadId: string,
  tenantId: string
): Promise<any> {
  try {
    const response = await fetch(
      `/api/leads/${leadId}?tenant_id=${tenantId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch lead: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get lead:', error);
    throw error;
  }
}

/**
 * Fetch property matches for a lead
 */
export async function getLeadPropertyMatches(
  leadId: string,
  tenantId: string
): Promise<PropertyMatch[]> {
  try {
    const response = await fetch(
      `/api/leads/${leadId}/matches?tenant_id=${tenantId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get property matches:', error);
    throw error;
  }
}

/**
 * Update lead interest in a property
 */
export async function updatePropertyInterest(
  leadId: string,
  propertyId: string,
  interestLevel: 'high' | 'medium' | 'low' | 'no_interest'
): Promise<void> {
  try {
    const response = await fetch(
      `/api/leads/${leadId}/matches/${propertyId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interest_level: interestLevel }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update interest: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to update property interest:', error);
    throw error;
  }
}

/**
 * Send AI-powered follow-up message to lead
 */
export async function sendFollowUpMessage(
  leadId: string,
  tenantId: string,
  messageTemplate: 'initial' | 'follow_properties' | 'schedule_showing' | 'custom',
  customMessage?: string
): Promise<{ success: boolean; message_id: string; sent_at: string }> {
  try {
    const response = await fetch(
      `/api/leads/${leadId}/followup`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          template: messageTemplate,
          custom_message: customMessage,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send follow-up: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send follow-up message:', error);
    throw error;
  }
}

/**
 * Get lead conversation history
 */
export async function getLeadConversation(
  leadId: string,
  tenantId: string
): Promise<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>> {
  try {
    const response = await fetch(
      `/api/leads/${leadId}/conversation?tenant_id=${tenantId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get conversation history:', error);
    throw error;
  }
}

/**
 * Schedule a property viewing
 */
export async function schedulePropertyViewing(
  leadId: string,
  propertyId: string,
  tenantId: string,
  preferredDateTime: string
): Promise<{ success: boolean; confirmation_id: string; scheduled_time: string }> {
  try {
    const response = await fetch(
      `/api/leads/${leadId}/schedule-viewing`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          tenant_id: tenantId,
          preferred_date_time: preferredDateTime,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to schedule viewing: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to schedule viewing:', error);
    throw error;
  }
}

/**
 * Get all leads for a tenant (agent/admin view)
 */
export async function getLeadsList(
  tenantId: string,
  filters?: {
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{
  leads: Lead[];
  total: number;
  limit: number;
  offset: number;
}> {
  try {
    const params = new URLSearchParams({
      tenant_id: tenantId,
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.limit && { limit: filters.limit.toString() }),
      ...(filters?.offset && { offset: filters.offset.toString() }),
    });

    const response = await fetch(
      `/api/leads?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch leads: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get leads list:', error);
    throw error;
  }
}

/**
 * Update lead information
 */
export async function updateLead(
  leadId: string,
  tenantId: string,
  updates: Partial<LeadSubmissionRequest>
): Promise<any> {
  try {
    const response = await fetch(
      `/api/leads/${leadId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          ...updates,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update lead: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update lead:', error);
    throw error;
  }
}

interface Lead {
  id: string;
  name: string;
  email: string;
  lead_score: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status?: string;
}
