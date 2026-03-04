/**
 * AI Service
 * 
 * This service handles communication with n8n and Flowise for AI workflows:
 * 1. Property Enrichment: Generates SEO descriptions, meta titles, and buyer personas.
 * 2. Lead Scoring: Evaluates incoming leads and matches them with properties.
 */

export interface EnrichmentResult {
    seo_description: string;
    meta_title: string;
    meta_description: string;
    buyer_persona: string;
    competitiveness: string;
}

export interface LeadScoringResult {
    ai_score: number;
    ai_assessment: any;
    matched_property_ids: string[];
}

export interface ArbitrageOpportunity {
    property_id: string;
    delta_percent: number;
    motivation_score: number;
    rationale: string;
}

class AIService {
    private n8nWebhookUrl = process.env.N8N_ENRICHMENT_WEBHOOK_URL || '';
    private flowiseApiUrl = process.env.FLOWISE_LEAD_SCORING_API_URL || '';

    /**
     * Enriches a property using AI.
     * Hits an n8n webhook that coordinates with Flowise/LLMs.
     */
    async enrichProperty(propertyId: string, propertyData: any): Promise<EnrichmentResult> {
        console.log(`[AI Service] Enriching property: ${propertyId}`);

        try {
            if (!this.n8nWebhookUrl) {
                throw new Error('N8N_ENRICHMENT_WEBHOOK_URL not configured');
            }

            const response = await fetch(this.n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId, ...propertyData }),
            });

            if (!response.ok) throw new Error(`AI Enrichment failed: ${response.statusText}`);

            return await response.json();
        } catch (error) {
            console.warn('[AI Service] Enrichment failed, using fallback mock data:', error);
            // Mock data for demonstration purposes if AI is not wired up
            return {
                seo_description: `
                    🏆 LIFESTYLE: Experience the pinnacle of Caribbean living in this stunning ${propertyData.bedrooms}-bedroom sanctuary in ${propertyData.parish}. 
                    📈 INVESTMENT: Specifically curated for the ${propertyData.parish} market, this property represents a high-growth opportunity in a prime location.
                    📍 LOCATION: Ideally situated near local amenities and the coastline, offering both privacy and accessibility.
                `.trim(),
                meta_title: `Luxury ${propertyData.bedrooms}BR Home in ${propertyData.parish} | NextHome AI`,
                meta_description: `Premier real estate in ${propertyData.parish}. AI-verified property with high investment potential and luxury finishes.`,
                buyer_persona: 'Strategic Investor / Luxury Homeseeker',
                competitiveness: 'High'
            };
        }
    }

    /**
     * Scores a lead and matches it with properties.
     * Hits a Flowise API or n8n coordinator.
     */
    async scoreLead(leadData: any): Promise<LeadScoringResult> {
        console.log(`[AI Service] Scoring lead: ${leadData.email}`);

        try {
            console.log(`[AI Service] Calling Scoring Webhook: ${this.flowiseApiUrl}`);
            if (!this.flowiseApiUrl) {
                throw new Error('FLOWISE_LEAD_SCORING_API_URL not configured');
            }

            const response = await fetch(this.flowiseApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData),
            });

            if (!response.ok) throw new Error(`Lead scoring failed: ${response.statusText}`);

            return await response.json();
        } catch (error) {
            console.warn('[AI Service] Lead scoring failed, using fallback mock logic:', error);
            // Mock scoring logic
            const isHotLead = leadData.raw_inquiry?.toLowerCase().includes('urgent') ||
                leadData.raw_inquiry?.toLowerCase().includes('immediately');

            return {
                ai_score: isHotLead ? 85 : 45,
                ai_assessment: {
                    summary: isHotLead ? 'High intent lead, ready to move.' : 'Initial inquiry, needs nurturing.',
                    category: isHotLead ? 'Hot' : 'Warm'
                },
                matched_property_ids: [] // Would normally be populated via Vector Search in n8n/Flowise
            };
        }
    }

    /**
     * Finds properties that match a lead's specific "vibe" or requirements.
     * Uses semantic similarity (Vector Search) in n8n/Qdrant.
     */
    async matchPropertiesForLead(leadId: string, inquiry: string, properties: any[]): Promise<string[]> {
        console.log(`[AI Service] Finding matches for Lead ${leadId}`);

        try {
            // Integration Point: n8n workflow for Qdrant Vector Search
            // const res = await fetch(process.env.N8N_MATCHING_WEBHOOK_URL, ...);
            // return (await res.json()).propertyIds;

            // Mock implementation: Simple keyword matching for demo
            const keywords = inquiry.toLowerCase().split(' ');
            const matched = properties
                .map(p => {
                    let score = 0;
                    const text = (p.title + ' ' + (p.description || '') + ' ' + (p.seo_description || '')).toLowerCase();
                    keywords.forEach(k => { if (k.length > 3 && text.includes(k)) score++; });
                    return { id: p.id, score };
                })
                .filter(p => p.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map(p => p.id);

            return matched;
        } catch (error) {
            console.error('[AI Service] Matching failed:', error);
            return [];
        }
    }

    /**
     * Scans the market for "Arbitrage" opportunities.
     * Looks for underpriced properties and motivated seller language.
     */
    async detectArbitrageOpportunities(properties: any[]): Promise<ArbitrageOpportunity[]> {
        console.log(`[AI Service] Running arbitrage analysis on ${properties.length} properties`);

        try {
            // Group by parish to calculate averages
            const parishAverages: Record<string, number> = {};
            const parishCounts: Record<string, number> = {};

            properties.forEach(p => {
                const parish = p.parish || 'Other';
                const price = parseFloat(p.price || '0');
                if (price > 0) {
                    parishAverages[parish] = (parishAverages[parish] || 0) + price;
                    parishCounts[parish] = (parishCounts[parish] || 0) + 1;
                }
            });

            const results: ArbitrageOpportunity[] = [];

            properties.forEach(p => {
                const parish = p.parish || 'Other';
                const price = parseFloat(p.price || '0');
                const avg = parishCounts[parish] ? parishAverages[parish] / parishCounts[parish] : 0;

                if (price > 0 && avg > 0) {
                    const delta = ((avg - price) / avg) * 100;
                    const desc = (p.description || '').toLowerCase();

                    // Motivation analysis
                    let motivation = 0;
                    if (desc.includes('urgent')) motivation += 30;
                    if (desc.includes('must sell')) motivation += 40;
                    if (desc.includes('motivated')) motivation += 20;
                    if (desc.includes('reduced')) motivation += 25;
                    if (delta > 20) motivation += 15;

                    if (delta > 10 || motivation > 50) {
                        results.push({
                            property_id: p.id,
                            delta_percent: Math.round(delta),
                            motivation_score: Math.min(motivation, 100),
                            rationale: delta > 15
                                ? `Priced ${Math.round(delta)}% below ${parish} average.`
                                : `High seller motivation detected in listing description.`
                        });
                    }
                }
            });

            return results.sort((a, b) => (b.delta_percent + b.motivation_score) - (a.delta_percent + a.motivation_score));
        } catch (error) {
            console.error('[AI Service] Arbitrage detection failed:', error);
            return [];
        }
    }
}

export const aiService = new AIService();
