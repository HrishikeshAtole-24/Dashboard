import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Debug() {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    runTests();
  }, []);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setTestResults([]);
    
    // Test 1: Backend Health
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      addResult('Backend Health', response.ok, `Status: ${data.status}`);
    } catch (error) {
      addResult('Backend Health', false, `Error: ${error.message}`);
    }

    // Test 2: API Connection
    try {
      const response = await api.get('/dashboard/websites');
      addResult('API Connection', true, 'Successfully connected to API');
    } catch (error) {
      addResult('API Connection', false, `API Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Authentication
    if (isAuthenticated) {
      addResult('Authentication', true, `Logged in as: ${user?.email}`);
    } else {
      addResult('Authentication', false, 'Not authenticated');
    }

    // Test 4: Tracking Script
    try {
      const response = await fetch('http://localhost:5000/tracking/script.js');
      addResult('Tracking Script', response.ok, `Script served: ${response.status}`);
    } catch (error) {
      addResult('Tracking Script', false, `Script Error: ${error.message}`);
    }
  };

  const testWebsiteCreation = async () => {
    try {
      const testWebsite = {
        name: 'Test Website ' + Date.now(),
        domain: 'test' + Date.now() + '.com',
        description: 'Test website created from debug page'
      };

      const response = await api.post('/dashboard/websites', testWebsite);
      addResult('Website Creation', true, `Created: ${response.data.website?.name}`);
      toast.success('Test website created successfully!');
    } catch (error) {
      addResult('Website Creation', false, `Creation Error: ${error.response?.data?.message || error.message}`);
      toast.error('Website creation failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">System Tests</h2>
            <div className="space-x-2">
              <button
                onClick={runTests}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Rerun Tests
              </button>
              {isAuthenticated && (
                <button
                  onClick={testWebsiteCreation}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Test Website Creation
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded border-l-4 ${
                result.success 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{result.test}</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700">Authentication</h3>
              <p className="text-sm text-gray-600">Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
              {user && (
                <div className="text-sm text-gray-600">
                  <p>User: {user.name}</p>
                  <p>Email: {user.email}</p>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Configuration</h3>
              <p className="text-sm text-gray-600">Backend: http://localhost:5000</p>
              <p className="text-sm text-gray-600">Frontend: http://localhost:3000</p>
              <p className="text-sm text-gray-600">Environment: {process.env.NODE_ENV || 'development'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoints Status</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• GET /health - Health check</p>
            <p>• GET /api/dashboard/websites - List websites</p>
            <p>• POST /api/dashboard/websites - Create website</p>
            <p>• GET /tracking/script.js - Tracking script</p>
            <p>• POST /api/auth/login - Authentication</p>
            <p>• POST /api/auth/register - User registration</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/websites'}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Go to Websites Page
          </button>
        </div>
      </div>
    </div>
  );
}