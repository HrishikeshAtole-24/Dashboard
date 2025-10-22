import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ModernLayout from '../components/ModernLayout';
import { 
  Card, 
  SectionHeader, 
  Button, 
  LoadingCard, 
  EmptyState,
  Badge
} from '../components/UIComponents';
import { useRouter } from 'next/router';
import {
  GlobeAltIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  XCircleIcon
} from '../components/icons';
import { websiteAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Websites() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: ''
  });

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

  const fetchWebsites = async () => {
    setLoadingData(true);
    try {
      const response = await websiteAPI.getWebsites();
      setWebsites(response.websites || []);
    } catch (error) {
      toast.error('Failed to fetch websites');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.domain) {
      toast.error('Name and domain are required');
      return;
    }

    try {
      if (editingWebsite) {
        await websiteAPI.updateWebsite(editingWebsite.website_id, formData);
        toast.success('Website updated successfully');
      } else {
        await websiteAPI.addWebsite(formData);
        toast.success('Website added successfully');
      }
      
      setFormData({ name: '', domain: '', description: '' });
      setShowAddForm(false);
      setEditingWebsite(null);
      fetchWebsites();
    } catch (error) {
      toast.error(editingWebsite ? 'Failed to update website' : 'Failed to add website');
    }
  };

  const handleEdit = (website) => {
    setEditingWebsite(website);
    setFormData({
      name: website.name,
      domain: website.domain,
      description: website.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (websiteId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await websiteAPI.deleteWebsite(websiteId);
      toast.success('Website deleted successfully');
      fetchWebsites();
    } catch (error) {
      toast.error('Failed to delete website');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', domain: '', description: '' });
    setShowAddForm(false);
    setEditingWebsite(null);
  };

  if (loading) {
    return (
      <ModernLayout title="Websites">
        <div className="space-y-6">
          <LoadingCard />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <LoadingCard key={i} />)}
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Websites">
      <div className="space-y-8">
        {/* Header */}
        <Card>
          <SectionHeader
            title="Website Management"
            subtitle="Add and manage your websites for analytics tracking"
            action={
              <Button onClick={() => setShowAddForm(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Website
              </Button>
            }
          />
        </Card>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingWebsite ? 'Edit Website' : 'Add New Website'}
                </h3>
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome Website"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain *
                  </label>
                  <input
                    type="url"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your website"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit">
                  {editingWebsite ? 'Update Website' : 'Add Website'}
                </Button>
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Websites Grid */}
        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <LoadingCard key={i} />)}
          </div>
        ) : websites.length === 0 ? (
          <EmptyState
            icon={<GlobeAltIcon className="w-12 h-12" />}
            title="No Websites Yet"
            description="Start tracking your website analytics by adding your first website."
            action={
              <Button onClick={() => setShowAddForm(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Your First Website
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <WebsiteCard
                key={website.website_id}
                website={website}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewAnalytics={() => router.push(`/analytics?website=${website.website_id}`)}
              />
            ))}
          </div>
        )}

        {/* Tracking Code Instructions */}
        {websites.length > 0 && (
          <Card>
            <SectionHeader
              title="Integration Guide"
              subtitle="How to add tracking to your websites"
            />
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CodeBracketIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Add Tracking Code
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Copy and paste this tracking script before the closing &lt;/head&gt; tag on every page you want to track.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    {`<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'http://localhost:5000/track.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    This script will automatically start tracking page views and user interactions.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ModernLayout>
  );
}

function WebsiteCard({ website, onEdit, onDelete, onViewAnalytics }) {
  const isActive = true; // You can add logic to check if tracking is active

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <GlobeAltIcon className="w-6 h-6 text-white" />
        </div>
        <Badge variant={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {website.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {website.domain}
        </p>
        {website.description && (
          <p className="text-sm text-gray-500">
            {website.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(website)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(website.website_id, website.name)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAnalytics}
          >
            <ChartBarIcon className="w-4 h-4 mr-1" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status</span>
          <div className="flex items-center space-x-2">
            {isActive ? (
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-red-500" />
            )}
            <span className={isActive ? 'text-green-600' : 'text-red-600'}>
              {isActive ? 'Tracking Active' : 'Not Tracking'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}