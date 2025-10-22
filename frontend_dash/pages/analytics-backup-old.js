import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { useRouter } from 'next/router';
import {
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon
} from '../components/icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { websiteAPI, analyticsAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { website: websiteId } = router.query;
  
  const [analyticsData, setAnalyticsData] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWebsites();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (websiteId) {
      setSelectedWebsite(websiteId);
    }
  }, [websiteId]);

  useEffect(() => {
    if (selectedWebsite && isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [selectedWebsite, dateRange, isAuthenticated]);

  const fetchWebsites = async () => {
    try {
      const response = await websiteAPI.getAll();
      if (response.success) {
        setWebsites(response.data);
        if (response.data.length > 0 && !selectedWebsite) {
          setSelectedWebsite(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Websites fetch error:', error);
      toast.error('Error loading websites');
    }
  };

  const fetchAnalyticsData = async () => {
    if (!selectedWebsite) return;
    
    try {
      setLoadingData(true);
      const response = await api.get(`/analytics/${selectedWebsite}?range=${dateRange}`);
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        // Use mock data if no real data
        setAnalyticsData(generateMockData());
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setAnalyticsData(generateMockData());
    } finally {
      setLoadingData(false);
    }
  };

  const generateMockData = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const chartData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      chartData.push({
        date: date.toISOString().split('T')[0],
        pageviews: Math.floor(Math.random() * 1000) + 500,
        sessions: Math.floor(Math.random() * 500) + 200,
        users: Math.floor(Math.random() * 300) + 100,
        bounceRate: Math.floor(Math.random() * 30) + 20
      });
    }

    return {
      overview: {
        totalPageviews: chartData.reduce((sum, day) => sum + day.pageviews, 0),
        totalSessions: chartData.reduce((sum, day) => sum + day.sessions, 0),
        totalUsers: chartData.reduce((sum, day) => sum + day.users, 0),
        avgBounceRate: chartData.reduce((sum, day) => sum + day.bounceRate, 0) / chartData.length,
        avgSessionDuration: 145,
        pageviewsChange: 12.5,
        sessionsChange: 8.3,
        usersChange: -2.1,
        bounceRateChange: -5.4
      },
      chartData,
      topPages: [
        { path: '/', pageviews: 3245, sessions: 2100, avgDuration: 125 },
        { path: '/about', pageviews: 1890, sessions: 1200, avgDuration: 98 },
        { path: '/products', pageviews: 1456, sessions: 980, avgDuration: 156 },
        { path: '/contact', pageviews: 987, sessions: 650, avgDuration: 89 },
        { path: '/blog', pageviews: 654, sessions: 420, avgDuration: 201 }
      ],
      topReferrers: [
        { source: 'Google', visitors: 4200, percentage: 45 },
        { source: 'Direct', visitors: 2800, percentage: 30 },
        { source: 'Facebook', visitors: 1400, percentage: 15 },
        { source: 'Twitter', visitors: 560, percentage: 6 },
        { source: 'Other', visitors: 374, percentage: 4 }
      ],
      deviceData: [
        { name: 'Desktop', value: 65, visitors: 6100, color: '#3B82F6' },
        { name: 'Mobile', value: 30, visitors: 2820, color: '#10B981' },
        { name: 'Tablet', value: 5, visitors: 470, color: '#F59E0B' }
      ],
      locationData: [
        { country: 'United States', visitors: 3500, percentage: 37 },
        { country: 'United Kingdom', visitors: 1800, percentage: 19 },
        { country: 'Canada', visitors: 1200, percentage: 13 },
        { country: 'Germany', visitors: 980, percentage: 10 },
        { country: 'France', visitors: 650, percentage: 7 },
        { country: 'Other', visitors: 1262, percentage: 14 }
      ]
    };
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const csvData = analyticsData.chartData.map(day => ({
      Date: day.date,
      Pageviews: day.pageviews,
      Sessions: day.sessions,
      Users: day.users,
      'Bounce Rate': day.bounceRate + '%'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${selectedWebsite}-${dateRange}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  const selectedWebsiteData = websites.find(w => w._id === selectedWebsite);

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="analytics-filters">
          <div className="filter-group">
            <div className="filter-item">
              <label htmlFor="website-select" className="form-label">
                Website
              </label>
              <select
                id="website-select"
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="form-input"
              >
                {websites.map((website) => (
                  <option key={website._id} value={website._id}>
                    {website.name} ({website.domain})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="date-range" className="form-label">
                Date Range
              </label>
              <select
                id="date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="form-input"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button
              onClick={exportData}
              className="btn-secondary flex items-center"
              disabled={!analyticsData}
            >
              <ArrowDownTrayIcon className="icon-sm" />
              Export
            </button>
          </div>
        </div>

        {/* Website Info */}
        {selectedWebsiteData && (
          <div className="card">
            <div className="flex items-center">
              <GlobeAltIcon className="icon-xl text-blue-600" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">{selectedWebsiteData.name}</h3>
                <p className="text-sm text-gray-500">{selectedWebsiteData.domain}</p>
              </div>
            </div>
          </div>
        )}

        {loadingData ? (
          <div className="loading-container" style={{height: '16rem'}}>
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : analyticsData ? (
          <>
            {/* Stats Overview */}
            <div className="analytics-grid">
              <div className="metric-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="icon-container bg-blue-600">
                      <span className="text-white text-sm font-bold">PV</span>
                    </div>
                  </div>
                  <div className="ml-5 flex-1">
                    <div>
                      <div className="metric-label">Pageviews</div>
                      <div className="metric-value">
                        {analyticsData.overview.totalPageviews.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="metric-change">
                  <div className={`metric-change ${
                    analyticsData.overview.pageviewsChange > 0 ? 'positive' : 'negative'
                  }`}>
                    <span className="metric-change-icon">{analyticsData.overview.pageviewsChange > 0 ? '↗' : '↘'}</span>
                    <span>{Math.abs(analyticsData.overview.pageviewsChange)}%</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="icon-container bg-green-500">
                      <span className="text-white text-sm font-bold">SS</span>
                    </div>
                  </div>
                  <div className="ml-5 flex-1">
                    <div>
                      <div className="metric-label">Sessions</div>
                      <div className="metric-value">
                        {analyticsData.overview.totalSessions.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="metric-change">
                  <div className={`metric-change ${
                    analyticsData.overview.sessionsChange > 0 ? 'positive' : 'negative'
                  }`}>
                    <span className="metric-change-icon">{analyticsData.overview.sessionsChange > 0 ? '↗' : '↘'}</span>
                    <span>{Math.abs(analyticsData.overview.sessionsChange)}%</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="icon-container bg-yellow-500">
                      <span className="text-white text-sm font-bold">US</span>
                    </div>
                  </div>
                  <div className="ml-5 flex-1">
                    <div>
                      <div className="metric-label">Users</div>
                      <div className="metric-value">
                        {analyticsData.overview.totalUsers.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="metric-change">
                  <div className={`metric-change ${
                    analyticsData.overview.usersChange > 0 ? 'positive' : 'negative'
                  }`}>
                    <span className="metric-change-icon">{analyticsData.overview.usersChange > 0 ? '↗' : '↘'}</span>
                    <span>{Math.abs(analyticsData.overview.usersChange)}%</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="icon-container bg-red-500">
                      <span className="text-white text-sm font-bold">BR</span>
                    </div>
                  </div>
                  <div className="ml-5 flex-1">
                    <div>
                      <div className="metric-label">Bounce Rate</div>
                      <div className="metric-value">
                        {analyticsData.overview.avgBounceRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="metric-change">
                  <div className={`metric-change ${
                    analyticsData.overview.bounceRateChange < 0 ? 'positive' : 'negative'
                  }`}>
                    <span className="metric-change-icon">{analyticsData.overview.bounceRateChange < 0 ? '↘' : '↗'}</span>
                    <span>{Math.abs(analyticsData.overview.bounceRateChange)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Chart */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  chart: {
                    type: 'column',
                    height: 400,
                    backgroundColor: 'transparent'
                  },
                  title: { text: null },
                  xAxis: {
                    categories: analyticsData.chartData.map(item => item.date),
                    gridLineColor: '#f1f5f9'
                  },
                  yAxis: {
                    title: { text: null },
                    gridLineColor: '#f1f5f9'
                  },
                  plotOptions: {
                    column: {
                      pointPadding: 0.2,
                      borderWidth: 0,
                      dataLabels: {
                        enabled: false
                      }
                    }
                  },
                  series: [
                    {
                      name: 'Pageviews',
                      data: analyticsData.chartData.map(item => item.pageviews || 0),
                      color: '#3B82F6'
                    },
                    {
                      name: 'Sessions',
                      data: analyticsData.chartData.map(item => item.sessions || 0),
                      color: '#10B981'
                    },
                    {
                      name: 'Users',
                      data: analyticsData.chartData.map(item => item.users || 0),
                      color: '#F59E0B'
                    }
                  ],
                  credits: { enabled: false },
                  legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    layout: 'horizontal'
                  }
                }}
              />
            </div>

            {/* Detailed Analytics Grid */}
            <div className="analytics-grid-2">
              {/* Top Pages */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h3>
                  <div className="space-y-3">
                    {analyticsData.topPages.map((page, index) => (
                      <div key={index} className="page-item">
                        <div className="page-info">
                          <p className="page-url">{page.path}</p>
                          <p className="page-views">
                            {page.sessions.toLocaleString()} sessions • {page.avgDuration}s avg
                          </p>
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                          {page.pageviews.toLocaleString()} views
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h3>
                  <div className="space-y-3">
                    {analyticsData.topReferrers.map((referrer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{referrer.source}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${referrer.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                          {referrer.visitors.toLocaleString()} ({referrer.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Device Types</h3>
                  <div className="pie-chart-container">
                    <div className="pie-chart-visual">
                      <div className="pie-chart-circle">
                        {analyticsData.deviceData.map((device, index) => {
                          const angle = (device.value / 100) * 360;
                          return (
                            <div
                              key={index}
                              className="pie-segment"
                              style={{
                                '--angle': `${angle}deg`,
                                '--color': device.color,
                                transform: `rotate(${analyticsData.deviceData.slice(0, index).reduce((acc, d) => acc + (d.value / 100) * 360, 0)}deg)`
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {analyticsData.deviceData.map((device, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: device.color }}
                          />
                          <span>{device.name}</span>
                        </div>
                        <span>{device.visitors.toLocaleString()} visitors</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Countries */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Countries</h3>
                  <div className="space-y-3">
                    {analyticsData.locationData.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{location.country}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${location.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                          {location.visitors.toLocaleString()} ({location.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <ChartBarIcon />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No data available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start collecting data by adding the tracking code to your website.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}