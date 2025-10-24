import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { authAPI } from '../utils/api';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    company: '',
    location: '',
    website: ''
  });
  const [stats, setStats] = useState({
    totalWebsites: 0,
    totalPageViews: 0,
    accountCreated: '',
    lastLogin: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Mock profile data
      const mockProfile = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'Senior Web Developer passionate about analytics and user experience',
        company: 'Tech Corp Inc.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev'
      };

      const mockStats = {
        totalWebsites: 5,
        totalPageViews: 125000,
        accountCreated: '2024-01-15',
        lastLogin: new Date().toISOString()
      };

      setProfile(mockProfile);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // await authAPI.updateProfile(profile);
      console.log('Profile updated:', profile);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Profile">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile">
      {/* Profile Header */}
      <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '0.75rem',
            background: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: '700',
            flexShrink: 0
          }}>
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              color: 'var(--text-primary)', 
              margin: '0 0 0.5rem 0',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              {profile.name || 'User'}
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              margin: '0 0 0.5rem 0',
              fontSize: '1rem'
            }}>
              {profile.email}
            </p>
            <p style={{ 
              color: 'var(--text-muted)', 
              margin: 0,
              fontSize: '0.875rem'
            }}>
              {profile.bio || 'No bio provided'}
            </p>
          </div>

          <button className="btn btn-secondary">
            Change Avatar
          </button>
        </div>
      </div>

      {/* Account Stats */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Total Websites</h3>
            <div className="card-icon primary">🌐</div>
          </div>
          <div className="card-content">
            <div className="metric-value">{stats.totalWebsites}</div>
            <p className="metric-label">Tracked websites</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Total Page Views</h3>
            <div className="card-icon success">📊</div>
          </div>
          <div className="card-content">
            <div className="metric-value">{formatNumber(stats.totalPageViews)}</div>
            <p className="metric-label">All-time views</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Member Since</h3>
            <div className="card-icon warning">📅</div>
          </div>
          <div className="card-content">
            <div className="metric-value" style={{ fontSize: '1.25rem' }}>
              {formatDate(stats.accountCreated)}
            </div>
            <p className="metric-label">Account created</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Last Login</h3>
            <div className="card-icon primary">🕐</div>
          </div>
          <div className="card-content">
            <div className="metric-value" style={{ fontSize: '1.25rem' }}>
              {new Date(stats.lastLogin).toLocaleDateString()}
            </div>
            <p className="metric-label">Recent activity</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="dashboard-card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            Profile Information
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                style={{ width: '100%' }}
                placeholder="Enter your full name"
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
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                style={{ width: '100%' }}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Company
              </label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                style={{ width: '100%' }}
                placeholder="Your company name"
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
                Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                style={{ width: '100%' }}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Website
            </label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              style={{ width: '100%' }}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={loadProfile}
            >
              Reset
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            Security & Privacy
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Change Password
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Update your password to keep your account secure
              </p>
            </div>
            <button className="btn btn-secondary">
              Change
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Two-Factor Authentication
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Add an extra layer of security to your account
              </p>
            </div>
            <button className="btn btn-primary">
              Enable
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '0.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Download Data
              </h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
                Export all your data and analytics
              </p>
            </div>
            <button className="btn btn-secondary">
              Export
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}