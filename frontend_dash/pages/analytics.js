import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { analyticsAPI, websiteAPI } from '../utils/api';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function Analytics() {
  const [data, setData] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    avgSessionTime: 0
  });
  
  const [devices, setDevices] = useState([]);
  const [referrers, setReferrers] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('all');
  const [timeframe, setTimeframe] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    loadWebsites();
  }, [selectedWebsite, timeframe]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock comprehensive analytics data
      const mockData = {
        pageViews: 28947,
        uniqueVisitors: 15823,
        bounceRate: 38.2,
        avgSessionTime: 224
      };

      const mockDevices = [
        { name: 'Desktop', value: 45.2, color: '#0070f3' },
        { name: 'Mobile', value: 38.7, color: '#00d9ff' },
        { name: 'Tablet', value: 16.1, color: '#f5a623' }
      ];

      const mockReferrers = [
        { name: 'Google', visitors: 8934, percentage: 56.4 },
        { name: 'Direct', visitors: 3247, percentage: 20.5 },
        { name: 'Facebook', visitors: 1829, percentage: 11.6 },
        { name: 'Twitter', visitors: 945, percentage: 6.0 },
        { name: 'LinkedIn', visitors: 568, percentage: 3.6 },
        { name: 'Other', visitors: 300, percentage: 1.9 }
      ];

      const mockTopPages = [
        { path: '/dashboard', views: 4521, percentage: 15.6 },
        { path: '/analytics', views: 3247, percentage: 11.2 },
        { path: '/websites', views: 2834, percentage: 9.8 },
        { path: '/profile', views: 2156, percentage: 7.4 },
        { path: '/settings', views: 1943, percentage: 6.7 }
      ];

      const mockChartData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          pageViews: Math.floor(Math.random() * 600) + 400,
          visitors: Math.floor(Math.random() * 400) + 200,
          sessions: Math.floor(Math.random() * 350) + 180
        };
      });

      setData(mockData);
      setDevices(mockDevices);
      setReferrers(mockReferrers);
      setTopPages(mockTopPages);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Traffic Chart
  const trafficChartOptions = {
    chart: {
      type: 'line',
      height: 400,
      backgroundColor: 'transparent'
    },
    title: { text: null },
    xAxis: {
      categories: chartData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      gridLineWidth: 1,
      gridLineColor: '#333333'
    },
    yAxis: {
      title: { text: null },
      gridLineWidth: 1,
      gridLineColor: '#333333'
    },
    series: [
      {
        name: 'Page Views',
        data: chartData.map(d => d.pageViews),
        color: '#0070f3'
      },
      {
        name: 'Visitors',
        data: chartData.map(d => d.visitors),
        color: '#00d9ff'
      },
      {
        name: 'Sessions',
        data: chartData.map(d => d.sessions),
        color: '#f5a623'
      }
    ],
    tooltip: {
      backgroundColor: '#111111',
      borderColor: '#333333',
      style: { color: '#ffffff' }
    },
    legend: {
      itemStyle: { color: '#a1a1aa' }
    }
  };

  // Device Chart
  const deviceChartOptions = {
    chart: {
      type: 'pie',
      height: 300,
      backgroundColor: 'transparent'
    },
    title: { text: null },
    series: [{
      name: 'Usage',
      data: devices.map(device => ({
        name: device.name,
        y: device.value,
        color: device.color
      }))
    }],
    tooltip: {
      backgroundColor: '#111111',
      borderColor: '#333333',
      style: { color: '#ffffff' },
      pointFormat: '<b>{point.percentage:.1f}%</b>'
    },
    legend: {
      itemStyle: { color: '#a1a1aa' }
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Advanced Analytics">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading analytics data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Advanced Analytics">
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

        <div className="chart-filters">
          <button 
            className={`filter-btn ${timeframe === 7 ? 'active' : ''}`}
            onClick={() => setTimeframe(7)}
          >
            7 days
          </button>
          <button 
            className={`filter-btn ${timeframe === 30 ? 'active' : ''}`}
            onClick={() => setTimeframe(30)}
          >
            30 days
          </button>
          <button 
            className={`filter-btn ${timeframe === 90 ? 'active' : ''}`}
            onClick={() => setTimeframe(90)}
          >
            90 days
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Page Views</h3>
            <div className="card-icon primary">📊</div>
          </div>
          <div className="card-content">
            <div className="metric-value">{formatNumber(data.pageViews)}</div>
            <p className="metric-label">Total page views</p>
          </div>
          <div className="metric-change positive">
            <span>↗</span>
            +15.2% growth
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Unique Visitors</h3>
            <div className="card-icon success">👥</div>
          </div>
          <div className="card-content">
            <div className="metric-value">{formatNumber(data.uniqueVisitors)}</div>
            <p className="metric-label">Unique visitors</p>
          </div>
          <div className="metric-change positive">
            <span>↗</span>
            +8.7% growth
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Bounce Rate</h3>
            <div className="card-icon warning">📉</div>
          </div>
          <div className="card-content">
            <div className="metric-value">{data.bounceRate}%</div>
            <p className="metric-label">Bounce rate</p>
          </div>
          <div className="metric-change positive">
            <span>↘</span>
            -3.2% better
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Avg. Session</h3>
            <div className="card-icon primary">⏱️</div>
          </div>
          <div className="card-content">
            <div className="metric-value">{formatTime(data.avgSessionTime)}</div>
            <p className="metric-label">Session duration</p>
          </div>
          <div className="metric-change positive">
            <span>↗</span>
            +12.4% longer
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Traffic Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Traffic Trends</h3>
          </div>
          <HighchartsReact
            highcharts={Highcharts}
            options={trafficChartOptions}
          />
        </div>

        {/* Device Breakdown */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Device Types</h3>
          </div>
          <HighchartsReact
            highcharts={Highcharts}
            options={deviceChartOptions}
          />
        </div>
      </div>

      {/* Data Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Top Referrers */}
        <div className="data-table">
          <div className="table-header">
            <h3 className="table-title">Top Referrers</h3>
          </div>
          <div className="table-content">
            <table className="table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Visitors</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map((referrer, index) => (
                  <tr key={index}>
                    <td>{referrer.name}</td>
                    <td>{formatNumber(referrer.visitors)}</td>
                    <td>{referrer.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Pages */}
        <div className="data-table">
          <div className="table-header">
            <h3 className="table-title">Top Pages</h3>
          </div>
          <div className="table-content">
            <table className="table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Views</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, index) => (
                  <tr key={index}>
                    <td>
                      <code>{page.path}</code>
                    </td>
                    <td>{formatNumber(page.views)}</td>
                    <td>{page.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}