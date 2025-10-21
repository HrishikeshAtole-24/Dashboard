import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { useRouter } from 'next/router';
import {
  CogIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BellIcon,
  UserGroupIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    currency: 'USD',
    language: 'en'
  });

  // Analytics settings
  const [analyticsSettings, setAnalyticsSettings] = useState({
    trackingEnabled: true,
    dataRetentionDays: 365,
    cookieConsent: true,
    ipAnonymization: false,
    excludeBouncesThreshold: 10,
    sessionTimeoutMinutes: 30
  });

  // API settings
  const [apiSettings, setApiSettings] = useState({
    apiKey: '',
    rateLimitPerHour: 1000,
    allowCors: true,
    enableWebhooks: false,
    webhookUrl: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.success) {
        const { general, analytics, api } = response.data.data;
        setGeneralSettings(general || generalSettings);
        setAnalyticsSettings(analytics || analyticsSettings);
        setApiSettings(api || apiSettings);
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
      // Use default settings if fetch fails
    }
  };

  const saveSettings = async (settingsType, settingsData) => {
    setSaving(true);
    try {
      const response = await api.put(`/settings/${settingsType}`, settingsData);
      if (response.data.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const generateNewApiKey = async () => {
    try {
      const response = await api.post('/settings/api/generate-key');
      if (response.data.success) {
        setApiSettings(prev => ({ ...prev, apiKey: response.data.apiKey }));
        toast.success('New API key generated');
      } else {
        toast.error('Failed to generate API key');
      }
    } catch (error) {
      console.error('API key generation error:', error);
      toast.error('Error generating API key');
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

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'api', name: 'API', icon: KeyIcon }
  ];

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Configure your analytics dashboard preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                    isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'general' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Preferences</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="timezone" className="form-label">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="form-input"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dateFormat" className="form-label">
                      Date Format
                    </label>
                    <select
                      id="dateFormat"
                      value={generalSettings.dateFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                      className="form-input"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="currency" className="form-label">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                      className="form-input"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language" className="form-label">
                      Language
                    </label>
                    <select
                      id="language"
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                      className="form-input"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => saveSettings('general', generalSettings)}
                  disabled={saving}
                  className={`btn-primary ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? 'Saving...' : 'Save General Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Configuration</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="trackingEnabled"
                        type="checkbox"
                        checked={analyticsSettings.trackingEnabled}
                        onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, trackingEnabled: e.target.checked })}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="trackingEnabled" className="font-medium text-gray-700">
                        Enable Tracking
                      </label>
                      <p className="text-gray-500">Collect analytics data from all websites</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dataRetentionDays" className="form-label">
                      Data Retention (days)
                    </label>
                    <select
                      id="dataRetentionDays"
                      value={analyticsSettings.dataRetentionDays}
                      onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, dataRetentionDays: parseInt(e.target.value) })}
                      className="form-input"
                    >
                      <option value={90}>90 days</option>
                      <option value={180}>6 months</option>
                      <option value={365}>1 year</option>
                      <option value={730}>2 years</option>
                      <option value={-1}>Forever</option>
                    </select>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="cookieConsent"
                        type="checkbox"
                        checked={analyticsSettings.cookieConsent}
                        onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, cookieConsent: e.target.checked })}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="cookieConsent" className="font-medium text-gray-700">
                        Respect Cookie Consent
                      </label>
                      <p className="text-gray-500">Only track users who have given consent</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="ipAnonymization"
                        type="checkbox"
                        checked={analyticsSettings.ipAnonymization}
                        onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, ipAnonymization: e.target.checked })}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="ipAnonymization" className="font-medium text-gray-700">
                        IP Anonymization
                      </label>
                      <p className="text-gray-500">Anonymize visitor IP addresses for privacy</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="excludeBouncesThreshold" className="form-label">
                        Bounce Threshold (seconds)
                      </label>
                      <input
                        type="number"
                        id="excludeBouncesThreshold"
                        min="0"
                        max="60"
                        value={analyticsSettings.excludeBouncesThreshold}
                        onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, excludeBouncesThreshold: parseInt(e.target.value) })}
                        className="form-input"
                      />
                      <p className="mt-1 text-sm text-gray-500">Time before a visit is considered engaged</p>
                    </div>

                    <div>
                      <label htmlFor="sessionTimeoutMinutes" className="form-label">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        id="sessionTimeoutMinutes"
                        min="5"
                        max="120"
                        value={analyticsSettings.sessionTimeoutMinutes}
                        onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, sessionTimeoutMinutes: parseInt(e.target.value) })}
                        className="form-input"
                      />
                      <p className="mt-1 text-sm text-gray-500">Time before a session expires</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => saveSettings('analytics', analyticsSettings)}
                  disabled={saving}
                  className={`btn-primary ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? 'Saving...' : 'Save Analytics Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="apiKey" className="form-label">
                      API Key
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="password"
                        id="apiKey"
                        value={apiSettings.apiKey}
                        readOnly
                        className="form-input flex-1 bg-gray-50"
                        placeholder="No API key generated"
                      />
                      <button
                        onClick={generateNewApiKey}
                        className="btn-secondary"
                      >
                        Generate New Key
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Use this key to access the analytics API programmatically
                    </p>
                  </div>

                  <div>
                    <label htmlFor="rateLimitPerHour" className="form-label">
                      Rate Limit (requests per hour)
                    </label>
                    <select
                      id="rateLimitPerHour"
                      value={apiSettings.rateLimitPerHour}
                      onChange={(e) => setApiSettings({ ...apiSettings, rateLimitPerHour: parseInt(e.target.value) })}
                      className="form-input"
                    >
                      <option value={100}>100 requests/hour</option>
                      <option value={500}>500 requests/hour</option>
                      <option value={1000}>1,000 requests/hour</option>
                      <option value={5000}>5,000 requests/hour</option>
                      <option value={10000}>10,000 requests/hour</option>
                    </select>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="allowCors"
                        type="checkbox"
                        checked={apiSettings.allowCors}
                        onChange={(e) => setApiSettings({ ...apiSettings, allowCors: e.target.checked })}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="allowCors" className="font-medium text-gray-700">
                        Allow CORS
                      </label>
                      <p className="text-gray-500">Enable cross-origin requests to the API</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="enableWebhooks"
                        type="checkbox"
                        checked={apiSettings.enableWebhooks}
                        onChange={(e) => setApiSettings({ ...apiSettings, enableWebhooks: e.target.checked })}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="enableWebhooks" className="font-medium text-gray-700">
                        Enable Webhooks
                      </label>
                      <p className="text-gray-500">Send real-time updates to external services</p>
                    </div>
                  </div>

                  {apiSettings.enableWebhooks && (
                    <div>
                      <label htmlFor="webhookUrl" className="form-label">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        id="webhookUrl"
                        value={apiSettings.webhookUrl}
                        onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
                        className="form-input"
                        placeholder="https://your-app.com/webhook"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        URL where webhook notifications will be sent
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => saveSettings('api', apiSettings)}
                  disabled={saving}
                  className={`btn-primary ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? 'Saving...' : 'Save API Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}