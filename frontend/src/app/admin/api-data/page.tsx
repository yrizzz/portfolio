'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, Edit, Trash2, X, Code2, Globe, Clock, CheckCircle2, XCircle, AlertCircle, Plus, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/ui/glow-card';
import { AnimatedButton, AnimatedIconButton } from '@/components/ui/animated-button';
import { PrettyPrint } from '@/components/ui/pretty-print';
import { toast } from 'sonner';

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
  const [testFiles, setTestFiles] = useState<Record<string, File>>({});
  const [fileParamKeys, setFileParamKeys] = useState<string[]>([]);
  const [sandboxTab, setSandboxTab] = useState<'code' | 'params'>('params');
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');
  const [newParamType, setNewParamType] = useState<'text' | 'file'>('text');
  const [copied, setCopied] = useState(false);

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
        toast.success('API deleted successfully');
        fetchAPIs();
      } else {
        toast.error('Failed to delete API');
      }
    } catch (error) {
      toast.error('Error deleting API');
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
      toast.error('Error updating API');
    }
  };

  const openTestModal = async (api: any) => {
    setTestingApi(api);
    setTestModal(true);
    setTestResult(null);
    setTestFiles({});
    
    // Initialize params from API definition
    const initialParams: Record<string, any> = {};
    const detectedFileKeys: string[] = [];
    if (api.params) {
      try {
        const paramsList = typeof api.params === 'string' ? JSON.parse(api.params) : api.params;
        if (Array.isArray(paramsList)) {
          paramsList.forEach((param: any) => {
            if (param.type === 'file') {
              detectedFileKeys.push(param.name);
            } else {
              initialParams[param.name] = param.default || '';
            }
          });
        }
      } catch (e) {
        console.error('Failed to parse params:', e);
      }
    }
    setTestParams(initialParams);
    setFileParamKeys(detectedFileKeys);
  };

  const handleTestCode = async () => {
    if (!testingApi) return;
    
    setTesting(true);
    setTestResult(null);

    try {
      const hasFiles = Object.keys(testFiles).length > 0;
      let response;

      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('code', testingApi.code || testingApi.rawScript);
        formData.append('language', testingApi.language);
        formData.append('testData', JSON.stringify(testParams));
        
        // Append files
        Object.entries(testFiles).forEach(([key, file]) => {
          formData.append(key, file);
        });

        response = await fetch('/api/sandbox', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/sandbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: testingApi.code || testingApi.rawScript,
            language: testingApi.language,
            testData: testParams,
          }),
        });
      }

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
    setTestFiles({});
    setFileParamKeys([]);
    setSandboxTab('params');
    setNewParamKey('');
    setNewParamValue('');
    setNewParamType('text');
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
      <GlowCard className="p-4 sm:p-6">
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
            {apis.map((api, index) => (
              <div
                key={api.id || api._id || `api-${index}`}
                className="group relative bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl p-4 sm:p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  {/* Left Section - Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold truncate">{api.name}</h3>
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
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
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

      {/* Test Sandbox Modal - Postman Style */}
      {testModal && testingApi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeTestModal} />
          <div 
            className="relative bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-border/50 overflow-hidden z-10"
          >
            {/* Header - Compact */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Play className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">{testingApi.name}</h2>
                  <span className="text-[11px] text-muted-foreground">{testingApi.language}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeTestModal}
                className="h-7 w-7 rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* URL Bar - Method + Path + Run */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50 bg-muted/10">
              <Badge 
                variant="outline" 
                className={`font-mono text-xs font-bold shrink-0 ${
                  testingApi.method === 'GET' ? 'border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/5' :
                  testingApi.method === 'POST' ? 'border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-500/5' :
                  testingApi.method === 'PUT' ? 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400 bg-yellow-500/5' :
                  'border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/5'
                }`}
              >
                {testingApi.method}
              </Badge>
              <div className="flex-1 px-3 py-1.5 bg-muted/30 rounded-lg border border-border/50">
                <code className="text-xs font-mono text-muted-foreground">/api/execute{testingApi.path}</code>
              </div>
              <Button
                onClick={handleTestCode}
                disabled={testing}
                size="sm"
                className="text-xs gap-1.5 px-4 shrink-0"
              >
                {testing ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Running
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Send
                  </>
                )}
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-auto min-h-0">
              {/* Parameters Section */}
              <div className="px-5 py-4 border-b border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parameters</h3>
                  <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {Object.keys(testParams).length + Object.keys(testFiles).length} params
                  </span>
                </div>
                
                {(Object.keys(testParams).length > 0 || Object.keys(testFiles).length > 0 || fileParamKeys.length > 0) ? (
                  <div className="space-y-2">
                    {/* Text params */}
                    {Object.entries(testParams).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-28 shrink-0">
                          <span className="text-xs font-mono font-medium text-foreground/80 bg-muted/40 px-2 py-1.5 rounded block truncate">
                            {key}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={(value as string) ?? ''}
                          onChange={(e) => setTestParams({ ...testParams, [key]: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-border/50 rounded-lg text-xs bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono"
                          placeholder={`Enter ${key}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newParams = { ...testParams };
                            delete newParams[key];
                            setTestParams(newParams);
                          }}
                          className="h-7 w-7 p-0 inline-flex items-center justify-center text-muted-foreground hover:text-destructive shrink-0 rounded-md hover:bg-muted transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* File params from API definition */}
                    {fileParamKeys.map((key) => (
                      <div key={`filedef-${key}`} className="flex items-center gap-2">
                        <div className="w-28 shrink-0">
                          <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1.5 rounded block truncate">
                            {key} <span className="text-[9px] opacity-60">(file)</span>
                          </span>
                        </div>
                        {testFiles[key] ? (
                          <div className="flex-1 px-3 py-1.5 border border-border/50 rounded-lg text-xs bg-background font-mono text-muted-foreground truncate">
                            {testFiles[key].name} ({(testFiles[key].size / 1024).toFixed(1)}KB)
                          </div>
                        ) : (
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setTestFiles({ ...testFiles, [key]: file });
                              }
                            }}
                            className="flex-1 px-3 py-1 border border-border/50 rounded-lg text-xs bg-background file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-primary/10 file:text-primary"
                          />
                        )}
                        {testFiles[key] && (
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = { ...testFiles };
                              delete newFiles[key];
                              setTestFiles(newFiles);
                            }}
                            className="h-7 w-7 p-0 inline-flex items-center justify-center text-muted-foreground hover:text-destructive shrink-0 rounded-md hover:bg-muted transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Manually added file params */}
                    {Object.entries(testFiles).filter(([key]) => !fileParamKeys.includes(key)).map(([key, file]) => (
                      <div key={`file-${key}`} className="flex items-center gap-2">
                        <div className="w-28 shrink-0">
                          <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1.5 rounded block truncate">
                            {key}
                          </span>
                        </div>
                        <div className="flex-1 px-3 py-1.5 border border-border/50 rounded-lg text-xs bg-background font-mono text-muted-foreground truncate">
                          {file.name} ({(file.size / 1024).toFixed(1)}KB)
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = { ...testFiles };
                            delete newFiles[key];
                            setTestFiles(newFiles);
                          }}
                          className="h-7 w-7 p-0 inline-flex items-center justify-center text-muted-foreground hover:text-destructive shrink-0 rounded-md hover:bg-muted transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-4 bg-muted/10 rounded-lg border border-dashed border-border/50">
                    No parameters defined
                  </div>
                )}
                
                {/* Add Custom Parameter */}
                <div className="flex items-center gap-2 mt-3">
                  <select
                    value={newParamType}
                    onChange={(e) => setNewParamType(e.target.value as 'text' | 'file')}
                    className="w-16 shrink-0 px-1.5 py-1.5 border border-border/50 rounded-lg text-[10px] bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  >
                    <option value="text">Text</option>
                    <option value="file">File</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Key"
                    value={newParamKey}
                    onChange={(e) => setNewParamKey(e.target.value)}
                    className="w-24 shrink-0 px-3 py-1.5 border border-border/50 rounded-lg text-xs bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono"
                  />
                  {newParamType === 'text' ? (
                    <input
                      type="text"
                      placeholder="Value"
                      value={newParamValue}
                      onChange={(e) => setNewParamValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newParamKey.trim()) {
                          setTestParams({ ...testParams, [newParamKey.trim()]: newParamValue });
                          setNewParamKey('');
                          setNewParamValue('');
                        }
                      }}
                      className="flex-1 px-3 py-1.5 border border-border/50 rounded-lg text-xs bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono"
                    />
                  ) : (
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && newParamKey.trim()) {
                          setTestFiles({ ...testFiles, [newParamKey.trim()]: file });
                          setNewParamKey('');
                          e.target.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-1 border border-border/50 rounded-lg text-xs bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-primary/10 file:text-primary"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (newParamKey.trim() && newParamType === 'text') {
                        setTestParams({ ...testParams, [newParamKey.trim()]: newParamValue });
                        setNewParamKey('');
                        setNewParamValue('');
                      }
                    }}
                    className="h-7 px-2.5 text-xs shrink-0 gap-1 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Response Section */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response</h3>
                  {testResult && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {testResult.result?.success 
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          : <XCircle className="h-3.5 w-3.5 text-red-500" />
                        }
                        <span className={`text-[11px] font-medium ${
                          testResult.result?.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {testResult.result?.success ? '200 OK' : 'Error'}
                        </span>
                      </div>
                      {testResult.executionTime !== undefined && (
                        <span className="text-[11px] text-muted-foreground font-mono">{testResult.executionTime}ms</span>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
                          setCopied(true);
                          toast.success('Copied to clipboard');
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  )}
                </div>

                {testResult ? (
                  <div className="space-y-2">
                    {/* Success Output */}
                    {testResult.result?.success && testResult.result?.output && (
                      <div className="bg-slate-950 p-4 rounded-xl overflow-auto max-h-[400px] border border-slate-800/50">
                        <PrettyPrint data={testResult.result.output} />
                      </div>
                    )}

                    {/* Error */}
                    {testResult.result?.error && !testResult.result?.success && (
                      <pre className="text-xs bg-red-950/20 text-red-400 p-4 rounded-xl overflow-auto max-h-[250px] font-mono whitespace-pre-wrap break-all border border-red-500/20 leading-relaxed">
{testResult.result.error}</pre>
                    )}

                    {/* Hint */}
                    {testResult.result?.hint && (
                      <div className="flex items-start gap-2 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{testResult.result.hint}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-8 bg-muted/10 rounded-xl border border-dashed border-border/50">
                    Click <span className="font-semibold text-primary">Send</span> to execute the API
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Minimal */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/50 bg-muted/20">
              <Link href={`/admin/api-edit/${testingApi.id}`}>
                <Button variant="ghost" size="sm" className="text-[11px] gap-1.5 h-7">
                  <Edit className="h-3 w-3" />
                  Edit Source
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setSandboxTab(sandboxTab === 'code' ? 'params' : 'code')} className="text-[11px] gap-1.5 h-7">
                <Code2 className="h-3 w-3" />
                View Code
              </Button>
            </div>

            {/* Code Drawer - Slides up when View Code is clicked */}
            {sandboxTab === 'code' && (
              <div className="border-t border-border/50 bg-slate-950 max-h-[250px] overflow-auto">
                <div className="flex items-center justify-between px-5 py-2 border-b border-slate-800/50">
                  <span className="text-[11px] font-medium text-slate-400">Source Code</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSandboxTab('params')}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <pre className="text-[12px] text-slate-300 p-4 font-mono leading-relaxed whitespace-pre-wrap">
                  {testingApi.rawScript || testingApi.code || 'No code available'}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
