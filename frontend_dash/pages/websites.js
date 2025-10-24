import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { websiteAPI } from '../utils/api';

export default function Websites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: ''
  });

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const response = await websiteAPI.getAll();
      if (response.success) {
        setWebsites(response.data);
      }
    } catch (error) {
      console.error('Error loading websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWebsite) {
        await websiteAPI.update(editingWebsite._id, formData);
      } else {
        await websiteAPI.create(formData);
      }
      
      setShowModal(false);
      setEditingWebsite(null);
      setFormData({ name: '', url: '', description: '' });
      loadWebsites();
    } catch (error) {
      console.error('Error saving website:', error);
    }
  };

  const handleEdit = (website) => {
    setEditingWebsite(website);
    setFormData({
      name: website.name,
      url: website.url,
      description: website.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (websiteId) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      try {
        await websiteAPI.delete(websiteId);
        loadWebsites();
      } catch (error) {
        console.error('Error deleting website:', error);
      }
    }
  };

  const getTrackingCode = (websiteId) => {
    return `<script async src="http://localhost:3000/track.js" data-website-id="${websiteId}"></script>`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  if (loading) {
    return (
      <DashboardLayout title="Website Management">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading websites...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Website Management">
      {/* Add Website Button */}
      <div className="header-actions">
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <span>+</span>
          Add Website
        </button>
      </div>

      {/* Websites Grid */}
      {websites.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🌐</div>
          <h3>No websites yet</h3>
          <p>Add your first website to start tracking analytics</p>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Add Website
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          {websites.map((website) => (
            <div key={website._id} className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title" style={{ textTransform: 'none', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    {website.name}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                    {website.url}
                  </p>
                </div>
                <div className="card-icon primary">🌐</div>
              </div>

              <div className="card-content">
                <p className="metric-label" style={{ marginBottom: '1rem' }}>
                  {website.description || 'No description provided'}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <p className="metric-label" style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                    Tracking Code:
                  </p>
                  <div style={{
                    background: 'var(--secondary-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    fontFamily: 'Monaco, Menlo, monospace',
                    wordBreak: 'break-all',
                    color: 'var(--text-secondary)'
                  }}>
                    {getTrackingCode(website._id)}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(getTrackingCode(website._id))}
                    className="btn btn-secondary"
                    style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                  >
                    📋 Copy Code
                  </button>
                </div>

                <div className="status-badge active" style={{ marginBottom: '1rem' }}>
                  ACTIVE
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button 
                  onClick={() => window.open(`/analytics?website=${website._id}`, '_blank')}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.75rem' }}
                >
                  📊 View Analytics
                </button>
                <button 
                  onClick={() => handleEdit(website)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem' }}
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(website._id)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', color: 'var(--danger)' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Installation Guide */}
      <div className="data-table" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h3 className="table-title">📚 How to Install Tracking</h3>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                Step 1: Copy the tracking code
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Copy the tracking code from your website card above
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                Step 2: Add to your website
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Paste the code just before the closing &lt;/head&gt; tag in your HTML
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                Step 3: Verify installation
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Visit your website and check the real-time analytics to confirm tracking is working
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            margin: '1rem'
          }}>
            <h2 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1.5rem',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {editingWebsite ? 'Edit Website' : 'Add New Website'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Website Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%' }}
                  placeholder="My Awesome Website"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Website URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  style={{ width: '100%' }}
                  placeholder="https://example.com"
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                  placeholder="Brief description of your website..."
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingWebsite(null);
                    setFormData({ name: '', url: '', description: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingWebsite ? 'Update Website' : 'Add Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}