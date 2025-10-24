import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { analyticsAPI, websiteAPI } from '../utils/api';

export default function Realtime() {
  const [realtimeData, setRealtimeData] = useState({
    activeVisitors: 0,
    pageViewsLast5Min: 0,
    topPage: '/',
    activeVisitorsData: 0
  });

  const [activity, setActivity] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadRealtimeData();
    loadWebsites();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadRealtimeData();
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedWebsite]);

  const loadRealtimeData = async () => {
    try {
      setLoading(true);
      
      // Mock real-time data
      const mockData = {
        activeVisitors: Math.floor(Math.random() * 50) + 10,
        pageViewsLast5Min: Math.floor(Math.random() * 100) + 20,
        topPage: '/',
        activeVisitorsData: Math.floor(Math.random() * 50) + 10
      };

      const mockActivity = Array.from({ length: 10 }, (_, i) => {
        const activities = [
          'New visitor from United States',
          'Page view: /dashboard',
          'New visitor from Canada',
          'Page view: /analytics',
          'Visitor returned from Germany',
          'Page view: /websites',
          'New visitor from UK',
          'Page view: /profile',
          'Visitor left from France',
          'Page view: /'
        ];
        
        const now = new Date();
        now.setSeconds(now.getSeconds() - (i * 30));
        
        return {
          id: i,
          message: activities[Math.floor(Math.random() * activities.length)],
          timestamp: now,
          type: activities[i % activities.length].includes('New') ? 'new' : 
                activities[i % activities.length].includes('returned') ? 'return' : 
                activities[i % activities.length].includes('left') ? 'exit' : 'pageview'
        };
      });

      setRealtimeData(mockData);
      setActivity(mockActivity);
    } catch (error) {
      console.error('Error loading realtime data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWebsites = async () => {
    try {
      const response = await websiteAPI.getAll();
      if (response.success) {
        setWebsites(response.data);
      }
    } catch (error) {
      console.error('Error loading websites:', error);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new': return '🟢';
      case 'return': return '🔵';
      case 'exit': return '🔴';
      case 'pageview': return '👁️';
      default: return '⚪';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'new': return 'var(--success)';
      case 'return': return 'var(--accent-blue)';
      case 'exit': return 'var(--danger)';
      case 'pageview': return 'var(--text-secondary)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Real-time Analytics">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading real-time data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Real-time Analytics">
      {/* Header Actions */}
      <div className="header-actions">
        <select 
          value={selectedWebsite} 
          onChange={(e) => setSelectedWebsite(e.target.value)}
          style={{
            background: 'var(--secondary-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            fontSize: '0.875rem'
          }}
        >
          <option value="all">All Websites</option>
          {websites.map(website => (
            <option key={website._id} value={website._id}>
              {website.name}
            </option>
          ))}
        </select>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem'
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: 'var(--success)',
            animation: 'pulse 2s infinite'
          }}></span>
          Live • Last updated {formatTime(lastUpdated)}
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Active Visitors</h3>
            <div className="card-icon success">👥</div>
          </div>
          <div className="card-content">
            <div className="metric-value">{realtimeData.activeVisitors}</div>
            <p className="metric-label">Right now</p>
          </div>
          <div className="metric-change positive">
            <span>⚡</span>
            Live data
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Page Views (5min)</h3>
            <div className="card-icon primary">📊</div>
          </div>
          <div className="card-content">
            <div className="metric-value">{realtimeData.pageViewsLast5Min}</div>
            <p className="metric-label">Last 5 minutes</p>
          </div>
          <div className="metric-change positive">
            <span>📈</span>
            Real-time traffic
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Top Page</h3>
            <div className="card-icon warning">🔥</div>
          </div>
          <div className="card-content">
            <div className="metric-value" style={{ fontSize: '1.5rem', fontFamily: 'Monaco, monospace' }}>
              {realtimeData.topPage}
            </div>
            <p className="metric-label">{realtimeData.activeVisitorsData} active visitors</p>
          </div>
          <div className="metric-change positive">
            <span>👁️</span>
            Most viewed now
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">New vs Returning</h3>
            <div className="card-icon primary">📊</div>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                  {Math.floor(realtimeData.activeVisitors * 0.7)}
                </div>
                <p className="metric-label">New</p>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-blue)' }}>
                  {Math.floor(realtimeData.activeVisitors * 0.3)}
                </div>
                <p className="metric-label">Returning</p>
              </div>
            </div>
          </div>
          <div className="metric-change positive">
            <span>🔄</span>
            Visitor types
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">⚡ Live Activity Feed</h3>
        </div>
        <div style={{ padding: '0' }}>
          {activity.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👁️</div>
              <p>No recent activity</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {activity.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--secondary-bg)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '1rem' }}>{getActivityIcon(item.type)}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      margin: 0, 
                      color: getActivityColor(item.type),
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {item.message}
                    </p>
                  </div>
                  <span style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '0.75rem',
                    fontFamily: 'Monaco, monospace'
                  }}>
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">🌍 Geographic Distribution</h3>
        </div>
        <div className="table-content">
          <table className="table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Active Visitors</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🇺🇸 United States</td>
                <td>{Math.floor(realtimeData.activeVisitors * 0.4)}</td>
                <td>40%</td>
              </tr>
              <tr>
                <td>🇨🇦 Canada</td>
                <td>{Math.floor(realtimeData.activeVisitors * 0.2)}</td>
                <td>20%</td>
              </tr>
              <tr>
                <td>🇬🇧 United Kingdom</td>
                <td>{Math.floor(realtimeData.activeVisitors * 0.15)}</td>
                <td>15%</td>
              </tr>
              <tr>
                <td>🇩🇪 Germany</td>
                <td>{Math.floor(realtimeData.activeVisitors * 0.12)}</td>
                <td>12%</td>
              </tr>
              <tr>
                <td>🇫🇷 France</td>
                <td>{Math.floor(realtimeData.activeVisitors * 0.08)}</td>
                <td>8%</td>
              </tr>
              <tr>
                <td>🌍 Others</td>
                <td>{Math.floor(realtimeData.activeVisitors * 0.05)}</td>
                <td>5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </DashboardLayout>
  );
}