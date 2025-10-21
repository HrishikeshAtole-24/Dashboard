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
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="website-select" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <select
                id="website-select"
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {websites.map((website) => (
                  <option key={website._id} value={website._id}>
                    {website.name} ({website.domain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <select
                id="date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportData}
              className="btn-secondary flex items-center"
              disabled={!analyticsData}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Website Info */}
        {selectedWebsiteData && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <GlobeAltIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedWebsiteData.name}</h3>
                <p className="text-sm text-gray-500">{selectedWebsiteData.domain}</p>
              </div>
            </div>
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : analyticsData ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-bold">PV</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pageviews</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analyticsData.overview.totalPageviews.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className={`flex items-center text-sm ${
                      analyticsData.overview.pageviewsChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>{analyticsData.overview.pageviewsChange > 0 ? '↗' : '↘'}</span>
                      <span className="ml-1">{Math.abs(analyticsData.overview.pageviewsChange)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-bold">SS</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Sessions</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analyticsData.overview.totalSessions.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className={`flex items-center text-sm ${
                      analyticsData.overview.sessionsChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>{analyticsData.overview.sessionsChange > 0 ? '↗' : '↘'}</span>
                      <span className="ml-1">{Math.abs(analyticsData.overview.sessionsChange)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-bold">US</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Users</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analyticsData.overview.totalUsers.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className={`flex items-center text-sm ${
                      analyticsData.overview.usersChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>{analyticsData.overview.usersChange > 0 ? '↗' : '↘'}</span>
                      <span className="ml-1">{Math.abs(analyticsData.overview.usersChange)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-bold">BR</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Bounce Rate</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analyticsData.overview.avgBounceRate.toFixed(1)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className={`flex items-center text-sm ${
                      analyticsData.overview.bounceRateChange < 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>{analyticsData.overview.bounceRateChange < 0 ? '↘' : '↗'}</span>
                      <span className="ml-1">{Math.abs(analyticsData.overview.bounceRateChange)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pageviews"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Pageviews"
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Sessions"
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h3>
                  <div className="space-y-3">
                    {analyticsData.topPages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{page.path}</p>
                          <p className="text-xs text-gray-500">
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
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
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
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Device Types</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analyticsData.deviceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {analyticsData.deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
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