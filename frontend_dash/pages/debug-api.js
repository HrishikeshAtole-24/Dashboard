import { useState } from 'react';
import { websiteAPI, analyticsAPI } from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';

export default function DebugAPI() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testAPI = async (name, apiCall) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const result = await apiCall();
      setResults(prev => ({ ...prev, [name]: { success: true, data: result } }));
    } catch (error) {
      setResults(prev => ({ ...prev, [name]: { success: false, error: error.message, response: error.response?.data } }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    {
      name: 'Get Websites',
      test: () => testAPI('websites', () => websiteAPI.getAll())
    },
    {
      name: 'Test Analytics API',
      test: () => testAPI('analytics', () => analyticsAPI.getOverview('test-id', 30))
    },
    {
      name: 'Test Tracking Script',
      test: () => testAPI('tracking', () => fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://dashboard-backend-twj7.onrender.com'}/tracking/script.js`).then(r => r.text()))
    }
  ];

  return (
    <DashboardLayout title="API Debug">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">API Connection Debug</h1>
        
        <div className="space-y-4">
          {tests.map(({ name, test }) => (
            <div key={name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">{name}</h2>
                <button
                  onClick={test}
                  disabled={loading[name.toLowerCase().replace(' ', '')]}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading[name.toLowerCase().replace(' ', '')] ? 'Testing...' : 'Test'}
                </button>
              </div>
              
              {results[name.toLowerCase().replace(' ', '')] && (
                <div className="mt-2">
                  <div className={`p-3 rounded ${
                    results[name.toLowerCase().replace(' ', '')].success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(results[name.toLowerCase().replace(' ', '')], null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Quick Fixes Checklist:</h3>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>✅ Backend running on http://localhost:5000</li>
            <li>✅ Frontend running on http://localhost:3000</li>
            <li>✅ API imports updated to use websiteAPI and analyticsAPI</li>
            <li>✅ CORS configured for localhost:3000</li>
            <li>✅ Tracking script served at /tracking/script.js</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}