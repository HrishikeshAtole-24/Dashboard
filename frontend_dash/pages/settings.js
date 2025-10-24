import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function Settings() {
  const [settings, setSettings] = useState({
    // Dashboard Settings
    theme: 'dark',
    defaultTimeframe: '30',
    autoRefresh: true,
    refreshInterval: '30',
    dateFormat: 'MM/DD/YYYY',
    
    // Notification Settings
    emailNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    alertThresholds: true,
    realTimeAlerts: false,
    
    // Privacy Settings
    dataRetention: '365',
    anonymizeIPs: true,
    cookieConsent: true,
    shareAnalytics: false,
    
    // API Settings
    apiEnabled: true,
    apiRateLimit: '1000',
    webhookUrl: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Mock settings loading
      // In real app, load from API
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading settings...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      {/* Dashboard Settings */}
      <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            🎨 Dashboard Settings
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Default Timeframe
              </label>
              <select
                value={settings.defaultTimeframe}
                onChange={(e) => updateSetting('defaultTimeframe', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Date Format
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Auto Refresh Interval
              </label>
              <select
                value={settings.refreshInterval}
                onChange={(e) => updateSetting('refreshInterval', e.target.value)}
                disabled={!settings.autoRefresh}
                style={{ width: '100%' }}
              >
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Auto Refresh
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Automatically refresh dashboard data
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoRefresh}
              onChange={(e) => updateSetting('autoRefresh', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            🔔 Notification Settings
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Email Notifications
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Receive email updates about your analytics
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Weekly Reports
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Receive weekly analytics summaries
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.weeklyReports}
              onChange={(e) => updateSetting('weeklyReports', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Monthly Reports
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Receive monthly analytics reports
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.monthlyReports}
              onChange={(e) => updateSetting('monthlyReports', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Alert Thresholds
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Get notified when metrics exceed thresholds
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.alertThresholds}
              onChange={(e) => updateSetting('alertThresholds', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Real-time Alerts
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Instant notifications for real-time events
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.realTimeAlerts}
              onChange={(e) => updateSetting('realTimeAlerts', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            🔒 Privacy & Data
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Data Retention Period
            </label>
            <select
              value={settings.dataRetention}
              onChange={(e) => updateSetting('dataRetention', e.target.value)}
              style={{ width: '100%', maxWidth: '300px' }}
            >
              <option value="90">90 days</option>
              <option value="180">6 months</option>
              <option value="365">1 year</option>
              <option value="730">2 years</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Anonymize IP Addresses
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Automatically anonymize visitor IP addresses
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.anonymizeIPs}
              onChange={(e) => updateSetting('anonymizeIPs', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Cookie Consent Banner
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Show cookie consent banner on tracked websites
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.cookieConsent}
              onChange={(e) => updateSetting('cookieConsent', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Share Analytics
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Allow sharing analytics data with team members
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.shareAnalytics}
              onChange={(e) => updateSetting('shareAnalytics', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            🔧 API Settings
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                API Access
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Enable API access for external integrations
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.apiEnabled}
              onChange={(e) => updateSetting('apiEnabled', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              API Rate Limit (requests/hour)
            </label>
            <select
              value={settings.apiRateLimit}
              onChange={(e) => updateSetting('apiRateLimit', e.target.value)}
              disabled={!settings.apiEnabled}
              style={{ width: '100%', maxWidth: '300px' }}
            >
              <option value="100">100 requests/hour</option>
              <option value="500">500 requests/hour</option>
              <option value="1000">1,000 requests/hour</option>
              <option value="5000">5,000 requests/hour</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Webhook URL (optional)
            </label>
            <input
              type="url"
              value={settings.webhookUrl}
              onChange={(e) => updateSetting('webhookUrl', e.target.value)}
              style={{ width: '100%' }}
              placeholder="https://your-webhook-url.com/analytics"
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>
              Receive real-time analytics events at this URL
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button 
          onClick={loadSettings}
          className="btn btn-secondary"
        >
          Reset
        </button>
        <button 
          onClick={handleSave}
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </DashboardLayout>
  );
}