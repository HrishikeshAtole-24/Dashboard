import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import EnhancedAnalytics from '../components/EnhancedAnalytics';
import { useRouter } from 'next/router';
import {
  GlobeAltIcon,
  PlusIcon,
  ChevronDown
} from '../components/icons';
import { websiteAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [selectedDays, setSelectedDays] = useState(30);

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

  const fetchWebsites = async () => {
    try {
      const response = await websiteAPI.getAll();
      if (response.success && response.data.length > 0) {
        console.log('Websites data:', response.data); // Debug log
        setWebsites(response.data);
        // Use website_id (tracking ID) instead of database ID
        const firstWebsite = response.data[0];
        const websiteId = firstWebsite.website_id; // This is the tracking ID like "web_mh0j26qzc224338g7lt"
        console.log('Selected website ID:', websiteId);
        setSelectedWebsite(websiteId);
      } else {
        setWebsites([]);
      }
    } catch (error) {
      console.error('Websites fetch error:', error);
      toast.error('Error loading websites');
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

  // Show empty state if no websites
  if (websites.length === 0) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="text-center py-12">
          <GlobeAltIcon className="mx-auto icon-xl text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No websites</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first website.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/websites')}
              className="btn btn-primary inline-flex items-center"
            >
              <PlusIcon className="icon mr-2" />
              Add Website
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Enhanced Analytics Dashboard">
      <div className="space-y-6">
        {/* Website Selector */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor your website performance and visitor insights</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Website Selector */}
            <select 
              value={selectedWebsite} 
              onChange={(e) => setSelectedWebsite(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Website</option>
              {websites.map((website) => (
                <option key={website.website_id} value={website.website_id}>
                  {website.name} ({website.domain})
                </option>
              ))}
            </select>
            
            {/* Time Period Selector */}
            <select 
              value={selectedDays} 
              onChange={(e) => setSelectedDays(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Enhanced Analytics Component */}
        {selectedWebsite && (
          <EnhancedAnalytics 
            websiteId={selectedWebsite} 
            days={selectedDays}
          />
        )}

        {!selectedWebsite && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <GlobeAltIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Select a website to view analytics</h3>
            <p className="mt-2 text-gray-600">Choose a website from the dropdown above to see detailed analytics</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );


  const StatCard = ({ title, value, change, icon: Icon, isTime = false, color = 'blue' }) => {
    const isPositive = change > 0;
    const formattedValue = isTime ? `${Math.floor(value / 60)}m ${value % 60}s` : (typeof value === 'number' ? value.toLocaleString() : '0');
    
    const colorClasses = {
      blue: 'stat-card-blue',
      green: 'stat-card-green', 
      purple: 'stat-card-purple',
      orange: 'stat-card-orange'
    };
    
    return (
      <div className={`stat-card ${colorClasses[color]}`}>
        <div className="stat-card-header">
          <div className="stat-icon">
            <Icon className="h-6 w-6" />
          </div>
          <div className="stat-change">
            {change !== 0 && (
              <div className={`change-indicator ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? (
                  <ArrowTrendingUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3" />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="stat-content">
          <div className="stat-value">{formattedValue}</div>
          <div className="stat-label">{title}</div>
          <div className="stat-description">vs last period</div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-info">
              <h2 className="dashboard-title">Analytics Overview</h2>
              <div className="dashboard-subtitle">Monitor your website performance</div>
            </div>
            
            <div className="header-controls">
              {/* Website Selector */}
              {websites.length > 0 ? (
                <div className="control-group">
                  <label className="control-label">Website</label>
                  <Dropdown>
                    {({ isOpen, setIsOpen }) => (
                      <>
                        <DropdownTrigger 
                          className="control-select"
                          onClick={() => setIsOpen(!isOpen)}
                        >
                          {selectedWebsite ? 
                            `${websites.find(w => w.website_id === selectedWebsite)?.name}` : 
                            "Select Website"
                          }
                          <ChevronDown className="chevron-icon" />
                        </DropdownTrigger>
                        <DropdownContent>
                          {websites.map((website) => (
                            <DropdownItem
                              key={website.website_id}
                              onClick={() => {
                                setSelectedWebsite(website.website_id);
                                setIsOpen(false);
                              }}
                            >
                              <div className="dropdown-website">
                                <span className="website-name">{website.name}</span>
                                <span className="website-domain">{website.domain}</span>
                              </div>
                            </DropdownItem>
                          ))}
                        </DropdownContent>
                      </>
                    )}
                  </Dropdown>
                </div>
              ) : (
                <div className="no-websites">No websites available</div>
              )}
              
              {/* Date Range Buttons */}
              <div className="control-group">
                <label className="control-label">Time Period</label>
                <div className="date-buttons">
                  <button
                    className="date-btn"
                    onClick={() => handlePresetRange('last7')}
                  >
                    7D
                  </button>
                  <button
                    className="date-btn active"
                    onClick={() => handlePresetRange('last30')}
                  >
                    30D
                  </button>
                  <button
                    className="date-btn"
                    onClick={() => handlePresetRange('last90')}
                  >
                    90D
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats-grid">
          <StatCard
            title="Total Pageviews"
            value={dashboardData?.totalPageviews || 0}
            change={dashboardData?.pageviewsChange || 0}
            icon={EyeIcon}
            color="blue"
          />
          <StatCard
            title="Unique Visitors"
            value={dashboardData?.uniqueVisitors || 0}
            change={dashboardData?.visitorsChange || 0}
            icon={UsersIcon}
            color="green"
          />
          <StatCard
            title="Avg. Session Duration"
            value={dashboardData?.avgSessionDuration || 0}
            change={dashboardData?.sessionChange || 0}
            icon={ChartBarIcon}
            color="purple"
            isTime
          />
          <StatCard
            title="Bounce Rate"
            value={dashboardData?.bounceRate || 0}
            change={dashboardData?.bounceChange || 0}
            icon={CursorArrowRaysIcon}
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="dashboard-charts-grid">
          {/* Traffic Chart */}
          <div className="dashboard-chart-card main-chart">
            <div className="chart-header">
              <h3 className="chart-title">Traffic Overview</h3>
              <div className="chart-subtitle">Daily visitors and pageviews</div>
            </div>
            <div className="chart-container">
              {dashboardData && dashboardData.chartData && dashboardData.chartData.length > 0 ? (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: {
                      type: 'areaspline',
                      height: 350,
                      backgroundColor: 'transparent'
                    },
                    title: { text: null },
                    xAxis: {
                      categories: dashboardData.chartData.map(item => item.date),
                      gridLineColor: '#f1f5f9',
                      lineColor: '#e2e8f0',
                      tickColor: '#e2e8f0'
                    },
                    yAxis: {
                      title: { text: null },
                      gridLineColor: '#f1f5f9',
                      lineColor: '#e2e8f0'
                    },
                    plotOptions: {
                      areaspline: {
                        fillOpacity: 0.3,
                        lineWidth: 3,
                        marker: {
                          enabled: false,
                          states: {
                            hover: {
                              enabled: true,
                              radius: 5
                            }
                          }
                        }
                      }
                    },
                    series: [
                      {
                        name: 'Pageviews',
                        data: dashboardData.chartData.map(item => item.pageviews || 0),
                        color: '#3B82F6',
                        fillColor: {
                          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                          stops: [
                            [0, 'rgba(59, 130, 246, 0.3)'],
                            [1, 'rgba(59, 130, 246, 0.05)']
                          ]
                        }
                      },
                      {
                        name: 'Visitors',
                        data: dashboardData.chartData.map(item => item.visitors || 0),
                        color: '#10B981',
                        fillColor: {
                          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                          stops: [
                            [0, 'rgba(16, 185, 129, 0.3)'],
                            [1, 'rgba(16, 185, 129, 0.05)']
                          ]
                        }
                      }
                    ],
                    credits: { enabled: false },
                    legend: {
                      align: 'center',
                      verticalAlign: 'bottom',
                      layout: 'horizontal'
                    },
                    tooltip: {
                      shared: true,
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: 8,
                      shadow: false
                    }
                  }}
                />
              ) : (
                <div className="empty-chart-state">
                  <div className="empty-icon">
                    <ChartBarIcon className="h-12 w-12" />
                  </div>
                  <div className="empty-title">No traffic data available</div>
                  <div className="empty-description">Add the tracking script to your website to start collecting data</div>
                </div>
              )}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="dashboard-chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Device Breakdown</h3>
              <div className="chart-subtitle">Visitors by device type</div>
            </div>
            <div className="chart-container">
              {dashboardData && dashboardData.deviceData && dashboardData.deviceData.length > 0 ? (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: {
                      type: 'pie',
                      height: 350,
                      backgroundColor: 'transparent'
                    },
                    title: { text: null },
                    plotOptions: {
                      pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                          enabled: true,
                          format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
                          style: {
                            fontSize: '12px'
                          }
                        },
                        showInLegend: true,
                        borderWidth: 0,
                        innerSize: '40%'
                      }
                    },
                    series: [{
                      name: 'Devices',
                      colorByPoint: true,
                      data: dashboardData.deviceData.map(item => ({
                        name: item.name,
                        y: item.value,
                        color: item.color
                      }))
                    }],
                    credits: { enabled: false },
                    legend: {
                      align: 'center',
                      verticalAlign: 'bottom',
                      layout: 'horizontal'
                    },
                    tooltip: {
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: 8,
                      shadow: false
                    }
                  }}
                />
              ) : (
                <div className="empty-chart-state">
                  <div className="empty-icon">
                    <DevicePhoneMobileIcon className="h-12 w-12" />
                  </div>
                  <div className="empty-title">No device data available</div>
                  <div className="empty-description">Device breakdown will appear here once you have visitors</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="dashboard-bottom-grid">
          {/* Top Pages */}
          <div className="dashboard-info-card">
            <div className="info-card-header">
              <h3 className="info-card-title">Top Pages</h3>
              <div className="info-card-subtitle">Most visited pages</div>
            </div>
            <div className="info-card-content">
              {dashboardData && dashboardData.topPages && dashboardData.topPages.length > 0 ? (
                <div className="pages-list">
                  {dashboardData.topPages.map((page, index) => (
                    <div key={index} className="page-item">
                      <div className="page-info">
                        <div className="page-path">{page.path}</div>
                        <div className="page-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${page.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="page-stats">
                        <div className="page-views">{page.pageviews.toLocaleString()}</div>
                        <div className="views-label">views</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <EyeIcon className="h-8 w-8" />
                  </div>
                  <div className="empty-title">No page data available</div>
                  <div className="empty-description">Page statistics will appear here once you have traffic</div>
                </div>
              )}
            </div>
          </div>

          {/* Websites Overview */}
          <div className="dashboard-info-card">
            <div className="info-card-header">
              <div>
                <h3 className="info-card-title">Your Websites</h3>
                <div className="info-card-subtitle">Manage your tracked sites</div>
              </div>
              <button
                onClick={() => router.push('/websites')}
                className="view-all-btn"
              >
                View all
              </button>
            </div>
            <div className="info-card-content">
              {websites.length > 0 ? (
                <div className="websites-list">
                  {websites.slice(0, 4).map((website) => (
                    <div key={website.id} className="website-item">
                      <div className="website-status">
                        <div className={`status-dot ${website.is_active ? 'active' : 'inactive'}`} />
                      </div>
                      <div className="website-details">
                        <div className="website-domain">{website.domain}</div>
                        <div className="website-name">{website.name}</div>
                      </div>
                      <div className="website-badge">
                        <span className={`status-badge ${website.is_active ? 'active' : 'inactive'}`}>
                          {website.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <GlobeAltIcon className="h-8 w-8" />
                  </div>
                  <div className="empty-title">No websites added yet</div>
                  <div className="empty-description">Add your first website to start tracking analytics</div>
                  <button
                    onClick={() => router.push('/websites')}
                    className="add-website-btn"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Website
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}