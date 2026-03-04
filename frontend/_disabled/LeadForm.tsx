'use client';

import { useState } from 'react';
import { submitLeadForScoring, LeadScoringResponse } from '@/lib/lead-scoring-api';
import styles from '@/styles/lead-form.module.css';

interface LeadFormProps {
  tenantId: string;
  onSubmitSuccess?: (response: LeadScoringResponse) => void;
}

export function LeadForm({ tenantId, onSubmitSuccess }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget_min: '',
    budget_max: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    must_haves: '',
    timeline: 'Want to close within 90 days',
    source: 'website',
    contact_method: 'email',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await submitLeadForScoring({
        ...formData,
        tenant_id: tenantId,
      });

      setSubmitted(true);
      onSubmitSuccess?.(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit lead'
      );
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.successMessage}>
        <div className={styles.checkmark}>✓</div>
        <h2>Thank You!</h2>
        <p>Your information has been received. We'll contact you shortly with personalized property recommendations.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.leadForm}>
      <div className={styles.formHeader}>
        <h2>Find Your Perfect Property</h2>
        <p>Tell us what you're looking for and we'll match you with ideal homes</p>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Personal Information Section */}
      <fieldset className={styles.fieldset}>
        <legend>Personal Information</legend>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Smith"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(415) 555-1234"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contact_method">Preferred Contact Method</label>
            <select
              id="contact_method"
              name="contact_method"
              value={formData.contact_method}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="email">Email</option>
              <option value="phone">Phone Call</option>
              <option value="text">Text Message</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Budget & Location Section */}
      <fieldset className={styles.fieldset}>
        <legend>Budget & Location</legend>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="budget_min">Minimum Budget *</label>
            <div className={styles.inputPrefix}>
              <span>$</span>
              <input
                type="number"
                id="budget_min"
                name="budget_min"
                value={formData.budget_min}
                onChange={handleChange}
                placeholder="400000"
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="budget_max">Maximum Budget *</label>
            <div className={styles.inputPrefix}>
              <span>$</span>
              <input
                type="number"
                id="budget_max"
                name="budget_max"
                value={formData.budget_max}
                onChange={handleChange}
                placeholder="800000"
                required
                className={styles.input}
              />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Preferred Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="San Francisco, CA"
            required
            className={styles.input}
          />
        </div>
      </fieldset>

      {/* Property Preferences Section */}
      <fieldset className={styles.fieldset}>
        <legend>Property Preferences</legend>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="bedrooms">Minimum Bedrooms</label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              placeholder="3"
              min="1"
              max="10"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bathrooms">Minimum Bathrooms</label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              placeholder="2"
              min="1"
              max="10"
              step="0.5"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="must_haves">Must-Have Features</label>
          <textarea
            id="must_haves"
            name="must_haves"
            value={formData.must_haves}
            onChange={handleChange}
            placeholder="E.g., Updated kitchen, parking, walkable neighborhood, modern appliances"
            rows={4}
            className={styles.textarea}
          />
          <small>List specific features that are important to you</small>
        </div>
      </fieldset>

      {/* Timeline Section */}
      <fieldset className={styles.fieldset}>
        <legend>Timeline & Purchase Plan</legend>

        <div className={styles.formGroup}>
          <label htmlFor="timeline">When do you want to close?</label>
          <select
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="Immediate need (ASAP)">Immediate need (ASAP)</option>
            <option value="Want to close within 30 days">Within 30 days</option>
            <option value="Want to close within 60 days">Within 60 days</option>
            <option value="Want to close within 90 days">Within 90 days</option>
            <option value="Want to close within 6 months">Within 6 months</option>
            <option value="Just exploring options">Just exploring</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="source">How did you find us?</label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="website">Our Website</option>
            <option value="social_media">Social Media</option>
            <option value="referral">Referral</option>
            <option value="search_engine">Search Engine</option>
            <option value="advertisement">Advertisement</option>
            <option value="other">Other</option>
          </select>
        </div>
      </fieldset>

      {/* Submit Button */}
      <div className={styles.submitSection}>
        <button
          type="submit"
          disabled={loading}
          className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
        >
          {loading ? (
            <>
              <span className={styles.spinner}>⟳</span>
              Finding Perfect Matches...
            </>
          ) : (
            '🔍 Find Properties for Me'
          )}
        </button>
        <p className={styles.privacyNote}>
          Your information is secure and will only be used to find properties that match your criteria.
        </p>
      </div>
    </form>
  );
}
