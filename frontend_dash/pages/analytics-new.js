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
  ChartContainer,
  TabNavigation,
  Badge
} from '../components/UIComponents';
import { useRouter } from 'next/router';
import {
  ChartBarIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  EyeIcon,
  ClockIcon
} from '../components/icons';
import { websiteAPI, analyticsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function Analytics() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { website: websiteId } = router.query;
  
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(websiteId || '');
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    chartData: null,
    topPages: null,
    technology: null,
    referrers: null,
    realtime: null
  });
  const [loadingData, setLoadingData] = useState(true);

  const dateRanges = [
    { label: 'Last 7 days', value: '7d', days: 7 },
    { label: 'Last 30 days', value: '30d', days: 30 },
    { label: 'Last 90 days', value: '90d', days: 90 }
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <ChartBarIcon className="w-4 h-4" /> },
    { key: 'pages', label: 'Pages', icon: <GlobeAltIcon className="w-4 h-4" /> },
    { key: 'technology', label: 'Technology', icon: <ComputerDesktopIcon className="w-4 h-4" /> },
    { key: 'referrers', label: 'Referrers', icon: <FunnelIcon className="w-4 h-4" /> }
  ];

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

  // Update selected website from query params
  useEffect(() => {
    if (websiteId) {
      setSelectedWebsite(websiteId);
    }
  }, [websiteId]);

  // Fetch analytics data
  useEffect(() => {
    if (selectedWebsite && dateRange) {
      fetchAnalyticsData();
    }
  }, [selectedWebsite, dateRange]);

  const fetchWebsites = async () => {
    try {
      const response = await websiteAPI.getWebsites();
      setWebsites(response.websites || []);
    } catch (error) {
      toast.error('Failed to fetch websites');
    }
  };

  const fetchAnalyticsData = async () => {
    if (!selectedWebsite) return;
    
    const days = dateRanges.find(range => range.value === dateRange)?.days || 7;
    setLoadingData(true);
    
    try {
      const [overview, chartData, topPages, technology, referrers, realtime] = await Promise.allSettled([
        analyticsAPI.getOverview(selectedWebsite, days),
        analyticsAPI.getChartData(selectedWebsite, days),
        analyticsAPI.getTopPages(selectedWebsite, days),
        analyticsAPI.getTechnologyAnalytics(selectedWebsite, days),
        analyticsAPI.getReferrerAnalytics(selectedWebsite, days, 10),
        analyticsAPI.getRealtime(selectedWebsite)
      ]);

      setAnalyticsData({
        overview: overview.status === 'fulfilled' ? overview.value?.overview : null,
        chartData: chartData.status === 'fulfilled' ? chartData.value?.chartData : null,
        topPages: topPages.status === 'fulfilled' ? topPages.value?.topPages : null,
        technology: technology.status === 'fulfilled' ? technology.value?.technology : null,
        referrers: referrers.status === 'fulfilled' ? referrers.value?.referrers : null,
        realtime: realtime.status === 'fulfilled' ? realtime.value : null
      });
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoadingData(false);
    }
  };

  const getChartOptions = () => {
    if (!analyticsData.chartData?.length) return {};

    return {
      chart: {
        type: 'line',
        height: 400,
        backgroundColor: 'transparent'
      },
      title: { text: null },
      xAxis: {
        categories: analyticsData.chartData.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        gridLineWidth: 0,
        lineColor: '#e5e7eb'
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
        line: {
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
          data: analyticsData.chartData.map(item => item.pageViews || 0),
          color: '#3b82f6'
        },
        {
          name: 'Unique Visitors',
          data: analyticsData.chartData.map(item => item.uniqueVisitors || 0),
          color: '#10b981'
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

  const currentWebsite = websites.find(w => w.website_id === selectedWebsite);

  if (loading || !websites.length) {
    return (
      <ModernLayout title="Analytics">
        <div className="space-y-8">
          <LoadingCard />
          <StatsGrid>
            {[1,2,3,4].map(i => <LoadingCard key={i} />)}
          </StatsGrid>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Analytics">
      <div className="space-y-8">
        {/* Header & Controls */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                {currentWebsite ? `${currentWebsite.name} • ${currentWebsite.domain}` : 'Select a website to view analytics'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedWebsite}
                onChange={(e) => {
                  setSelectedWebsite(e.target.value);
                  router.push(`/analytics?website=${e.target.value}`, undefined, { shallow: true });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Website</option>
                {websites.map((website) => (
                  <option key={website.website_id} value={website.website_id}>
                    {website.name}
                  </option>
                ))}
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              
              <Button variant="outline">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {!selectedWebsite ? (
          <EmptyState
            icon={<ChartBarIcon className="w-10 h-10" />}
            title="Select a Website"
            description="Choose a website from the dropdown above to view detailed analytics."
          />
        ) : (
          <>
            {/* Key Metrics */}
            {loadingData ? (
              <StatsGrid>
                {[1,2,3,4].map(i => <LoadingCard key={i} />)}
              </StatsGrid>
            ) : analyticsData.overview ? (
              <StatsGrid>
                <MetricCard
                  title="Total Visits"
                  value={analyticsData.overview.totalVisits || 0}
                  icon={<UsersIcon className="h-6 w-6" />}
                />
                <MetricCard
                  title="Unique Visitors"
                  value={analyticsData.overview.uniqueVisitors || 0}
                  icon={<EyeIcon className="h-6 w-6" />}
                />
                <MetricCard
                  title="Page Views"
                  value={analyticsData.overview.pageViews || 0}
                  icon={<ChartBarIcon className="h-6 w-6" />}
                />
                <MetricCard
                  title="Avg. Duration"
                  value={`${Math.round(analyticsData.overview.avgDuration || 0)}s`}
                  icon={<ClockIcon className="h-6 w-6" />}
                />
              </StatsGrid>
            ) : null}

            {/* Traffic Chart */}
            {analyticsData.chartData?.length > 0 && (
              <ChartContainer title="Traffic Trends" height="h-96">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={getChartOptions()}
                />
              </ChartContainer>
            )}

            {/* Detailed Analytics Tabs */}
            <Card className="p-0">
              <div className="p-6 border-b border-gray-200">
                <TabNavigation 
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>
              
              <div className="p-6">
                {activeTab === 'overview' && <OverviewTab data={analyticsData} />}
                {activeTab === 'pages' && <PagesTab data={analyticsData.topPages} />}
                {activeTab === 'technology' && <TechnologyTab data={analyticsData.technology} />}
                {activeTab === 'referrers' && <ReferrersTab data={analyticsData.referrers} />}
              </div>
            </Card>
          </>
        )}
      </div>
    </ModernLayout>
  );
}

// Tab Components
function OverviewTab({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Activity</h3>
        {data.realtime ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Visitors</span>
              <Badge variant="success">{data.realtime.currentVisitors || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Page Views (5min)</span>
              <Badge variant="blue">{data.realtime.currentPageViews || 0}</Badge>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No real-time data available</p>
        )}
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Bounce Rate</span>
            <Badge>--</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Conversion Rate</span>
            <Badge>--</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PagesTab({ data }) {
  if (!data?.length) {
    return (
      <EmptyState
        icon={<GlobeAltIcon className="w-8 h-8" />}
        title="No Page Data"
        description="Page analytics will appear here once you have traffic."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
      <div className="space-y-3">
        {data.map((page, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{page.url}</div>
              <div className="text-sm text-gray-500">{page.visits} visits</div>
            </div>
            <Badge variant="blue">{page.visits}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechnologyTab({ data }) {
  if (!data) {
    return (
      <EmptyState
        icon={<ComputerDesktopIcon className="w-8 h-8" />}
        title="No Technology Data"
        description="Device and browser analytics will appear here."
      />
    );
  }

  const { devices = [], browsers = [], operatingSystems = [] } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TechSection title="Devices" data={devices} />
      <TechSection title="Browsers" data={browsers} />
      <TechSection title="Operating Systems" data={operatingSystems} />
    </div>
  );
}

function TechSection({ title, data }) {
  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {data?.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{item.name}</span>
            <div className="flex items-center space-x-3">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${item.percentage || 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-8">{item.percentage || 0}%</span>
            </div>
          </div>
        )) || <p className="text-sm text-gray-500">No data available</p>}
      </div>
    </div>
  );
}

function ReferrersTab({ data }) {
  if (!data?.length) {
    return (
      <EmptyState
        icon={<FunnelIcon className="w-8 h-8" />}
        title="No Referrer Data"
        description="Traffic source analytics will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Top Traffic Sources</h3>
      <div className="space-y-3">
        {data.map((referrer, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{referrer.referrer || 'Direct Traffic'}</div>
              <div className="text-sm text-gray-500">{referrer.uniqueVisitors} unique visitors</div>
            </div>
            <Badge variant="blue">{referrer.visits}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}