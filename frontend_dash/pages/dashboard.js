import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { useRouter } from 'next/router';
import {
  ChartBarIcon,
  UsersIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  PlusIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { DateRangePicker } from "../components/ui/date-picker";
import { ChevronDown } from "lucide-react";
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';
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

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });

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
    if (selectedWebsite && isAuthenticated && dateRange.from && dateRange.to) {
      fetchDashboardData();
    }
  }, [selectedWebsite, dateRange, isAuthenticated]);

  const fetchWebsites = async () => {
    try {
      const response = await websiteAPI.getAll();
      if (response.success && response.data.length > 0) {
        console.log('Websites data:', response.data); // Debug log
        setWebsites(response.data);
        // Try both _id and id fields
        const firstWebsite = response.data[0];
        const websiteId = firstWebsite._id || firstWebsite.id;
        setSelectedWebsite(websiteId);
      } else {
        setWebsites([]);
        setDashboardData(null);
      }
    } catch (error) {
      console.error('Websites fetch error:', error);
      toast.error('Error loading websites');
    }
  };

  const fetchDashboardData = async () => {
    if (!selectedWebsite || !dateRange.from || !dateRange.to) return;
    
    try {
      setLoadingData(true);
      // Calculate days between the selected range
      const days = Math.ceil((dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24));
      const response = await analyticsAPI.getOverview(selectedWebsite, days);
      if (response) {
        setDashboardData(response);
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
      // Don't show error toast for missing data - just show empty state
      setDashboardData(null);
    } finally {
      setLoadingData(false);
    }
  };

  // Handle preset date ranges
  const handlePresetRange = (preset) => {
    const today = new Date();
    switch (preset) {
      case 'last7':
        setDateRange({
          from: subDays(today, 7),
          to: today
        });
        break;
      case 'last30':
        setDateRange({
          from: subDays(today, 30),
          to: today
        });
        break;
      case 'last90':
        setDateRange({
          from: subDays(today, 90),
          to: today
        });
        break;
      default:
        break;
    }
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

  if (loadingData) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show empty state if no websites
  if (websites.length === 0) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="text-center py-12">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No websites</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first website.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/websites')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Website
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const StatCard = ({ title, value, change, icon: Icon, isTime = false }) => {
    const isPositive = change > 0;
    const formattedValue = isTime ? `${Math.floor(value / 60)}m ${value % 60}s` : value.toLocaleString();
    
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="text-lg font-medium text-gray-900">{formattedValue}</dd>
              </dl>
            </div>
          </div>
          <div className="mt-4">
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Website & Date Range Selector */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <h2 className="text-lg font-medium text-gray-900">Analytics Overview</h2>
            
            {/* Website Selector */}
            {websites.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-64 justify-between text-gray-900">
                    {selectedWebsite ? 
                      `${websites.find(w => (w._id || w.id) === selectedWebsite)?.name} (${websites.find(w => (w._id || w.id) === selectedWebsite)?.domain})` : 
                      "Select Website"
                    }
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  {websites.map((website) => (
                    <DropdownMenuItem
                      key={website._id || website.id}
                      onClick={() => setSelectedWebsite(website._id || website.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{website.name}</span>
                        <span className="text-sm text-gray-500">{website.domain}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="text-sm text-gray-500">No websites available</div>
            )}
          </div>
          
          {/* Date Range Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            {/* Quick Preset Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange('last7')}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange('last30')}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange('last90')}
              >
                Last 90 days
              </Button>
            </div>
            
            {/* Custom Date Range Picker */}
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              placeholder="Select custom range"
            />
          </div>
        </div>

        {/* Stats Grid */}
        {dashboardData ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Pageviews"
              value={dashboardData.totalPageviews || 0}
              change={dashboardData.pageviewsChange || 0}
              icon={EyeIcon}
            />
            <StatCard
              title="Unique Visitors"
              value={dashboardData.uniqueVisitors || 0}
              change={dashboardData.visitorsChange || 0}
              icon={UsersIcon}
            />
            <StatCard
              title="Avg. Session Duration"
              value={dashboardData.avgSessionDuration || 0}
              change={dashboardData.sessionChange || 0}
              icon={ChartBarIcon}
              isTime
            />
            <StatCard
              title="Bounce Rate"
              value={dashboardData.bounceRate || 0}
              change={dashboardData.bounceChange || 0}
              icon={CursorArrowRaysIcon}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Pageviews"
              value={0}
              change={0}
              icon={EyeIcon}
            />
            <StatCard
              title="Unique Visitors"
              value={0}
              change={0}
              icon={UsersIcon}
            />
            <StatCard
              title="Avg. Session Duration"
              value={0}
              change={0}
              icon={ChartBarIcon}
              isTime
            />
            <StatCard
              title="Bounce Rate"
              value={0}
              change={0}
              icon={CursorArrowRaysIcon}
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
            {dashboardData && dashboardData.chartData && dashboardData.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="pageviews"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Pageviews"
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Visitors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No traffic data available</p>
                  <p className="text-sm">Add the tracking script to your website to start collecting data</p>
                </div>
              </div>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Device Breakdown</h3>
            {dashboardData && dashboardData.deviceData && dashboardData.deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No device data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h3>
              {dashboardData && dashboardData.topPages && dashboardData.topPages.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{page.path}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${page.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-sm text-gray-500">
                        {page.pageviews.toLocaleString()} views
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No page data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Websites */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Your Websites</h3>
                <button
                  onClick={() => router.push('/websites')}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {websites.length > 0 ? (
                  websites.slice(0, 5).map((website) => (
                    <div key={website.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-3 ${
                          website.is_active ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{website.domain}</p>
                          <p className="text-xs text-gray-500">{website.name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        website.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {website.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No websites added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}