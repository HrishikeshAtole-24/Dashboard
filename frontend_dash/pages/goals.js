import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../components/DashboardLayout';
import { goalsAPI, websiteAPI, analyticsAPI } from '../utils/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ChartBarIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '../components/icons';

export default function Goals() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [conversionRates, setConversionRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal_type: 'url_destination',
    conditions: {},
    value: 0
  });

  useEffect(() => {
    loadWebsites();
    initializeGoals();
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      loadGoals();
      loadConversionRates();
    }
  }, [selectedWebsite]);

  const initializeGoals = async () => {
    try {
      await goalsAPI.initialize();
      console.log('Goals table initialized');
    } catch (error) {
      console.error('Failed to initialize goals:', error);
    }
  };

  const loadWebsites = async () => {
    try {
      const response = await websiteAPI.getAll();
      setWebsites(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedWebsite(response.data[0].website_id);
      }
    } catch (error) {
      console.error('Error loading websites:', error);
    }
  };

  const loadGoals = async () => {
    if (!selectedWebsite) return;
    
    try {
      setLoading(true);
      const response = await goalsAPI.getAll(selectedWebsite);
      setGoals(response.goals || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversionRates = async () => {
    if (!selectedWebsite) return;
    
    try {
      const response = await analyticsAPI.getConversionRates(selectedWebsite, {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });
      setConversionRates(response.conversion_rates || []);
    } catch (error) {
      console.error('Error loading conversion rates:', error);
      setConversionRates([]);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    
    try {
      // Validate conditions before submitting
      const conditions = getConditionsForGoalType(formData.goal_type, formData.conditions);
      
      // Check for placeholder text or invalid selectors
      if (formData.goal_type === 'click' && conditions.selector) {
        if (conditions.selector.includes('(or your') || conditions.selector.includes('placeholder')) {
          alert('Please enter a valid CSS selector, not the placeholder text.');
          return;
        }
      }
      
      const goalData = {
        website_id: selectedWebsite,
        ...formData,
        conditions
      };
      
      console.log('Creating goal with data:', goalData);
      
      await goalsAPI.create(goalData);
      setShowCreateModal(false);
      resetForm();
      loadGoals();
      loadConversionRates();
    } catch (error) {
      console.error('Error creating goal:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        alert('Validation errors: ' + error.response.data.errors.join(', '));
      } else {
        alert('Failed to create goal. Please try again.');
      }
    }
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    
    try {
      // Validate conditions before submitting
      const conditions = getConditionsForGoalType(formData.goal_type, formData.conditions);
      
      // Check for placeholder text or invalid selectors
      if (formData.goal_type === 'click' && conditions.selector) {
        if (conditions.selector.includes('(or your') || conditions.selector.includes('placeholder')) {
          alert('Please enter a valid CSS selector, not the placeholder text.');
          return;
        }
      }
      
      const updateData = {
        ...formData,
        conditions
      };
      
      await goalsAPI.update(selectedGoal.id, updateData);
      setShowEditModal(false);
      setSelectedGoal(null);
      resetForm();
      loadGoals();
      loadConversionRates();
    } catch (error) {
      console.error('Error updating goal:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        alert('Validation errors: ' + error.response.data.errors.join(', '));
      } else {
        alert('Failed to update goal. Please try again.');
      }
    }
  };
  const handleProcessCompletions = async () => {
    if (!selectedWebsite) return;
    
    try {
      setLoading(true);
      const result = await goalsAPI.processCompletions(selectedWebsite);
      alert(`Processing completed! ${result.stats.conversionsRecorded} conversions recorded from ${result.stats.eventsProcessed} events.`);
      
      // Reload data to show new conversions
      loadGoals();
      loadConversionRates();
    } catch (error) {
      console.error('Error processing completions:', error);
      alert('Failed to process goal completions. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
  };

  const getConditionsForGoalType = (goalType, conditions) => {
    switch (goalType) {
      case 'url_destination':
        return {
          url: conditions.url || '',
          match_type: conditions.match_type || 'contains'
        };
      case 'event':
        return {
          event_type: conditions.event_type || 'click',
          custom_data: conditions.custom_data || {}
        };
      case 'page_duration':
        return {
          duration: parseInt(conditions.duration) || 60
        };
      case 'form_submit':
        return {
          form_id: conditions.form_id || '',
          selector: conditions.selector || ''
        };
      case 'click':
        return {
          selector: conditions.selector || ''
        };
      case 'download':
        return {
          fileName: conditions.fileName || '',
          fileUrl: conditions.fileUrl || '',
          fileType: conditions.fileType || '',
          match_type: conditions.match_type || 'contains'
        };
      default:
        return conditions;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      goal_type: 'url_destination',
      conditions: {},
      value: 0
    });
  };

  const openEditModal = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      goal_type: goal.goal_type,
      conditions: goal.conditions || {},
      value: parseFloat(goal.value) || 0
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (goal) => {
    setSelectedGoal(goal);
    setShowDeleteModal(true);
  };

  const renderConditionsForm = () => {
    switch (formData.goal_type) {
      case 'url_destination':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target URL
              </label>
              <input
                type="text"
                placeholder="/thank-you"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={formData.conditions.url || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  conditions: { ...formData.conditions, url: e.target.value }
                })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Match Type
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={formData.conditions.match_type || 'contains'}
                onChange={(e) => setFormData({
                  ...formData,
                  conditions: { ...formData.conditions, match_type: e.target.value }
                })}
              >
                <option value="exact">Exact Match</option>
                <option value="contains">Contains</option>
                <option value="regex">Regex Pattern</option>
              </select>
            </div>
          </div>
        );
        
      case 'event':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Type
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={formData.conditions.event_type || 'click'}
                onChange={(e) => setFormData({
                  ...formData,
                  conditions: { ...formData.conditions, event_type: e.target.value }
                })}
              >
                <option value="click">Click</option>
                <option value="form_submit">Form Submit</option>
                <option value="download">Download</option>
                <option value="custom">Custom Event</option>
              </select>
            </div>
          </div>
        );
        
      case 'page_duration':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Duration (seconds)
            </label>
            <input
              type="number"
              min="1"
              placeholder="60"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              value={formData.conditions.duration || ''}
              onChange={(e) => setFormData({
                ...formData,
                conditions: { ...formData.conditions, duration: e.target.value }
              })}
              required
            />
          </div>
        );
        
      case 'form_submit':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Form ID or CSS Selector
            </label>
            <input
              type="text"
              placeholder="#contact-form or .signup-form"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              value={formData.conditions.selector || formData.conditions.form_id || ''}
              onChange={(e) => setFormData({
                ...formData,
                conditions: { 
                  ...formData.conditions, 
                  selector: e.target.value,
                  form_id: e.target.value 
                }
              })}
              required
            />
          </div>
        );
        
      case 'click':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CSS Selector
            </label>
            <input
              type="text"
              placeholder="#signup-btn or .cta-button"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              value={formData.conditions.selector || ''}
              onChange={(e) => setFormData({
                ...formData,
                conditions: { 
                  ...formData.conditions, 
                  selector: e.target.value
                }
              })}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter a CSS selector like "#download-btn" or ".resume-link"
            </p>
          </div>
        );
        
      case 'download':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File Name (optional)
              </label>
              <input
                type="text"
                placeholder="resume.pdf"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={formData.conditions.fileName || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  conditions: { ...formData.conditions, fileName: e.target.value }
                })}
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave blank to track any file download
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File URL (optional)
              </label>
              <input
                type="text"
                placeholder="/hrishi_resume.pdf"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={formData.conditions.fileUrl || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  conditions: { ...formData.conditions, fileUrl: e.target.value }
                })}
              />
              <p className="text-xs text-gray-400 mt-1">
                Part of the file URL to match
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File Type (optional)
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={formData.conditions.fileType || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  conditions: { ...formData.conditions, fileType: e.target.value }
                })}
              >
                <option value="">Any file type</option>
                <option value="pdf">PDF</option>
                <option value="doc">DOC</option>
                <option value="docx">DOCX</option>
                <option value="zip">ZIP</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Match Type
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={formData.conditions.match_type || 'contains'}
                onChange={(e) => setFormData({
                  ...formData,
                  conditions: { ...formData.conditions, match_type: e.target.value }
                })}
              >
                <option value="exact">Exact Match</option>
                <option value="contains">Contains</option>
                <option value="regex">Regex Pattern</option>
              </select>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getGoalTypeLabel = (type) => {
    const labels = {
      url_destination: 'URL Destination',
      event: 'Event Tracking',
      page_duration: 'Page Duration',
      form_submit: 'Form Submission',
      click: 'Click Tracking',
      download: 'File Download'
    };
    return labels[type] || type;
  };

  const getConditionsDisplay = (goal) => {
    switch (goal.goal_type) {
      case 'url_destination':
        return `URL ${goal.conditions.match_type === 'exact' ? 'equals' : 'contains'}: ${goal.conditions.url}`;
      case 'event':
        return `Event type: ${goal.conditions.event_type}`;
      case 'page_duration':
        return `Min duration: ${goal.conditions.duration}s`;
      case 'form_submit':
        return `Form: ${goal.conditions.form_id || goal.conditions.selector}`;
      case 'click':
        return `Element: ${goal.conditions.selector || goal.conditions.element_id}`;
      case 'download':
        const downloadParts = [];
        if (goal.conditions.fileName) downloadParts.push(`File: ${goal.conditions.fileName}`);
        if (goal.conditions.fileUrl) downloadParts.push(`URL contains: ${goal.conditions.fileUrl}`);
        if (goal.conditions.fileType) downloadParts.push(`Type: ${goal.conditions.fileType.toUpperCase()}`);
        return downloadParts.length > 0 ? downloadParts.join(', ') : 'Any file download';
      default:
        return 'Custom conditions';
    }
  };

  return (
    <DashboardLayout>
      <div className="goals-page">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Goals & Conversions</h1>
            <p className="page-description">
              Track and measure specific user actions as conversions
            </p>
          </div>
          <div className="header-actions">
            <select
              className="website-selector"
              value={selectedWebsite}
              onChange={(e) => setSelectedWebsite(e.target.value)}
            >
              <option value="">Select Website</option>
              {websites.map((website) => (
                <option key={website.website_id} value={website.website_id}>
                  {website.name} ({website.domain})
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
              disabled={!selectedWebsite}
            >
              <PlusIcon className="w-5 h-5" />
              Create Goal
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleProcessCompletions}
              disabled={!selectedWebsite || loading}
              title="Process existing events for goal completions"
            >
              <ChartBarIcon className="w-5 h-5" />
              {loading ? 'Processing...' : 'Process Goals'}
            </button>
          </div>
        </div>

        {/* Conversion Rates Overview */}
        {selectedWebsite && conversionRates.length > 0 && (
          <div className="stats-grid mb-8">
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Goals</h3>
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="stat-value">{goals.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Conversions</h3>
                <CheckIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="stat-value">
                {conversionRates.reduce((sum, rate) => sum + parseInt(rate.conversions || 0), 0)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3>Avg Conversion Rate</h3>
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="stat-value">
                {conversionRates.length > 0
                  ? (conversionRates.reduce((sum, rate) => sum + parseFloat(rate.conversion_rate || 0), 0) / conversionRates.length).toFixed(2)
                  : 0}%
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Value</h3>
                <ChartBarIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="stat-value">
                ${conversionRates.reduce((sum, rate) => sum + parseFloat(rate.total_value || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="goals-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading goals...</p>
            </div>
          ) : !selectedWebsite ? (
            <div className="empty-state">
              <ChartBarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3>Select a Website</h3>
              <p>Choose a website to view and manage goals</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="empty-state">
              <ChartBarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3>No Goals Yet</h3>
              <p>Create your first goal to start tracking conversions</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Create First Goal
              </button>
            </div>
          ) : (
            <div className="goals-list">
              {goals.map((goal) => {
                const conversionData = conversionRates.find(rate => rate.goal_id === goal.id);
                
                return (
                  <div key={goal.id} className="goal-card">
                    <div className="goal-header">
                      <div className="goal-info">
                        <h3 className="goal-name">{goal.name}</h3>
                        <p className="goal-type">{getGoalTypeLabel(goal.goal_type)}</p>
                        {goal.description && (
                          <p className="goal-description">{goal.description}</p>
                        )}
                        <p className="goal-conditions">{getConditionsDisplay(goal)}</p>
                      </div>
                      <div className="goal-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => router.push(`/goal-conversions?goalId=${goal.id}&goalName=${encodeURIComponent(goal.name)}`)}
                          title="View Conversions"
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(goal)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openDeleteModal(goal)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {conversionData && (
                      <div className="goal-stats">
                        <div className="stat">
                          <span className="stat-label">Conversions</span>
                          <span className="stat-value">{conversionData.conversions}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Rate</span>
                          <span className="stat-value">{conversionData.conversion_rate}%</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Value</span>
                          <span className="stat-value">${parseFloat(conversionData.total_value || 0).toFixed(2)}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Sessions</span>
                          <span className="stat-value">{conversionData.converting_sessions}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="goal-footer">
                      <span className={`goal-status ${goal.is_active ? 'active' : 'inactive'}`}>
                        {goal.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="goal-value">
                        Value: ${parseFloat(goal.value || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Goal Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Create New Goal</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateGoal} className="modal-body">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Goal Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Purchase Completed"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Optional description of what this goal measures"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Goal Type *
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      value={formData.goal_type}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        goal_type: e.target.value,
                        conditions: {} 
                      })}
                    >
                      <option value="url_destination">URL Destination</option>
                      <option value="event">Event Tracking</option>
                      <option value="page_duration">Page Duration</option>
                      <option value="form_submit">Form Submission</option>
                      <option value="click">Click Tracking</option>
                      <option value="download">File Download</option>
                    </select>
                  </div>
                  
                  {renderConditionsForm()}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Goal Value ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </form>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleCreateGoal}
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Goal Modal */}
        {showEditModal && selectedGoal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Edit Goal</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedGoal(null);
                    resetForm();
                  }}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateGoal} className="modal-body">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Goal Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Goal Type *
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      value={formData.goal_type}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        goal_type: e.target.value,
                        conditions: {} 
                      })}
                    >
                      <option value="url_destination">URL Destination</option>
                      <option value="event">Event Tracking</option>
                      <option value="page_duration">Page Duration</option>
                      <option value="form_submit">Form Submission</option>
                      <option value="click">Click Tracking</option>
                      <option value="download">File Download</option>
                    </select>
                  </div>
                  
                  {renderConditionsForm()}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Goal Value ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      className="mr-2"
                      checked={formData.is_active !== false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-300">
                      Goal is active
                    </label>
                  </div>
                </div>
              </form>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedGoal(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleUpdateGoal}
                >
                  Update Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedGoal && (
          <div className="modal-overlay">
            <div className="modal modal-sm">
              <div className="modal-header">
                <h2>Delete Goal</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedGoal(null);
                  }}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="text-center">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Are you sure?
                  </h3>
                  <p className="text-gray-400 mb-4">
                    This will permanently delete the goal "{selectedGoal.name}" and all its conversion data. This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedGoal(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteGoal}
                >
                  Delete Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}