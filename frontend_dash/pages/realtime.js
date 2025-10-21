import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { useRouter } from 'next/router';
import {
  UsersIcon,
  EyeIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { websiteAPI, analyticsAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function RealTime() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [realTimeData, setRealTimeData] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef(null);

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
    if (selectedWebsite && isAuthenticated) {
      fetchRealTimeData();
      
      // Set up real-time updates every 5 seconds
      if (isLive) {
        intervalRef.current = setInterval(fetchRealTimeData, 5000);
      }
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [selectedWebsite, isLive, isAuthenticated]);

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

  const fetchRealTimeData = async () => {
    if (!selectedWebsite) return;
    
    try {
      if (loadingData) setLoadingData(true);
      
      const response = await analyticsAPI.getRealtime(selectedWebsite);
      if (response) {
        setRealTimeData(response);
      } else {
        // Show empty state instead of mock data
        setRealTimeData(null);
      }
    } catch (error) {
      console.error('Real-time data error:', error);
      setRealTimeData(null);
    } finally {
      if (loadingData) setLoadingData(false);
    }
  };

  const generateMockRealTimeData = () => {
    const now = new Date();
    const last30Minutes = [];
    
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      last30Minutes.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        visitors: Math.floor(Math.random() * 20) + 5,
        pageviews: Math.floor(Math.random() * 50) + 10
      });
    }

    return {
      currentVisitors: Math.floor(Math.random() * 100) + 20,
      pageviewsLastHour: Math.floor(Math.random() * 500) + 200,
      avgSessionDuration: Math.floor(Math.random() * 300) + 120,
      topPages: [
        { path: '/', activeUsers: Math.floor(Math.random() * 15) + 5 },
        { path: '/about', activeUsers: Math.floor(Math.random() * 10) + 2 },
        { path: '/products', activeUsers: Math.floor(Math.random() * 8) + 3 },
        { path: '/contact', activeUsers: Math.floor(Math.random() * 5) + 1 },
        { path: '/blog', activeUsers: Math.floor(Math.random() * 6) + 2 }
      ],
      recentEvents: [
        {
          id: 1,
          type: 'pageview',
          path: '/',
          country: 'United States',
          device: 'Desktop',
          timestamp: new Date(Date.now() - Math.random() * 300000),
          referrer: 'Google'
        },
        {
          id: 2,
          type: 'pageview',
          path: '/about',
          country: 'United Kingdom',
          device: 'Mobile',
          timestamp: new Date(Date.now() - Math.random() * 300000),
          referrer: 'Direct'
        },
        {
          id: 3,
          type: 'pageview',
          path: '/products',
          country: 'Canada',
          device: 'Desktop',
          timestamp: new Date(Date.now() - Math.random() * 300000),
          referrer: 'Facebook'
        },
        {
          id: 4,
          type: 'session_start',
          path: '/',
          country: 'Germany',
          device: 'Tablet',
          timestamp: new Date(Date.now() - Math.random() * 300000),
          referrer: 'Twitter'
        },
        {
          id: 5,
          type: 'pageview',
          path: '/contact',
          country: 'France',
          device: 'Mobile',
          timestamp: new Date(Date.now() - Math.random() * 300000),
          referrer: 'Direct'
        }
      ],
      chartData: last30Minutes,
      topCountries: [
        { country: 'United States', visitors: Math.floor(Math.random() * 20) + 10, flag: '🇺🇸' },
        { country: 'United Kingdom', visitors: Math.floor(Math.random() * 15) + 5, flag: '🇬🇧' },
        { country: 'Canada', visitors: Math.floor(Math.random() * 10) + 3, flag: '🇨🇦' },
        { country: 'Germany', visitors: Math.floor(Math.random() * 8) + 2, flag: '🇩🇪' },
        { country: 'France', visitors: Math.floor(Math.random() * 6) + 1, flag: '🇫🇷' }
      ],
      deviceBreakdown: [
        { device: 'Desktop', count: Math.floor(Math.random() * 30) + 20, icon: ComputerDesktopIcon },
        { device: 'Mobile', count: Math.floor(Math.random() * 25) + 15, icon: DevicePhoneMobileIcon },
        { device: 'Tablet', count: Math.floor(Math.random() * 10) + 3, icon: DevicePhoneMobileIcon }
      ]
    };
  };

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
    if (isLive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'pageview':
        return <EyeIcon className="h-4 w-4 text-blue-500" />;
      case 'session_start':
        return <UsersIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (device) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return <ComputerDesktopIcon className="h-4 w-4" />;
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-4 w-4" />;
      case 'tablet':
        return <DevicePhoneMobileIcon className="h-4 w-4" />;
      default:
        return <ComputerDesktopIcon className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
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
    <DashboardLayout title="Real-time Analytics">
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
          </div>

          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isLive ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">{isLive ? 'Live' : 'Paused'}</span>
            </div>
            <button
              onClick={toggleLiveUpdates}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isLive 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isLive ? 'Pause' : 'Resume'}
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
              <div className="ml-auto flex items-center space-x-2">
                <SignalIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-600">Active</span>
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
        ) : realTimeData ? (
          <>
            {/* Real-time Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                        <dd className="text-2xl font-bold text-green-600">
                          {realTimeData.currentVisitors}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                      Right now
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <EyeIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Views (1h)</dt>
                        <dd className="text-2xl font-bold text-blue-600">
                          {realTimeData.pageviewsLastHour}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">
                      Last hour
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg. Duration</dt>
                        <dd className="text-2xl font-bold text-yellow-600">
                          {Math.floor(realTimeData.avgSessionDuration / 60)}m {realTimeData.avgSessionDuration % 60}s
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">
                      Session length
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <GlobeAltIcon className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Top Country</dt>
                        <dd className="text-lg font-bold text-purple-600">
                          {realTimeData.topCountries[0].flag} {realTimeData.topCountries[0].country}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">
                      {realTimeData.topCountries[0].visitors} active users
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Live Traffic (Last 30 minutes)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={realTimeData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                    name="Active Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="pageviews"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="Pageviews"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Real-time Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Pages */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Active Pages</h3>
                  <div className="space-y-3">
                    {realTimeData.topPages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{page.path}</p>
                        </div>
                        <div className="ml-4 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          <span className="text-sm text-gray-500">{page.activeUsers} users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Countries */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Active Countries</h3>
                  <div className="space-y-3">
                    {realTimeData.topCountries.map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{country.flag}</span>
                          <span className="text-sm font-medium text-gray-900">{country.country}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                          <span className="text-sm text-gray-500">{country.visitors}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Active Devices</h3>
                  <div className="space-y-3">
                    {realTimeData.deviceBreakdown.map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <device.icon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{device.device}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
                          <span className="text-sm text-gray-500">{device.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {realTimeData.recentEvents.map((event, index) => (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {index !== realTimeData.recentEvents.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                          )}
                          <div className="relative flex space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                              {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-900">
                                    <span className="font-medium">{event.type === 'pageview' ? 'Page view' : 'New session'}</span>
                                    {' '}on <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{event.path}</span>
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                    <div className="flex items-center">
                                      {getDeviceIcon(event.device)}
                                      <span className="ml-1">{event.device}</span>
                                    </div>
                                    <span>{event.country}</span>
                                    <span>via {event.referrer}</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatTimestamp(event.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <SignalIcon />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No real-time data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start collecting real-time data by adding the tracking code to your website.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}