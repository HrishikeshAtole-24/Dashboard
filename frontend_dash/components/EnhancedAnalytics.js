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
  const [activeTab, setActiveTab] = useState('pages');

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
        type: 'area',
        height: 400,
        backgroundColor: 'transparent',
        style: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
        }
      },
      title: {
        text: null
      },
      xAxis: {
        categories: data.chartData.chartData.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        gridLineWidth: 0,
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          style: {
            color: '#6B7280',
            fontSize: '12px'
          }
        }
      },
      yAxis: {
        title: { text: null },
        gridLineColor: '#F3F4F6',
        gridLineWidth: 1,
        labels: {
          style: {
            color: '#6B7280',
            fontSize: '12px'
          }
        }
      },
      tooltip: {
        shared: true,
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        borderRadius: 8,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          offsetX: 0,
          offsetY: 4,
          opacity: 0.1,
          width: 10
        },
        style: {
          fontSize: '12px'
        }
      },
      plotOptions: {
        area: {
          fillOpacity: 0.1,
          lineWidth: 3,
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true,
                radius: 6,
                lineWidth: 2,
                lineColor: '#FFFFFF'
              }
            }
          },
          states: {
            hover: {
              lineWidth: 3
            }
          }
        }
      },
      series: [
        {
          name: 'Page Views',
          data: data.chartData.chartData.map(item => item.pageViews || 0),
          color: '#3B82F6',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(59, 130, 246, 0.2)'],
              [1, 'rgba(59, 130, 246, 0.05)']
            ]
          }
        },
        {
          name: 'Unique Visitors',
          data: data.chartData.chartData.map(item => item.uniqueVisitors || 0),
          color: '#10B981',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(16, 185, 129, 0.2)'],
              [1, 'rgba(16, 185, 129, 0.05)']
            ]
          }
        }
      ],
      credits: { enabled: false },
      legend: {
        enabled: false
      }
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <style jsx>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .metric-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .chart-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        .tab-button {
          transition: all 0.3s ease;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 500;
        }
        .tab-button.active {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }
        .tab-button:not(.active) {
          color: #64748b;
        }
        .tab-button:not(.active):hover {
          background: #f1f5f9;
          color: #334155;
        }
        .progress-bar {
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 4px;
          transition: width 0.6s ease;
        }
        .realtime-indicator {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .loading-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Header with Action Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Overview</h2>
          <p className="text-gray-600">Last {days} days • Real-time insights</p>
        </div>
        <button 
          onClick={triggerAggregation}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Real-time Stats Banner */}
      {data.realtime && (
        <div className="glass-card rounded-2xl p-6 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="realtime-indicator w-3 h-3 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{data.realtime.currentVisitors || 0}</div>
                <div className="text-sm text-gray-600">Active Now</div>
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
        </div>
      )}

      {/* Metrics Grid */}
      {data.overview?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Visits"
            value={data.overview.overview.totalVisits || 0}
            icon={<UsersIcon className="h-8 w-8 text-blue-600" />}
            gradient="from-blue-500 to-blue-600"
            change={12.5}
          />
          <MetricCard
            title="Unique Visitors"
            value={data.overview.overview.uniqueVisitors || 0}
            icon={<EyeIcon className="h-8 w-8 text-green-600" />}
            gradient="from-green-500 to-green-600"
            change={8.3}
          />
          <MetricCard
            title="Page Views"
            value={data.overview.overview.pageViews || 0}
            icon={<ChartBarIcon className="h-8 w-8 text-purple-600" />}
            gradient="from-purple-500 to-purple-600"
            change={15.7}
          />
          <MetricCard
            title="Avg Duration"
            value={`${Math.round(data.overview.overview.avgDuration || 0)}s`}
            icon={<GlobeAltIcon className="h-8 w-8 text-orange-600" />}
            gradient="from-orange-500 to-orange-600"
            change={-2.1}
          />
        </div>
      )}

      {/* Chart Section */}
      {data.chartData?.chartData?.length > 0 && (
        <div className="chart-container rounded-2xl p-8 shadow-lg border">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Traffic Trends</h3>
            <p className="text-gray-600">Page views and unique visitors over time</p>
          </div>
          <div className="h-96">
            <HighchartsReact
              highcharts={Highcharts}
              options={getChartOptions()}
            />
          </div>
        </div>
      )}

      {/* Detailed Analytics Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border">
        <div className="p-6 border-b border-gray-100">
          <div className="flex space-x-2">
            {['pages', 'technology', 'referrers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'pages' && '📄 Top Pages'}
                {tab === 'technology' && '💻 Technology'}
                {tab === 'referrers' && '🔗 Referrers'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'pages' && <TopPagesTab data={data.topPages} />}
          {activeTab === 'technology' && <TechnologyTab data={data.technology} />}
          {activeTab === 'referrers' && <ReferrersTab data={data.referrers} />}
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="loading-shimmer h-4 w-24 mb-4 rounded"></div>
            <div className="loading-shimmer h-8 w-16 mb-2 rounded"></div>
            <div className="loading-shimmer h-3 w-32 rounded"></div>
          </div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <div className="loading-shimmer h-80 w-full rounded"></div>
      </div>
    </div>
  );
}

// Enhanced Metric Card Component
function MetricCard({ title, value, icon, gradient, change }) {
  const isPositive = change > 0;
  
  return (
    <div className="metric-card rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} bg-opacity-10`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value?.toLocaleString?.() || value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );
}

// Top Pages Tab
function TopPagesTab({ data }) {
  if (!data?.topPages?.length) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No page data available</h3>
        <p className="text-gray-600">Page analytics will appear here once you have traffic</p>
      </div>
    );
  }

  const maxVisits = Math.max(...data.topPages.map(page => page.visits));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Most Popular Pages</h3>
      {data.topPages.map((page, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex-1">
            <div className="font-medium text-gray-900 mb-1">{page.url}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="progress-bar h-2 rounded-full" 
                style={{ width: `${(page.visits / maxVisits) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="ml-4 text-right">
            <div className="text-lg font-bold text-gray-900">{page.visits.toLocaleString()}</div>
            <div className="text-sm text-gray-600">visits</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Technology Tab
function TechnologyTab({ data }) {
  if (!data?.technology) {
    return (
      <div className="text-center py-12">
        <ComputerDesktopIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No technology data available</h3>
        <p className="text-gray-600">Device and browser analytics will appear here</p>
      </div>
    );
  }

  const { devices, browsers, operatingSystems } = data.technology;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <TechSection title="🖥️ Devices" data={devices} color="blue" />
      <TechSection title="🌐 Browsers" data={browsers} color="green" />
      <TechSection title="⚙️ Operating Systems" data={operatingSystems} color="purple" />
    </div>
  );
}

function TechSection({ title, data, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {data?.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{item.name}</span>
            <div className="flex items-center space-x-3">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className={`${colors[color]} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage || 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 w-10">{item.percentage || 0}%</span>
            </div>
          </div>
        )) || <div className="text-sm text-gray-500">No data available</div>}
      </div>
    </div>
  );
}

// Referrers Tab
function ReferrersTab({ data }) {
  if (!data?.referrers?.length) {
    return (
      <div className="text-center py-12">
        <GlobeAltIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No referrer data available</h3>
        <p className="text-gray-600">Traffic source analytics will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
      {data.referrers.map((referrer, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {referrer.referrer ? referrer.referrer.charAt(0).toUpperCase() : 'D'}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{referrer.referrer || 'Direct Traffic'}</div>
              <div className="text-sm text-gray-600">{referrer.uniqueVisitors} unique visitors</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{referrer.visits}</div>
            <div className="text-sm text-gray-600">visits</div>
          </div>
        </div>
      ))}
    </div>
  );
}