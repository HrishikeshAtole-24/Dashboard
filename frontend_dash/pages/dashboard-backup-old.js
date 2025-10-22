import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import EnhancedAnalytics from '../components/EnhancedAnalytics';
import { useRouter } from 'next/router';
import {
  GlobeAltIcon,
  PlusIcon,
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
          <GlobeAltIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No websites</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first website.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/websites')}
              className="btn btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Website
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="min-h-screen bg-gray-50">
        <div className="space-y-6 p-6">
          {/* Simple Header */}
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600">
                  Real-time insights and analytics for your websites
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Website Selector */}
                <div className="flex flex-col">
                  <label className="text-gray-700 text-sm font-medium mb-2">Select Website</label>
                  <select 
                    value={selectedWebsite} 
                    onChange={(e) => setSelectedWebsite(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Website</option>
                    {websites.map((website) => (
                      <option key={website.website_id} value={website.website_id}>
                        {website.name} • {website.domain}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Time Period Selector */}
                <div className="flex flex-col">
                  <label className="text-blue-100 text-sm font-medium mb-2">📅 Period</label>
                  <select 
                    value={selectedDays} 
                    onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                    className="select-modern text-gray-700"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Content */}
          {selectedWebsite ? (
            <EnhancedAnalytics 
              websiteId={selectedWebsite} 
              days={selectedDays}
            />
          ) : (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <GlobeAltIcon className="mx-auto h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Ready to Analyze!
                </h3>
                <p className="text-gray-600 mb-6">
                  Select a website from the dropdown above to view comprehensive analytics and insights.
                </p>
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-blue-700">
                    Tip: Use different time periods to analyze trends
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}