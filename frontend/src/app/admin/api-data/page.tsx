'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, Edit, Trash2, X, Code2, Globe, Clock, CheckCircle2, XCircle, AlertCircle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/ui/glow-card';
import { AnimatedButton, AnimatedIconButton } from '@/components/ui/animated-button';

export default function APIsPage() {
  const [apis, setApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    enabled: '',
    language: '',
  });
  
  // Sandbox test state
  const [testModal, setTestModal] = useState(false);
  const [testingApi, setTestingApi] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testParams, setTestParams] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchAPIs();
  }, [filter]);

  const fetchAPIs = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);
      if (filter.enabled) params.append('enabled', filter.enabled);
      if (filter.language) params.append('language', filter.language);

      const response = await fetch(`/api/endpoints?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setApis(data.endpoints);
      }
    } catch (error) {
      console.error('Failed to fetch APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API?')) return;

    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('API deleted successfully');
        fetchAPIs();
      } else {
        alert('Failed to delete API');
      }
    } catch (error) {
      alert('Error deleting API');
    }
  };

  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      if (response.ok) {
        fetchAPIs();
      }
    } catch (error) {
      alert('Error updating API');
    }
  };

  const openTestModal = async (api: any) => {
    setTestingApi(api);
    setTestModal(true);
    setTestResult(null);
    
    // Initialize params from API definition
    const initialParams: Record<string, any> = {};
    if (api.params) {
      try {
        const params = typeof api.params === 'string' ? JSON.parse(api.params) : api.params;
        params.forEach((param: any) => {
          initialParams[param.name] = param.default || '';
        });
      } catch (e) {
        console.error('Failed to parse params:', e);
      }
    }
    setTestParams(initialParams);
  };

  const handleTestCode = async () => {
    if (!testingApi) return;
    
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: testingApi.rawScript || testingApi.code,
          language: testingApi.language,
          testData: testParams // Send user-provided params
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to test code'
      });
    } finally {
      setTesting(false);
    }
  };

  const closeTestModal = () => {
    setTestModal(false);
    setTestingApi(null);
    setTestResult(null);
    setTestParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Data</h2>
          <p className="text-muted-foreground mt-1">Manage all your API endpoints</p>
        </div>
        <Link href="/admin/api-create">
          <AnimatedButton 
            className="gap-2"
            hoverScale={1.05}
          >
            <Plus className="h-4 w-4" />
            Create New API
          </AnimatedButton>
        </Link>
      </div>

      {/* Filters */}
      <GlowCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="">All Categories</option>
            <option value="tool">Tool</option>
            <option value="ai">AI</option>
            <option value="data">Data</option>
            <option value="custom">Custom</option>
          </select>

          <select
            value={filter.enabled}
            onChange={(e) => setFilter({ ...filter, enabled: e.target.value })}
            className="px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="">All States</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>

          <select
            value={filter.language}
            onChange={(e) => setFilter({ ...filter, language: e.target.value })}
            className="px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="">All Languages</option>
            <option value="nodejs">Node.js</option>
            <option value="php">PHP</option>
            <option value="go">Go</option>
            <option value="python">Python</option>
          </select>
        </div>
      </GlowCard>

      {/* APIs List */}
      <GlowCard className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading APIs...</p>
          </div>
        ) : apis.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No APIs found</p>
            <Link href="/admin/api-create">
              <AnimatedButton hoverScale={1.05}>
                Create your first API
              </AnimatedButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {apis.map((api) => (
              <div
                key={api.id}
                className="group relative bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section - Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold truncate">{api.name}</h3>
                      <Badge 
                        variant={
                          api.status === 'approved' ? 'default' :
                          api.status === 'pending' ? 'secondary' :
                          'destructive'
                        }
                        className="shrink-0"
                      >
                        {api.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {api.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {api.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {api.status}
                      </Badge>
                      <Badge 
                        variant={api.enabled ? 'default' : 'outline'}
                        className="shrink-0"
                      >
                        {api.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{api.description}</p>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <code className="bg-muted/50 px-2 py-0.5 rounded text-xs font-mono">
                          {api.path || api.endpoint}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Method:</span>
                        <Badge 
                          variant="outline" 
                          className={`font-mono text-xs ${
                            api.method === 'GET' ? 'border-green-500 text-green-600' :
                            api.method === 'POST' ? 'border-blue-500 text-blue-600' :
                            api.method === 'PUT' ? 'border-yellow-500 text-yellow-600' :
                            api.method === 'DELETE' ? 'border-red-500 text-red-600' :
                            ''
                          }`}
                        >
                          {api.method}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{api.language}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{api.category || '-'}</span>
                      </div>
                      {api.version && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">v{api.version}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <AnimatedIconButton
                      variant="outline"
                      size="icon"
                      onClick={() => openTestModal(api)}
                      title="Test API"
                      hoverScale={1.1}
                      className="h-9 w-9"
                    >
                      <Play className="h-4 w-4" />
                    </AnimatedIconButton>
                    <Link href={`/admin/api-edit/${api.id}`}>
                      <AnimatedIconButton 
                        variant="outline" 
                        size="icon" 
                        title="Edit API"
                        hoverScale={1.1}
                        className="h-9 w-9"
                      >
                        <Edit className="h-4 w-4" />
                      </AnimatedIconButton>
                    </Link>
                    <AnimatedIconButton
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(api.id)}
                      title="Delete API"
                      hoverScale={1.1}
                      className="h-9 w-9 hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </AnimatedIconButton>
                    <AnimatedButton
                      variant={api.enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleEnabled(api.id, api.enabled)}
                      hoverScale={1.05}
                      className="ml-2"
                    >
                      {api.enabled ? 'Disable' : 'Enable'}
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlowCard>

      {/* Test Sandbox Modal - Custom Tailwind Modal */}
      {testModal && testingApi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-background rounded-xl shadow-2xl w-[96vw] max-w-[1800px] h-[94vh] flex flex-col border border-border">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div className="flex-1">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-4xl">🧪</span>
                  Test API Sandbox
                </h2>
                <p className="text-muted-foreground mt-2 text-base">
                  {testingApi.name} - <code className="text-sm bg-muted px-2 py-1 rounded">{testingApi.path}</code>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeTestModal}
                className="shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* API Info */}
              <div className="bg-muted/50 rounded-lg p-6 border">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Method</span>
                    <span className={`inline-block px-4 py-2 rounded-md text-base font-semibold ${
                      testingApi.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      testingApi.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      testingApi.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {testingApi.method}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Language</span>
                    <span className="font-mono text-lg font-semibold">{testingApi.language}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Status</span>
                    <span className={`inline-block px-4 py-2 rounded-md text-base font-semibold ${
                      testingApi.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      testingApi.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {testingApi.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Code & Params Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Code Preview */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>📝</span> Source Code
                  </h4>
                  <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-auto text-sm font-mono h-[45vh] border border-slate-800 leading-relaxed">
                    {testingApi.rawScript || testingApi.code || 'No code available'}
                  </pre>
                </div>

                {/* Test Parameters */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>⚙️</span> Test Parameters
                  </h4>
                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg border h-[45vh] overflow-auto">
                    {Object.keys(testParams).length > 0 ? (
                      Object.entries(testParams).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium mb-1">
                            {key}
                          </label>
                          <input
                            type="text"
                            value={value as string}
                            onChange={(e) => setTestParams({ ...testParams, [key]: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            placeholder={`Enter ${key}`}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No parameters defined for this API
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <label className="block text-sm font-medium mb-1">
                        Add Custom Parameter
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Key"
                          id="customKey"
                          className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          id="customValue"
                          className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const keyInput = document.getElementById('customKey') as HTMLInputElement;
                            const valueInput = document.getElementById('customValue') as HTMLInputElement;
                            if (keyInput.value) {
                              setTestParams({ ...testParams, [keyInput.value]: valueInput.value });
                              keyInput.value = '';
                              valueInput.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Button */}
              <Button
                onClick={handleTestCode}
                disabled={testing}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {testing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Testing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">▶️</span>
                    Run Test
                  </>
                )}
              </Button>

              {/* Test Result */}
              {testResult && (
                <div className={`p-6 rounded-lg border-2 ${
                  testResult.success 
                    ? 'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700' 
                    : 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700'
                }`}>
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{testResult.success ? '✅' : '❌'}</span>
                    <div className="flex-1 min-w-0 space-y-3">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        {testResult.success ? (
                          <span className="text-green-600 dark:text-green-400">Test Passed</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">Test Failed</span>
                        )}
                      </h4>

                      {/* Error Details */}
                      {!testResult.success && testResult.result?.error && (
                        <div className="space-y-2">
                          <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Error:</p>
                            <p className="text-sm text-red-700 dark:text-red-400 font-mono mt-1">
                              {testResult.result.error}
                            </p>
                          </div>
                          
                          {testResult.result.hint && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">💡 Hint:</p>
                              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                {testResult.result.hint}
                              </p>
                            </div>
                          )}

                          {testResult.result.cleanedCode && (
                            <div>
                              <p className="text-sm font-semibold mb-2">Cleaned Code (after TypeScript removal):</p>
                              <pre className="text-xs bg-slate-950 text-slate-100 p-3 rounded border border-slate-800 overflow-auto max-h-60 font-mono leading-relaxed">
                                {testResult.result.cleanedCode}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Full Result */}
                      <details className="cursor-pointer">
                        <summary className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                          View Full Result
                        </summary>
                        <pre className="text-sm bg-background p-4 rounded-lg border overflow-auto max-h-80 font-mono leading-relaxed mt-2">
                          {JSON.stringify(testResult, null, 2)}
                        </pre>
                      </details>

                      {testResult.executionTime !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                          <span className="text-lg">⚡</span>
                          <span className="font-semibold">Execution time:</span>
                          <span className="font-mono">{testResult.executionTime}ms</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
              <Button variant="outline" onClick={closeTestModal} size="lg">
                Close
              </Button>
              <Link href={`/admin/api-edit/${testingApi.id}`}>
                <Button size="lg">
                  <span className="mr-2">✏️</span>
                  Edit API
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
