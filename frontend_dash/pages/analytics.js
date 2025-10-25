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
      
      if (selectedWebsite === 'all') {
        // Aggregate data from all user's websites
        try {
          const websitesResponse = await websiteAPI.getAll();
          const userWebsites = websitesResponse.success ? websitesResponse.data : [];
          
          if (userWebsites.length > 0) {
            let totalPageViews = 0;
            let totalUniqueVisitors = 0;
            let totalBounceRate = 0;
            let totalDuration = 0;
            let websiteCount = 0;
            let aggregatedTopPages = {};
            let aggregatedChartData = {};
            let aggregatedReferrers = {};
            
            for (const website of userWebsites) {
              try {
                const overviewResponse = await analyticsAPI.getOverview(website.website_id, timeframe);
                const topPagesResponse = await analyticsAPI.getTopPages(website.website_id, timeframe);
                const chartResponse = await analyticsAPI.getChartData(website.website_id, timeframe);
                const referrersResponse = await analyticsAPI.getReferrers(website.website_id, timeframe);
                
                totalPageViews += overviewResponse.stats.totalPageViews || 0;
                totalUniqueVisitors += overviewResponse.stats.uniqueVisitors || 0;
                totalBounceRate += overviewResponse.stats.avgBounceRate || 0;
                totalDuration += overviewResponse.stats.avgDuration || 0;
                websiteCount++;
                
                // Aggregate top pages
                topPagesResponse.topPages?.forEach(page => {
                  if (!aggregatedTopPages[page.url]) {
                    aggregatedTopPages[page.url] = { path: page.url, views: 0 };
                  }
                  aggregatedTopPages[page.url].views += page.page_views || 0;
                });

                // Aggregate referrers
                referrersResponse.referrers?.forEach(referrer => {
                  if (!aggregatedReferrers[referrer.name]) {
                    aggregatedReferrers[referrer.name] = { name: referrer.name, visitors: 0, pageViews: 0 };
                  }
                  aggregatedReferrers[referrer.name].visitors += referrer.visitors || 0;
                  aggregatedReferrers[referrer.name].pageViews += referrer.pageViews || 0;
                });
                
                // Aggregate chart data by date
                chartResponse.chartData?.forEach(item => {
                  if (!aggregatedChartData[item.date]) {
                    aggregatedChartData[item.date] = { 
                      date: item.date, 
                      pageViews: 0, 
                      visitors: 0, 
                      sessions: 0 
                    };
                  }
                  aggregatedChartData[item.date].pageViews += item.page_views || 0;
                  aggregatedChartData[item.date].visitors += item.unique_visitors || 0;
                  aggregatedChartData[item.date].sessions += item.visits || 0;
                });
              } catch (websiteError) {
                console.warn(`Error loading analytics for website ${website.domain}:`, websiteError);
              }
            }
            
            const realData = {
              pageViews: totalPageViews,
              uniqueVisitors: totalUniqueVisitors,
              bounceRate: websiteCount > 0 ? totalBounceRate / websiteCount : 0,
              avgSessionTime: websiteCount > 0 ? totalDuration / websiteCount : 0
            };

            // Convert aggregated top pages to array and sort
            const topPagesArray = Object.values(aggregatedTopPages)
              .sort((a, b) => b.views - a.views)
              .slice(0, 10)
              .map(page => ({
                ...page,
                percentage: totalPageViews > 0 ? (page.views / totalPageViews * 100).toFixed(1) : 0
              }));

            // Convert aggregated chart data to array
            const chartDataArray = Object.values(aggregatedChartData).sort((a, b) => 
              new Date(a.date) - new Date(b.date)
            );

            // Convert aggregated referrers to array and calculate percentages
            const totalReferrerVisitors = Object.values(aggregatedReferrers).reduce((sum, ref) => sum + ref.visitors, 0);
            const referrersArray = Object.values(aggregatedReferrers)
              .sort((a, b) => b.visitors - a.visitors)
              .slice(0, 10)
              .map(referrer => ({
                ...referrer,
                percentage: totalReferrerVisitors > 0 ? (referrer.visitors / totalReferrerVisitors * 100).toFixed(1) : 0
              }));

            setData(realData);
            setTopPages(topPagesArray);
            setChartData(chartDataArray);
            setReferrers(referrersArray);
            
            // For devices, we'll show placeholder data since backend doesn't have this yet
            setDevices([
              { name: 'Desktop', value: 45.2, color: '#0070f3' },
              { name: 'Mobile', value: 38.7, color: '#00d9ff' },
              { name: 'Tablet', value: 16.1, color: '#f5a623' }
            ]);
            
          } else {
            // No websites, show zero data
            setData({ pageViews: 0, uniqueVisitors: 0, bounceRate: 0, avgSessionTime: 0 });
            setTopPages([]);
            setChartData([]);
            setDevices([]);
            setReferrers([]);
          }
        } catch (error) {
          console.error('Error loading aggregated analytics:', error);
          // Show zero data on error
          setData({ pageViews: 0, uniqueVisitors: 0, bounceRate: 0, avgSessionTime: 0 });
          setTopPages([]);
          setChartData([]);
          setDevices([]);
          setReferrers([]);
        }
      } else {
        // Load data for specific website
        try {
          const overviewResponse = await analyticsAPI.getOverview(selectedWebsite, timeframe);
          const topPagesResponse = await analyticsAPI.getTopPages(selectedWebsite, timeframe);
          const chartResponse = await analyticsAPI.getChartData(selectedWebsite, timeframe);
          const referrersResponse = await analyticsAPI.getReferrers(selectedWebsite, timeframe);
          
          const realData = {
            pageViews: overviewResponse.stats.totalPageViews || 0,
            uniqueVisitors: overviewResponse.stats.uniqueVisitors || 0,
            bounceRate: overviewResponse.stats.avgBounceRate || 0,
            avgSessionTime: overviewResponse.stats.avgDuration || 0
          };

          const realTopPages = topPagesResponse.topPages?.map(page => ({
            path: page.url,
            views: page.page_views || 0,
            percentage: overviewResponse.stats.totalPageViews > 0 ? 
              ((page.page_views || 0) / overviewResponse.stats.totalPageViews * 100).toFixed(1) : 0
          })) || [];

          const realChartData = chartResponse.chartData?.map(item => ({
            date: item.date,
            pageViews: item.page_views || 0,
            visitors: item.unique_visitors || 0,
            sessions: item.visits || 0
          })) || [];

          const realReferrers = referrersResponse.referrers || [];

          setData(realData);
          setTopPages(realTopPages);
          setChartData(realChartData);
          setReferrers(realReferrers);
          
          // Placeholder data for devices
          setDevices([
            { name: 'Desktop', value: 45.2, color: '#0070f3' },
            { name: 'Mobile', value: 38.7, color: '#00d9ff' },
            { name: 'Tablet', value: 16.1, color: '#f5a623' }
          ]);
          
        } catch (error) {
          console.error('Error loading website analytics:', error);
          setData({ pageViews: 0, uniqueVisitors: 0, bounceRate: 0, avgSessionTime: 0 });
          setTopPages([]);
          setChartData([]);
          setDevices([]);
          setReferrers([]);
        }
      }
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
            <option key={website.id} value={website.website_id}>
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