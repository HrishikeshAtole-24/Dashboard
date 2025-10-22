import { useState, useEffect } from 'react';
import { analyticsAPI } from '../utils/api';
import { 
  ChartBarIcon, 
  UsersIcon, 
  EyeIcon, 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from './icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function EnhancedAnalytics({ websiteId, days = 30 }) {
  const [data, setData] = useState({
    overview: null,
    chartData: null,
    topPages: null,
    technology: null,
    referrers: null,
    realtime: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (websiteId) {
      fetchAllAnalytics();
    }
  }, [websiteId, days]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all analytics data in parallel
      const [overview, chartData, topPages, technology, referrers, realtime] = await Promise.allSettled([
        analyticsAPI.getOverview(websiteId, days),
        analyticsAPI.getChartData(websiteId, days),
        analyticsAPI.getTopPages(websiteId, days),
        analyticsAPI.getTechnologyAnalytics(websiteId, days),
        analyticsAPI.getReferrerAnalytics(websiteId, days, 10),
        analyticsAPI.getRealtime(websiteId)
      ]);

      setData({
        overview: overview.status === 'fulfilled' ? overview.value : null,
        chartData: chartData.status === 'fulfilled' ? chartData.value : null,
        topPages: topPages.status === 'fulfilled' ? topPages.value : null,
        technology: technology.status === 'fulfilled' ? technology.value : null,
        referrers: referrers.status === 'fulfilled' ? referrers.value : null,
        realtime: realtime.status === 'fulfilled' ? realtime.value : null
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAggregation = async () => {
    try {
      await analyticsAPI.triggerAggregation(websiteId);
      // Refresh data after aggregation
      setTimeout(() => {
        fetchAllAnalytics();
      }, 2000);
    } catch (error) {
      console.error('Error triggering aggregation:', error);
    }
  };

  const getChartOptions = () => {
    if (!data.chartData?.chartData) return {};

    return {
      chart: {
        type: 'line',
        height: 400,
        backgroundColor: 'transparent'
      },
      title: {
        text: 'Analytics Overview',
        style: { color: '#1f2937' }
      },
      xAxis: {
        categories: data.chartData.chartData.map(item => 
          new Date(item.date).toLocaleDateString()
        ),
        title: { text: 'Date' }
      },
      yAxis: [{
        title: { text: 'Page Views' },
        min: 0
      }],
      tooltip: {
        shared: true,
        crosshairs: true
      },
      series: [
        {
          name: 'Page Views',
          data: data.chartData.chartData.map(item => item.pageViews || 0),
          color: '#3b82f6'
        },
        {
          name: 'Unique Visitors',
          data: data.chartData.chartData.map(item => item.uniqueVisitors || 0),
          color: '#10b981'
        },
        {
          name: 'Visits',
          data: data.chartData.chartData.map(item => item.visits || 0),
          color: '#f59e0b'
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
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <button 
          onClick={triggerAggregation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Overview Stats */}
      {data.overview?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Visits"
            value={data.overview.overview.totalVisits || 0}
            icon={<UsersIcon className="h-8 w-8 text-blue-600" />}
            change={`${days} days`}
          />
          <StatCard
            title="Unique Visitors"
            value={data.overview.overview.uniqueVisitors || 0}
            icon={<EyeIcon className="h-8 w-8 text-green-600" />}
            change={`${days} days`}
          />
          <StatCard
            title="Page Views"
            value={data.overview.overview.pageViews || 0}
            icon={<ChartBarIcon className="h-8 w-8 text-purple-600" />}
            change={`${days} days`}
          />
          <StatCard
            title="Avg Duration"
            value={`${Math.round(data.overview.overview.avgDuration || 0)}s`}
            icon={<GlobeAltIcon className="h-8 w-8 text-orange-600" />}
            change={`${Math.round(data.overview.overview.bounceRate || 0)}% bounce`}
          />
        </div>
      )}

      {/* Real-time Stats */}
      {data.realtime && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Real-time Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.realtime.currentVisitors || 0}</div>
              <div className="text-sm text-gray-600">Active Visitors (30min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.realtime.currentPageViews || 0}</div>
              <div className="text-sm text-gray-600">Page Views (5min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.realtime.recentEvents?.length || 0}</div>
              <div className="text-sm text-gray-600">Recent Events</div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {data.chartData?.chartData?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <HighchartsReact
            highcharts={Highcharts}
            options={getChartOptions()}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['pages', 'technology', 'referrers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'pages' && (
            <TopPagesTab data={data.topPages} />
          )}
          
          {activeTab === 'technology' && (
            <TechnologyTab data={data.technology} />
          )}
          
          {activeTab === 'referrers' && (
            <ReferrersTab data={data.referrers} />
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, change }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon}
      </div>
      {change && (
        <p className="text-xs text-gray-500 mt-2">{change}</p>
      )}
    </div>
  );
}

// Top Pages Tab
function TopPagesTab({ data }) {
  if (!data?.topPages?.length) {
    return <div className="text-center text-gray-500 py-8">No page data available</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
      <div className="space-y-3">
        {data.topPages.map((page, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium truncate">{page.url}</span>
            <span className="text-sm text-gray-600">{page.visits} visits</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Technology Tab
function TechnologyTab({ data }) {
  if (!data?.technology) {
    return <div className="text-center text-gray-500 py-8">No technology data available</div>;
  }

  const { devices, browsers, operatingSystems } = data.technology;

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
      <h4 className="font-semibold mb-3">{title}</h4>
      <div className="space-y-2">
        {data?.slice(0, 5).map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm">{item.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${item.percentage || 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{item.percentage || 0}%</span>
            </div>
          </div>
        )) || <div className="text-sm text-gray-500">No data</div>}
      </div>
    </div>
  );
}

// Referrers Tab
function ReferrersTab({ data }) {
  if (!data?.referrers?.length) {
    return <div className="text-center text-gray-500 py-8">No referrer data available</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
      <div className="space-y-3">
        {data.referrers.map((referrer, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium truncate">{referrer.referrer || 'Direct'}</span>
            <div className="text-right">
              <div className="text-sm font-medium">{referrer.visits} visits</div>
              <div className="text-xs text-gray-600">{referrer.uniqueVisitors} unique</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}