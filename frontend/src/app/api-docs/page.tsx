'use client';

import { useState, useEffect } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import Link from 'next/link';

interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  category: string;
  language: string;
  requiresAuth: boolean;
  rateLimit: number;
  params: string;
  exampleCode: string;
  enabled: boolean;
  status: string;
}

export default function ApiDocsPage() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      const response = await fetch('/api/endpoints?status=approved&enabled=true');
      const data = await response.json();
      
      if (response.ok) {
        setEndpoints(data.endpoints);
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(endpoints.map(e => e.category)))];
  const methods = ['all', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;
    const matchesMethod = selectedMethod === 'all' || endpoint.method === selectedMethod;
    const matchesSearch = searchQuery === '' || 
      endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesMethod && matchesSearch;
  });

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-600',
      POST: 'bg-green-600',
      PUT: 'bg-yellow-600',
      DELETE: 'bg-red-600',
      PATCH: 'bg-purple-600',
    };
    return colors[method] || 'bg-gray-600';
  };

  const generateCurlExample = (endpoint: ApiEndpoint) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
    const url = `${baseUrl}/api/execute${endpoint.path}`;
    
    let curl = `curl -X ${endpoint.method}`;
    
    if (endpoint.requiresAuth) {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY"`;
    }
    
    curl += ` \\\n  -H "Content-Type: application/json"`;
    
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.params) {
      try {
        const params = JSON.parse(endpoint.params);
        const exampleData: Record<string, any> = {};
        params.forEach((param: any) => {
          exampleData[param.name] = param.example || `example_${param.name}`;
        });
        curl += ` \\\n  -d '${JSON.stringify(exampleData, null, 2)}'`;
      } catch {}
    }
    
    curl += ` \\\n  "${url}"`;
    
    return curl;
  };

  const generateJavaScriptExample = (endpoint: ApiEndpoint) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
    const url = `${baseUrl}/api/execute${endpoint.path}`;
    
    let code = `const response = await fetch('${url}', {\n  method: '${endpoint.method}',\n  headers: {\n    'Content-Type': 'application/json'`;
    
    if (endpoint.requiresAuth) {
      code += `,\n    'Authorization': 'Bearer YOUR_API_KEY'`;
    }
    
    code += `\n  }`;
    
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.params) {
      try {
        const params = JSON.parse(endpoint.params);
        const exampleData: Record<string, any> = {};
        params.forEach((param: any) => {
          exampleData[param.name] = param.example || `example_${param.name}`;
        });
        code += `,\n  body: JSON.stringify(${JSON.stringify(exampleData, null, 4).replace(/\n/g, '\n  ')})`;
      } catch {}
    }
    
    code += `\n});\n\nconst data = await response.json();\nconsole.log(data);`;
    
    return code;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center">Loading API Documentation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">API Documentation</h1>
          <p className="text-gray-300">Explore and test our available API endpoints</p>
        </div>

        {/* Getting Started */}
        <GlowCard className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Get an API Key</h3>
              <p>
                <Link href="/admin/api-keys" className="text-purple-400 hover:text-purple-300">
                  Create an API key
                </Link>
                {' '}to authenticate your requests for protected endpoints.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Make Requests</h3>
              <p>All API endpoints are available at: <code className="bg-gray-800 px-2 py-1 rounded text-green-400">https://yourdomain.com/api/execute/[path]</code></p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Authentication</h3>
              <p>Include your API key in the Authorization header:</p>
              <div className="bg-gray-800 rounded-lg p-4 mt-2">
                <code className="text-green-400 text-sm">Authorization: Bearer YOUR_API_KEY</code>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">4. Rate Limits</h3>
              <p>Each endpoint has its own rate limit. Check the X-RateLimit-* headers in responses.</p>
            </div>
          </div>
        </GlowCard>

        {/* Filters */}
        <GlowCard className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Method</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {methods.map(method => (
                  <option key={method} value={method}>{method === 'all' ? 'All Methods' : method}</option>
                ))}
              </select>
            </div>
          </div>
        </GlowCard>

        {/* Endpoints List */}
        <div className="space-y-6">
          {filteredEndpoints.length === 0 ? (
            <GlowCard className="p-8 text-center">
              <p className="text-gray-400">No endpoints found matching your filters.</p>
            </GlowCard>
          ) : (
            filteredEndpoints.map((endpoint) => (
              <GlowCard key={endpoint.id} className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`${getMethodColor(endpoint.method)} px-3 py-1 rounded text-white text-sm font-bold`}>
                      {endpoint.method}
                    </span>
                    <code className="text-purple-400 text-lg font-mono">{endpoint.path}</code>
                    {endpoint.requiresAuth && (
                      <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 border border-yellow-500 rounded text-xs font-medium">
                        🔒 Auth Required
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{endpoint.name}</h3>
                  {endpoint.description && (
                    <p className="text-gray-300">{endpoint.description}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="text-white font-medium">{endpoint.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Language</p>
                    <p className="text-white font-medium">{endpoint.language}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rate Limit</p>
                    <p className="text-white font-medium">{endpoint.rateLimit} req/min</p>
                  </div>
                </div>

                {/* Parameters */}
                {endpoint.params && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-white mb-2">Parameters</h4>
                    <div className="bg-gray-800 rounded-lg p-4">
                      {(() => {
                        try {
                          const params = JSON.parse(endpoint.params);
                          return (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-gray-400 border-b border-gray-700">
                                  <th className="pb-2">Name</th>
                                  <th className="pb-2">Type</th>
                                  <th className="pb-2">Required</th>
                                  <th className="pb-2">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {params.map((param: any, idx: number) => (
                                  <tr key={idx} className="border-b border-gray-700/50">
                                    <td className="py-2 text-purple-400 font-mono">{param.name}</td>
                                    <td className="py-2 text-gray-300">{param.type}</td>
                                    <td className="py-2">
                                      {param.required ? (
                                        <span className="text-red-400">Yes</span>
                                      ) : (
                                        <span className="text-gray-500">No</span>
                                      )}
                                    </td>
                                    <td className="py-2 text-gray-300">{param.description || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          );
                        } catch {
                          return <p className="text-gray-400">No parameters defined</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* Code Examples */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Code Examples</h4>
                  
                  {/* cURL */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-400">cURL</h5>
                      <button
                        onClick={() => copyToClipboard(generateCurlExample(endpoint))}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm whitespace-pre-wrap">
                        {generateCurlExample(endpoint)}
                      </pre>
                    </div>
                  </div>

                  {/* JavaScript */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-400">JavaScript (Fetch API)</h5>
                      <button
                        onClick={() => copyToClipboard(generateJavaScriptExample(endpoint))}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
                        {generateJavaScriptExample(endpoint)}
                      </pre>
                    </div>
                  </div>
                </div>
              </GlowCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
