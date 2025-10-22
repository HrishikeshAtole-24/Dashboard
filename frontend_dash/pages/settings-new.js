import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ModernLayout from '../components/ModernLayout';
import { 
  Card, 
  SectionHeader, 
  Button, 
  LoadingCard,
  Badge
} from '../components/UIComponents';
import { useRouter } from 'next/router';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '../components/icons';
import toast from 'react-hot-toast';

export default function Settings() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: {
      emailReports: true,
      weeklyDigest: true,
      alertThreshold: true,
      realTimeAlerts: false
    },
    privacy: {
      trackingEnabled: true,
      shareData: false,
      anonymizeIPs: true,
      dataRetention: '12'
    },
    preferences: {
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'en'
    }
  });
  const [activeSection, setActiveSection] = useState('notifications');

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      // Here you would typically call an API to save settings
      // await settingsAPI.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'privacy', label: 'Privacy & Data', icon: ShieldCheckIcon },
    { id: 'preferences', label: 'Preferences', icon: CogIcon },
    { id: 'danger', label: 'Danger Zone', icon: TrashIcon }
  ];

  if (loading) {
    return (
      <ModernLayout title="Settings">
        <div className="space-y-8">
          <LoadingCard />
          <LoadingCard />
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Settings">
      <div className="space-y-8">
        {/* Header */}
        <Card>
          <SectionHeader
            title="Account Settings"
            subtitle="Manage your preferences, notifications, and privacy settings"
            action={
              <Button onClick={saveSettings}>
                Save Changes
              </Button>
            }
          />
        </Card>

        {/* Settings Navigation & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Side Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-0">
              <nav className="space-y-1 p-4">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeSection === 'notifications' && <NotificationSettings settings={settings} onSettingChange={handleSettingChange} />}
            {activeSection === 'privacy' && <PrivacySettings settings={settings} onSettingChange={handleSettingChange} />}
            {activeSection === 'preferences' && <PreferenceSettings settings={settings} onSettingChange={handleSettingChange} />}
            {activeSection === 'danger' && <DangerZoneSettings />}
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}

// Notification Settings Component
function NotificationSettings({ settings, onSettingChange }) {
  const toggleSetting = (key) => {
    onSettingChange('notifications', key, !settings.notifications[key]);
  };

  return (
    <Card>
      <SectionHeader
        title="Notification Preferences"
        subtitle="Choose how you want to be notified about your analytics"
      />
      
      <div className="space-y-6">
        <SettingToggle
          label="Email Reports"
          description="Receive weekly analytics reports via email"
          checked={settings.notifications.emailReports}
          onChange={() => toggleSetting('emailReports')}
        />
        
        <SettingToggle
          label="Weekly Digest"
          description="Get a summary of your website performance every week"
          checked={settings.notifications.weeklyDigest}
          onChange={() => toggleSetting('weeklyDigest')}
        />
        
        <SettingToggle
          label="Alert Threshold"
          description="Notify when traffic drops below threshold"
          checked={settings.notifications.alertThreshold}
          onChange={() => toggleSetting('alertThreshold')}
        />
        
        <SettingToggle
          label="Real-time Alerts"
          description="Get instant notifications for significant traffic spikes"
          checked={settings.notifications.realTimeAlerts}
          onChange={() => toggleSetting('realTimeAlerts')}
        />
      </div>
    </Card>
  );
}

// Privacy Settings Component
function PrivacySettings({ settings, onSettingChange }) {
  const toggleSetting = (key) => {
    onSettingChange('privacy', key, !settings.privacy[key]);
  };

  return (
    <Card>
      <SectionHeader
        title="Privacy & Data Settings"
        subtitle="Control how your data is collected and stored"
      />
      
      <div className="space-y-6">
        <SettingToggle
          label="Analytics Tracking"
          description="Enable tracking on your websites"
          checked={settings.privacy.trackingEnabled}
          onChange={() => toggleSetting('trackingEnabled')}
        />
        
        <SettingToggle
          label="Anonymous IP Addresses"
          description="Anonymize visitor IP addresses for privacy"
          checked={settings.privacy.anonymizeIPs}
          onChange={() => toggleSetting('anonymizeIPs')}
        />
        
        <SettingToggle
          label="Share Aggregate Data"
          description="Help improve our service with anonymous usage data"
          checked={settings.privacy.shareData}
          onChange={() => toggleSetting('shareData')}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Retention Period
          </label>
          <select
            value={settings.privacy.dataRetention}
            onChange={(e) => onSettingChange('privacy', 'dataRetention', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            How long to keep your analytics data
          </p>
        </div>
      </div>
    </Card>
  );
}

// Preference Settings Component
function PreferenceSettings({ settings, onSettingChange }) {
  return (
    <Card>
      <SectionHeader
        title="General Preferences"
        subtitle="Customize your dashboard experience"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.preferences.timezone}
            onChange={(e) => onSettingChange('preferences', 'timezone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Kolkata">India Standard Time</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={settings.preferences.dateFormat}
            onChange={(e) => onSettingChange('preferences', 'dateFormat', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={settings.preferences.currency}
            onChange={(e) => onSettingChange('preferences', 'currency', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.preferences.language}
            onChange={(e) => onSettingChange('preferences', 'language', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

// Danger Zone Component
function DangerZoneSettings() {
  const handleExportData = () => {
    toast.success('Data export initiated. You will receive an email when ready.');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmed) {
      toast.error('Account deletion is not implemented yet');
    }
  };

  return (
    <Card className="border-red-200">
      <SectionHeader
        title="Danger Zone"
        subtitle="Irreversible and destructive actions"
      />
      
      <div className="space-y-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Export Account Data</h4>
              <p className="text-sm text-gray-600 mt-1">
                Download all your analytics data in JSON format
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              Export Data
            </Button>
          </div>
        </div>
        
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Toggle Switch Component
function SettingToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <h4 className="font-medium text-gray-900">{label}</h4>
          {checked ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <XCircleIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}