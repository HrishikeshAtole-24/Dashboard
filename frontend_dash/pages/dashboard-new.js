import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ModernLayout from '../components/ModernLayout';
import { 
  Card, 
  MetricCard, 
  SectionHeader, 
  Button, 
  LoadingCard, 
  EmptyState, 
  StatsGrid,
  ChartContainer 
} from '../components/UIComponents';
import { useRouter } from 'next/router';
import {
  GlobeAltIcon,
  PlusIcon,
  UsersIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '../components/icons';
import { websiteAPI, analyticsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    chartData: null,
    realtime: null
  });
  const [loadingData, setLoadingData] = useState(true);

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch websites
  useEffect(() => {
    if (isAuthenticated) {
      fetchWebsites();
    }
  }, [isAuthenticated]);

  // Fetch dashboard data when website is selected
  useEffect(() => {
    if (selectedWebsite) {
      fetchDashboardData();
    }
  }, [selectedWebsite]);

  const fetchWebsites = async () => {
    try {
      const response = await websiteAPI.getWebsites();
      setWebsites(response.websites || []);
      if (response.websites?.length > 0 && !selectedWebsite) {
        setSelectedWebsite(response.websites[0].website_id);
      }
    } catch (error) {
      toast.error('Failed to fetch websites');
    }
  };

  const fetchDashboardData = async () => {
    if (!selectedWebsite) return;
    
    setLoadingData(true);
    try {
      const [overview, chartData, realtime] = await Promise.allSettled([
        analyticsAPI.getOverview(selectedWebsite, 7),
        analyticsAPI.getChartData(selectedWebsite, 7),
        analyticsAPI.getRealtime(selectedWebsite)
      ]);

      setDashboardData({
        overview: overview.status === 'fulfilled' ? overview.value?.overview : null,
        chartData: chartData.status === 'fulfilled' ? chartData.value?.chartData : null,
        realtime: realtime.status === 'fulfilled' ? realtime.value : null
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  const getChartOptions = () => {
    if (!dashboardData.chartData?.length) return {};

    return {
      chart: {
        type: 'area',
        height: 300,
        backgroundColor: 'transparent'
      },
      title: { text: null },
      xAxis: {
        categories: dashboardData.chartData.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        gridLineWidth: 0,
        lineColor: '#e5e7eb',
        tickColor: '#e5e7eb'
      },
      yAxis: {
        title: { text: null },
        gridLineColor: '#f3f4f6'
      },
      tooltip: {
        shared: true,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderRadius: 8
      },
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          lineWidth: 3,
          marker: {
            enabled: false,
            states: { hover: { enabled: true, radius: 5 } }
          }
        }
      },
      series: [
        {
          name: 'Page Views',
          data: dashboardData.chartData.map(item => item.pageViews || 0),
          color: '#3b82f6',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, 'rgba(59, 130, 246, 0.3)'], [1, 'rgba(59, 130, 246, 0.1)']]
          }
        },
        {
          name: 'Visitors',
          data: dashboardData.chartData.map(item => item.uniqueVisitors || 0),
          color: '#10b981',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, 'rgba(16, 185, 129, 0.3)'], [1, 'rgba(16, 185, 129, 0.1)']]
          }
        }
      ],
      credits: { enabled: false },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom'
      }
    };
  };

  if (loading) {
    return (
      <ModernLayout title="Dashboard">
        <div className="space-y-8">
          <StatsGrid>
            {[1,2,3,4].map(i => <LoadingCard key={i} />)}
          </StatsGrid>
          <LoadingCard />
        </div>
      </ModernLayout>
    );
  }

  if (!websites.length) {
    return (
      <ModernLayout title="Dashboard">
        <EmptyState
          icon={<GlobeAltIcon className="w-10 h-10" />}
          title="No Websites Found"
          description="Get started by adding your first website to track analytics."
          action={
            <Button onClick={() => router.push('/websites')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Your First Website
            </Button>
          }
        />
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your websites today
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </Card>

        {/* Website Selector */}
        <Card>
          <SectionHeader 
            title="Website Analytics" 
            subtitle="Select a website to view detailed analytics"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a website</option>
                {websites.map((website) => (
                  <option key={website.website_id} value={website.website_id}>
                    {website.name} • {website.domain}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => router.push('/websites')}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Website
              </Button>
              {selectedWebsite && (
                <Button onClick={() => router.push(`/analytics?website=${selectedWebsite}`)}>
                  View Details
                </Button>
              )}
            </div>
          </div>
        </Card>

        {selectedWebsite && (
          <>
            {/* Real-time Stats */}
            {dashboardData.realtime && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <SectionHeader 
                  title="Live Activity" 
                  subtitle="Current visitor activity on your website"
                />
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {dashboardData.realtime.currentVisitors || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Visitors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {dashboardData.realtime.currentPageViews || 0}
                    </div>
                    <div className="text-sm text-gray-600">Page Views (5min)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {dashboardData.realtime.recentEvents?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Recent Events</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Key Metrics */}
            {loadingData ? (
              <StatsGrid>
                {[1,2,3,4].map(i => <LoadingCard key={i} />)}
              </StatsGrid>
            ) : dashboardData.overview ? (
              <StatsGrid>
                <MetricCard
                  title="Total Visits"
                  value={dashboardData.overview.totalVisits || 0}
                  icon={<UsersIcon className="h-6 w-6" />}
                  trend="up"
                  change="+12%"
                />
                <MetricCard
                  title="Unique Visitors"
                  value={dashboardData.overview.uniqueVisitors || 0}
                  icon={<EyeIcon className="h-6 w-6" />}
                  trend="up"
                  change="+8%"
                />
                <MetricCard
                  title="Page Views"
                  value={dashboardData.overview.pageViews || 0}
                  icon={<ChartBarIcon className="h-6 w-6" />}
                  trend="up"
                  change="+15%"
                />
                <MetricCard
                  title="Avg. Duration"
                  value={`${Math.round(dashboardData.overview.avgDuration || 0)}s`}
                  icon={<ClockIcon className="h-6 w-6" />}
                  trend="neutral"
                />
              </StatsGrid>
            ) : null}

            {/* Traffic Chart */}
            {dashboardData.chartData?.length > 0 && (
              <ChartContainer title="7-Day Traffic Trends" height="h-96">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={getChartOptions()}
                />
              </ChartContainer>
            )}

            {/* Quick Actions */}
            <Card>
              <SectionHeader 
                title="Quick Actions" 
                subtitle="Common tasks and shortcuts"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => router.push(`/analytics?website=${selectedWebsite}`)}
                >
                  <ChartBarIcon className="w-8 h-8 mb-2" />
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => router.push('/realtime')}
                >
                  <ArrowTrendingUpIcon className="w-8 h-8 mb-2" />
                  Real-time Data
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => router.push('/websites')}
                >
                  <GlobeAltIcon className="w-8 h-8 mb-2" />
                  Manage Websites
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </ModernLayout>
  );
}