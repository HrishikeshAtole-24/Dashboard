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
  Badge
} from '../components/UIComponents';
import { useRouter } from 'next/router';
import {
  UsersIcon,
  EyeIcon,
  ClockIcon,
  GlobeAltIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowPathIcon
} from '../components/icons';
import { websiteAPI, analyticsAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Realtime() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [realtimeData, setRealtimeData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // Fetch realtime data
  useEffect(() => {
    if (selectedWebsite) {
      fetchRealtimeData();
    }
  }, [selectedWebsite]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval;
    if (autoRefresh && selectedWebsite) {
      interval = setInterval(() => {
        fetchRealtimeData();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, selectedWebsite]);

  const fetchWebsites = async () => {
    try {
      const response = await websiteAPI.getWebsites();
      setWebsites(response.websites || []);
      if (response.websites?.length > 0) {
        setSelectedWebsite(response.websites[0].website_id);
      }
    } catch (error) {
      toast.error('Failed to fetch websites');
    }
  };

  const fetchRealtimeData = async () => {
    if (!selectedWebsite) return;
    
    setLoadingData(true);
    try {
      const response = await analyticsAPI.getRealtime(selectedWebsite);
      setRealtimeData(response);
    } catch (error) {
      toast.error('Failed to fetch realtime data');
    } finally {
      setLoadingData(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const currentWebsite = websites.find(w => w.website_id === selectedWebsite);

  if (loading) {
    return (
      <ModernLayout title="Real-time">
        <div className="space-y-8">
          <LoadingCard />
          <StatsGrid>
            {[1,2,3,4].map(i => <LoadingCard key={i} />)}
          </StatsGrid>
        </div>
      </ModernLayout>
    );
  }

  if (!websites.length) {
    return (
      <ModernLayout title="Real-time">
        <EmptyState
          icon={<UsersIcon className="w-12 h-12" />}
          title="No Websites Found"
          description="Add a website to start monitoring real-time visitor activity."
          action={
            <Button onClick={() => router.push('/websites')}>
              Add Website
            </Button>
          }
        />
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Real-time">
      <div className="space-y-8">
        {/* Header & Controls */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Real-time Analytics
              </h1>
              <p className="text-gray-600">
                {currentWebsite ? `${currentWebsite.name} • Live visitor activity` : 'Monitor live visitor activity'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Website</option>
                {websites.map((website) => (
                  <option key={website.website_id} value={website.website_id}>
                    {website.name}
                  </option>
                ))}
              </select>
              
              <div className="flex space-x-2">
                <Button
                  variant={autoRefresh ? 'primary' : 'outline'}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  size="sm"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Auto-refresh
                </Button>
                <Button onClick={fetchRealtimeData} size="sm">
                  Refresh Now
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {!selectedWebsite ? (
          <EmptyState
            icon={<UsersIcon className="w-10 h-10" />}
            title="Select a Website"
            description="Choose a website from the dropdown above to view real-time analytics."
          />
        ) : (
          <>
            {/* Live Stats */}
            {loadingData ? (
              <StatsGrid>
                {[1,2,3,4].map(i => <LoadingCard key={i} />)}
              </StatsGrid>
            ) : (
              <StatsGrid>
                <MetricCard
                  title="Active Visitors"
                  value={realtimeData?.currentVisitors || 0}
                  icon={<UsersIcon className="h-6 w-6" />}
                />
                <MetricCard
                  title="Page Views (5min)"
                  value={realtimeData?.currentPageViews || 0}
                  icon={<EyeIcon className="h-6 w-6" />}
                />
                <MetricCard
                  title="Recent Events"
                  value={realtimeData?.recentEvents?.length || 0}
                  icon={<ClockIcon className="h-6 w-6" />}
                />
                <MetricCard
                  title="Pages Active"
                  value={realtimeData?.activePages || 0}
                  icon={<GlobeAltIcon className="h-6 w-6" />}
                />
              </StatsGrid>
            )}

            {/* Live Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Events */}
              <Card>
                <SectionHeader 
                  title="Recent Activity" 
                  subtitle="Latest visitor interactions"
                />
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {realtimeData?.recentEvents?.length > 0 ? (
                    realtimeData.recentEvents.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full">
                          <EyeIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {event.url || 'Page view'}
                            </p>
                            <Badge variant="success" className="ml-2">
                              {formatTimeAgo(event.timestamp)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {event.userAgent && event.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} • 
                            {event.referrer || 'Direct'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Top Pages Right Now */}
              <Card>
                <SectionHeader 
                  title="Active Pages" 
                  subtitle="Most viewed pages right now"
                />
                <div className="space-y-4">
                  {realtimeData?.topActivePages?.length > 0 ? (
                    realtimeData.topActivePages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {page.url}
                          </p>
                          <p className="text-xs text-gray-500">
                            {page.activeVisitors} active visitor{page.activeVisitors !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Badge variant="blue">
                          {page.activeVisitors}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">No active pages</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Additional Real-time Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Traffic Sources */}
              <Card>
                <SectionHeader title="Live Traffic Sources" />
                <div className="space-y-3">
                  {realtimeData?.liveReferrers?.length > 0 ? (
                    realtimeData.liveReferrers.map((referrer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 truncate">
                          {referrer.source || 'Direct'}
                        </span>
                        <Badge variant="default">
                          {referrer.visitors}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No traffic sources</p>
                  )}
                </div>
              </Card>

              {/* Device Types */}
              <Card>
                <SectionHeader title="Device Types" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ComputerDesktopIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Desktop</span>
                    </div>
                    <Badge variant="default">
                      {realtimeData?.deviceBreakdown?.desktop || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Mobile</span>
                    </div>
                    <Badge variant="default">
                      {realtimeData?.deviceBreakdown?.mobile || 0}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Geographic Data */}
              <Card>
                <SectionHeader title="Visitor Locations" />
                <div className="space-y-3">
                  {realtimeData?.topCountries?.length > 0 ? (
                    realtimeData.topCountries.map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {country.name || 'Unknown'}
                          </span>
                        </div>
                        <Badge variant="default">
                          {country.visitors}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No location data</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Auto-refresh Notice */}
            {autoRefresh && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  <span className="inline-flex items-center">
                    <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                    Auto-refreshing every 30 seconds
                  </span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </ModernLayout>
  );
}