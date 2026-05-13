'use client';

import { useState } from 'react';

export default function TestAPICreate() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCreate = async () => {
    setLoading(true);
    setResult(null);

    const testData = {
      name: 'Test API',
      description: 'Test description',
      method: 'GET',
      path: '/api/v1/tool/test-api',
      category: 'tool',
      language: 'nodejs',
      code: `export default {
  name: "Test API",
  path: "/api/v1/tool/test-api",
  method: "GET",
  code: async (params) => {
    return {
      code: 200,
      status: true,
      message: 'Test successful',
      data: params
    };
  }
}`,
      requiresAuth: false,
      rateLimit: 100,
      enabled: true,
    };

    try {
      console.log('Sending test data:', testData);

      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      console.log('Response:', data);

      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
      });
    } catch (error: any) {
      console.error('Error:', error);
      setResult({
        error: error.message,
        stack: error.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test API Create Endpoint</h1>
      
      <button
        onClick={testCreate}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Create API'}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
