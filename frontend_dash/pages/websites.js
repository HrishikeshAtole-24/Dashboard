import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { useRouter } from 'next/router';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { websiteAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Websites() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: ''
  });
  const [copiedTrackingId, setCopiedTrackingId] = useState(null);

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
      setLoadingData(true);
      const response = await websiteAPI.getAll();
      if (response.success && response.data) {
        setWebsites(response.data);
      } else {
        toast.error('Failed to load websites');
      }
    } catch (error) {
      console.error('Websites fetch error:', error);
      toast.error('Error loading websites');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      if (selectedWebsite) {
        // Update existing website
        response = await websiteAPI.update(selectedWebsite.id, formData);
      } else {
        // Create new website
        response = await websiteAPI.create(formData);
      }

      if (response.success) {
        toast.success(selectedWebsite ? 'Website updated successfully' : 'Website added successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        setFormData({ name: '', domain: '', description: '' });
        setSelectedWebsite(null);
        fetchWebsites();
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Website operation error:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!selectedWebsite) return;

    try {
      const response = await websiteAPI.delete(selectedWebsite.id);
      if (response.success) {
        toast.success('Website deleted successfully');
        setShowDeleteModal(false);
        setSelectedWebsite(null);
        fetchWebsites();
      } else {
        toast.error('Failed to delete website');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Error deleting website');
    }
  };

  const copyTrackingCode = (trackingId, domain) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://dashboard-backend-twj7.onrender.com';
    const trackingCode = `<!-- Analytics Tracking Script -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${apiUrl}/tracking/script.js';
  script.setAttribute('data-website-id', '${trackingId}');
  script.async = true;
  document.head.appendChild(script);
})();
</script>`;
    
    navigator.clipboard.writeText(trackingCode).then(() => {
      setCopiedTrackingId(trackingId);
      toast.success('Tracking code copied to clipboard');
      setTimeout(() => setCopiedTrackingId(null), 2000);
    }).catch(() => {
      toast.error('Failed to copy tracking code');
    });
  };

  const openAddModal = () => {
    setFormData({ name: '', domain: '', description: '' });
    setSelectedWebsite(null);
    setShowAddModal(true);
  };

  const openEditModal = (website) => {
    setFormData({
      name: website.name,
      domain: website.domain,
      description: website.description || ''
    });
    setSelectedWebsite(website);
    setShowEditModal(true);
  };

  const openDeleteModal = (website) => {
    setSelectedWebsite(website);
    setShowDeleteModal(true);
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

  return (
    <DashboardLayout title="Websites">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Websites</h2>
            <p className="text-gray-600">Manage and track analytics for your websites</p>
          </div>
          <button
            onClick={openAddModal}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Website
          </button>
        </div>

        {/* Websites List */}
        {loadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {websites.map((website) => (
              <div key={website.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {website.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/analytics?website=${website.id}`)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="View Analytics"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(website)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Edit Website"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(website)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Website"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Domain:</strong> {website.domain}
                    </p>
                    {website.description && (
                      <p className="text-sm text-gray-600">
                        <strong>Description:</strong> {website.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <strong>Tracking ID:</strong>
                      <code className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        {website.website_id}
                      </code>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      website.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {website.is_active ? 'Active' : 'Inactive'}
                    </span>
                    
                    <button
                      onClick={() => copyTrackingCode(website.website_id, website.domain)}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {copiedTrackingId === website.website_id ? (
                        <CheckIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                      )}
                      {copiedTrackingId === website.website_id ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {websites.length === 0 && (
              <div className="col-span-full">
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No websites</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first website to track.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={openAddModal}
                      className="btn-primary"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add your first website
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Website Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedWebsite ? 'Edit Website' : 'Add New Website'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="form-label">
                        Website Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="form-input"
                        placeholder="My Awesome Website"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="domain" className="form-label">
                        Domain
                      </label>
                      <input
                        type="text"
                        id="domain"
                        required
                        className="form-input"
                        placeholder="example.com"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="form-label">
                        Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        className="form-input"
                        placeholder="Brief description of your website"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3"
                  >
                    {selectedWebsite ? 'Update Website' : 'Add Website'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="mt-3 btn-secondary sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWebsite && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete Website
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{selectedWebsite.name}"? 
                        This action cannot be undone and all analytics data for this website will be lost.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}