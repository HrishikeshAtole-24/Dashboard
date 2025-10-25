import { useState, useEffect } from 'react';
import { goalsAPI } from '../utils/api';
import { ChartBarIcon, CalendarIcon, ArrowLeftIcon } from './icons';

export default function GoalConversions({ goalId, goalName, onBack }) {
  const [conversions, setConversions] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ limit: 50, offset: 0, hasMore: false });

  useEffect(() => {
    if (goalId) {
      loadConversions();
    }
  }, [goalId, pagination.offset]);

  const loadConversions = async () => {
    try {
      setLoading(true);
      const response = await goalsAPI.getConversions(goalId, {
        limit: pagination.limit,
        offset: pagination.offset
      });
      
      setConversions(response.conversions || []);
      setStats(response.stats || []);
      setPagination(prev => ({
        ...prev,
        hasMore: response.pagination?.has_more || false
      }));
    } catch (error) {
      console.error('Error loading conversions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatValue = (value) => {
    return parseFloat(value || 0).toFixed(2);
  };

  const nextPage = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const prevPage = () => {
    setPagination(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit)
    }));
  };

  if (loading && conversions.length === 0) {
    return (
      <div className="conversions-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading conversions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversions-page">
      <div className="page-header">
        <div className="header-content">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onBack}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Goals
          </button>
          <h1 className="page-title">Conversions: {goalName}</h1>
          <p className="page-description">
            Individual conversion events for this goal
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      {stats.length > 0 && (
        <div className="stats-grid mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <h3>
                  {stat.conversion_date ? 
                    new Date(stat.conversion_date).toLocaleDateString() : 
                    'Total'
                  }
                </h3>
                <CalendarIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="stat-details">
                <div className="stat-item">
                  <span className="stat-label">Conversions</span>
                  <span className="stat-value">{stat.total_conversions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Value</span>
                  <span className="stat-value">${formatValue(stat.total_value)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Value</span>
                  <span className="stat-value">${formatValue(stat.avg_value)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Sessions</span>
                  <span className="stat-value">{stat.unique_sessions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conversions List */}
      <div className="conversions-content">
        {conversions.length === 0 ? (
          <div className="empty-state">
            <ChartBarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3>No Conversions Yet</h3>
            <p>This goal hasn't recorded any conversions yet</p>
          </div>
        ) : (
          <>
            <div className="conversions-table">
              <div className="table-header">
                <div className="table-row">
                  <div className="table-cell">Date & Time</div>
                  <div className="table-cell">Session ID</div>
                  <div className="table-cell">Page URL</div>
                  <div className="table-cell">Value</div>
                  <div className="table-cell">Referrer</div>
                </div>
              </div>
              <div className="table-body">
                {conversions.map((conversion) => (
                  <div key={conversion.id} className="table-row">
                    <div className="table-cell">
                      <div className="cell-content">
                        <span className="primary-text">
                          {formatDate(conversion.converted_at)}
                        </span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="cell-content">
                        <span className="code-text">
                          {conversion.session_id}
                        </span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="cell-content">
                        <span className="link-text" title={conversion.page_url}>
                          {conversion.page_url.length > 50 
                            ? `${conversion.page_url.substring(0, 50)}...`
                            : conversion.page_url
                          }
                        </span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="cell-content">
                        <span className="value-text">
                          ${formatValue(conversion.conversion_value)}
                        </span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="cell-content">
                        <span className="secondary-text">
                          {conversion.referrer || 'Direct'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={prevPage}
                disabled={pagination.offset === 0}
              >
                Previous
              </button>
              <span className="pagination-info">
                Showing {pagination.offset + 1} - {pagination.offset + conversions.length}
              </span>
              <button
                className="btn btn-secondary"
                onClick={nextPage}
                disabled={!pagination.hasMore}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}