'use client';

import { useEffect, useState } from 'react';
import { getLeadsList, LeadScoringResponse } from '@/lib/lead-scoring-api';
import styles from '@/styles/leads-dashboard.module.css';

interface LeadItem {
  id: string;
  name: string;
  email: string;
  lead_score: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  phone?: string;
  location?: string;
  status?: string;
  created_at?: string;
}

interface DashboardProps {
  tenantId: string;
}

export default function LeadsDashboard({ tenantId }: DashboardProps) {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');

  useEffect(() => {
    fetchLeads();
  }, [tenantId]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeadsList(tenantId, {
        priority: filter === 'ALL' ? undefined : filter,
        limit: 100,
        offset: 0,
      });
      setLeads(result.leads as LeadItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    // Sort leads
    const sorted = [...leads].sort((a, b) => {
      switch (newSort) {
        case 'score':
          return b.lead_score - a.lead_score;
        case 'date':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    setLeads(sorted);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '#e74c3c';
      case 'MEDIUM':
        return '#f39c12';
      case 'LOW':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 80) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    return 'LOW';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>💼 Leads Dashboard</h1>
        <p>Manage and score incoming property leads</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label>Filter by Priority:</label>
          <div className={styles.filterButtons}>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
              <button
                key={priority}
                className={`${styles.filterBtn} ${filter === priority ? styles.active : ''}`}
                onClick={() => handleFilterChange(priority as any)}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sortGroup}>
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={e => handleSortChange(e.target.value as typeof sortBy)}
            className={styles.sortSelect}
          >
            <option value="score">Score (High to Low)</option>
            <option value="date">Most Recent</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h3>No leads found</h3>
          <p>Start collecting leads to see them here</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.leadsTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Score</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className={styles.leadRow}>
                  <td className={styles.nameCell}>
                    <div className={styles.leadName}>{lead.name}</div>
                  </td>
                  <td>
                    <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  </td>
                  <td>
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                    ) : (
                      <span className={styles.notAvailable}>N/A</span>
                    )}
                  </td>
                  <td>{lead.location || 'Not specified'}</td>
                  <td>
                    <div className={styles.scoreContainer}>
                      <div className={styles.scoreBar}>
                        <div
                          className={styles.scoreBarFill}
                          style={{
                            width: `${lead.lead_score}%`,
                            backgroundColor: getPriorityColor(getPriorityLabel(lead.lead_score)),
                          }}
                        ></div>
                      </div>
                      <span className={styles.scoreText}>{lead.lead_score}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={styles.priorityBadge}
                      style={{
                        backgroundColor: getPriorityColor(lead.priority),
                      }}
                    >
                      {lead.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[lead.status?.toLowerCase() || 'new']}`}>
                      {lead.status || 'New'}
                    </span>
                  </td>
                  <td className={styles.dateCell}>{formatDate(lead.created_at)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.actionBtn} title="View Details">
                        👁️
                      </button>
                      <button className={styles.actionBtn} title="Send Message">
                        ✉️
                      </button>
                      <button className={styles.actionBtn} title="More">
                        ⋯
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Leads</div>
          <div className={styles.statValue}>{leads.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Hot Leads</div>
          <div className={styles.statValue} style={{ color: '#e74c3c' }}>
            {leads.filter(l => l.priority === 'HIGH').length}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Avg Score</div>
          <div className={styles.statValue}>
            {leads.length > 0
              ? Math.round(leads.reduce((sum, l) => sum + l.lead_score, 0) / leads.length)
              : 0}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Conversion Rate</div>
          <div className={styles.statValue}>
            {leads.length > 0
              ? Math.round(
                  (leads.filter(l => l.status === 'converted').length / leads.length) * 100
                )
              : 0}%
          </div>
        </div>
      </div>
    </div>
  );
}
