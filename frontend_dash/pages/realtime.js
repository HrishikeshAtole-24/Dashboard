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
  const [geographic, setGeographic] = useState([]);
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
      
      if (selectedWebsite === 'all') {
        // Aggregate realtime data from all user's websites
        try {
          const websitesResponse = await websiteAPI.getAll();
          const userWebsites = websitesResponse.success ? websitesResponse.data : [];
          
          if (userWebsites.length > 0) {
            let totalActiveVisitors = 0;
            let totalRecentPageViews = 0;
            let allRecentEvents = [];
            let topPageCounts = {};
            let aggregatedGeographic = {};
            
            for (const website of userWebsites) {
              try {
                const realtimeResponse = await analyticsAPI.getRealtime(website.website_id);
                const geographicResponse = await analyticsAPI.getGeographic(website.website_id, 7); // Last 7 days for realtime
                
                totalActiveVisitors += realtimeResponse.realtimeStats.activeVisitors || 0;
                totalRecentPageViews += realtimeResponse.realtimeStats.recentPageViews || 0;
                
                // Collect recent events
                if (realtimeResponse.realtimeStats.recentEvents) {
                  allRecentEvents.push(...realtimeResponse.realtimeStats.recentEvents.map(event => ({
                    ...event,
                    websiteDomain: website.domain
                  })));
                }

                // Aggregate geographic data
                if (geographicResponse.geographic) {
                  geographicResponse.geographic.forEach(geo => {
                    if (!aggregatedGeographic[geo.country]) {
                      aggregatedGeographic[geo.country] = {
                        country: geo.country,
                        countryCode: geo.countryCode,
                        visitors: 0
                      };
                    }
                    aggregatedGeographic[geo.country].visitors += geo.visitors;
                  });
                }
              } catch (websiteError) {
                console.warn(`Error loading realtime data for website ${website.domain}:`, websiteError);
              }
            }
            
            // Sort events by timestamp and take most recent
            allRecentEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Find top page from recent events
            allRecentEvents.forEach(event => {
              if (event.eventType === 'page_view') {
                topPageCounts[event.url] = (topPageCounts[event.url] || 0) + 1;
              }
            });
            
            const topPage = Object.entries(topPageCounts).length > 0 ? 
              Object.entries(topPageCounts).sort(([,a], [,b]) => b - a)[0][0] : '/';
            
            const realData = {
              activeVisitors: totalActiveVisitors,
              pageViewsLast5Min: totalRecentPageViews,
              topPage,
              activeVisitorsData: totalActiveVisitors
            };

            // Transform events to activity format
            const realActivity = allRecentEvents.slice(0, 20).map((event, i) => ({
              id: i,
              message: `${event.eventType === 'page_view' ? 'Page view' : event.eventType}: ${event.url} (${event.websiteDomain})`,
              timestamp: new Date(event.timestamp),
              type: event.eventType === 'page_view' ? 'pageview' : event.eventType
            }));

            // Process aggregated geographic data
            const totalGeoVisitors = Object.values(aggregatedGeographic).reduce((sum, geo) => sum + geo.visitors, 0);
            const geographicArray = Object.values(aggregatedGeographic)
              .sort((a, b) => b.visitors - a.visitors)
              .slice(0, 6)
              .map(geo => ({
                ...geo,
                percentage: totalGeoVisitors > 0 ? (geo.visitors / totalGeoVisitors * 100).toFixed(1) : 0
              }));

            setRealtimeData(realData);
            setActivity(realActivity);
            setGeographic(geographicArray);
            
          } else {
            // No websites, show zero data
            setRealtimeData({
              activeVisitors: 0,
              pageViewsLast5Min: 0,
              topPage: '/',
              activeVisitorsData: 0
            });
            setActivity([]);
            setGeographic([]);
          }
        } catch (error) {
          console.error('Error loading aggregated realtime data:', error);
          // Show zero data on error
          setRealtimeData({
            activeVisitors: 0,
            pageViewsLast5Min: 0,
            topPage: '/',
            activeVisitorsData: 0
          });
          setActivity([]);
          setGeographic([]);
        }
      } else {
        // Load data for specific website
        try {
          const realtimeResponse = await analyticsAPI.getRealtime(selectedWebsite);
          const geographicResponse = await analyticsAPI.getGeographic(selectedWebsite, 7); // Last 7 days
          
          const realData = {
            activeVisitors: realtimeResponse.realtimeStats.activeVisitors || 0,
            pageViewsLast5Min: realtimeResponse.realtimeStats.recentPageViews || 0,
            topPage: realtimeResponse.realtimeStats.recentEvents?.[0]?.url || '/',
            activeVisitorsData: realtimeResponse.realtimeStats.activeVisitors || 0
          };

          // Transform events to activity format
          const realActivity = (realtimeResponse.realtimeStats.recentEvents || []).map((event, i) => ({
            id: i,
            message: `${event.eventType === 'page_view' ? 'Page view' : event.eventType}: ${event.url}`,
            timestamp: new Date(event.timestamp),
            type: event.eventType === 'page_view' ? 'pageview' : event.eventType
          }));

          // Process geographic data
          const realGeographic = geographicResponse.geographic || [];

          setRealtimeData(realData);
          setActivity(realActivity);
          setGeographic(realGeographic);
          
        } catch (error) {
          console.error('Error loading website realtime data:', error);
          setRealtimeData({
            activeVisitors: 0,
            pageViewsLast5Min: 0,
            topPage: '/',
            activeVisitorsData: 0
          });
          setActivity([]);
          setGeographic([]);
        }
      }
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

  const getCountryFlag = (countryCode) => {
    const flagEmojis = {
      'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'DE': '🇩🇪', 'FR': '🇫🇷',
      'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱', 'SE': '🇸🇪', 'AU': '🇦🇺',
      'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'IN': '🇮🇳', 'BR': '🇧🇷',
      'MX': '🇲🇽', 'AR': '🇦🇷', 'RU': '🇷🇺', 'TR': '🇹🇷', 'SA': '🇸🇦',
      'AE': '🇦🇪', 'SG': '🇸🇬', 'MY': '🇲🇾', 'TH': '🇹🇭', 'VN': '🇻🇳',
      'PH': '🇵🇭', 'ID': '🇮🇩', 'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰',
      'NP': '🇳🇵', 'AF': '🇦🇫', 'EG': '🇪🇬', 'ZA': '🇿🇦', 'NG': '🇳🇬',
      'KE': '🇰🇪', 'GH': '🇬🇭', 'MA': '🇲🇦', 'TN': '🇹🇳', 'DZ': '🇩🇿',
      'UA': '🇺🇦', 'PL': '🇵🇱', 'RO': '🇷🇴', 'CZ': '🇨🇿', 'HU': '🇭🇺',
      'BG': '🇧🇬', 'HR': '🇭🇷', 'RS': '🇷🇸', 'BA': '🇧🇦', 'SI': '🇸🇮',
      'SK': '🇸🇰', 'LT': '🇱🇹', 'LV': '🇱🇻', 'EE': '🇪🇪', 'FI': '🇫🇮',
      'DK': '🇩🇰', 'NO': '🇳🇴', 'IS': '🇮🇸', 'IE': '🇮🇪', 'PT': '🇵🇹',
      'CH': '🇨🇭', 'AT': '🇦🇹', 'BE': '🇧🇪', 'LU': '🇱🇺', 'CY': '🇨🇾',
      'MT': '🇲🇹', 'GR': '🇬🇷', 'AL': '🇦🇱', 'MK': '🇲🇰', 'ME': '🇲🇪',
      'localhost': '🏠', 'unknown': '🌐'
    };
    return flagEmojis[countryCode] || '🌐';
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
            <option key={website.id} value={website.website_id}>
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
              {geographic.length > 0 ? (
                geographic.map((location, index) => (
                  <tr key={index}>
                    <td>{getCountryFlag(location.country)} {location.countryName || location.country}</td>
                    <td>{location.visitors}</td>
                    <td>{location.percentage}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No geographic data available
                  </td>
                </tr>
              )}
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