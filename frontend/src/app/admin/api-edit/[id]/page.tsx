'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  generateApiPath, 
  parseApiPath,
  API_VERSIONS, 
  API_CATEGORIES,
  validateApiPath,
} from '@/lib/api-path-generator';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlowCard } from '@/components/ui/glow-card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft, Play, AlertCircle, CheckCircle2, XCircle, Sparkles, Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function EditAPIPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [apiId, setApiId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [converting, setConverting] = useState(false);
  const [detectingParams, setDetectingParams] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [apiParams, setApiParams] = useState<Array<{
    name: string;
    type: string;
    required: boolean;
    default: string;
    description: string;
  }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    method: 'GET',
    path: '',
    category: 'custom',
    language: 'nodejs',
    code: '',
    requiresAuth: false,
    rateLimit: 100,
    enabled: true,
    status: 'approved',
  });
  
  const [pathBuilder, setPathBuilder] = useState({
    version: 'v1',
    category: 'tool',
    endpointName: '',
  });
  
  const [pathError, setPathError] = useState('');

  // Resolve params Promise
  useEffect(() => {
    params.then(({ id }) => {
      setApiId(id);
    });
  }, [params]);

  useEffect(() => {
    if (pathBuilder.endpointName) {
      const generatedPath = generateApiPath({
        version: pathBuilder.version,
        category: pathBuilder.category,
        name: pathBuilder.endpointName,
      });
      setFormData(prev => ({ ...prev, path: generatedPath, category: pathBuilder.category }));
      
      const validation = validateApiPath(generatedPath);
      setPathError(validation.valid ? '' : validation.error || '');
    }
  }, [pathBuilder]);

  useEffect(() => {
    if (apiId) {
      fetchAPI();
    }
  }, [apiId]);

  const fetchAPI = async () => {
    if (!apiId) {
      console.log('[Edit Page] fetchAPI called but apiId is empty:', apiId);
      return;
    }
    
    console.log('[Edit Page] Fetching API with ID:', apiId);
    
    try {
      const response = await fetch(`/api/endpoints/${apiId}`);
      const data = await response.json();
      
      console.log('=== API Edit Debug ===');
      console.log('Response data:', data);
      console.log('Endpoint:', data.endpoint);
      console.log('Code:', data.endpoint?.code);
      console.log('RawScript:', data.endpoint?.rawScript);
      console.log('Params:', data.endpoint?.params);
      
      if (data.success) {
        const api = data.endpoint;
        setFormData({
          name: api.name,
          description: api.description || '',
          method: api.method,
          path: api.path,
          category: api.category || 'custom',
          language: api.language,
          code: api.rawScript || api.code || '',
          requiresAuth: api.requiresAuth,
          rateLimit: api.rateLimit,
          enabled: api.enabled,
          status: api.status,
        });
        
        console.log('FormData set with code:', api.rawScript || api.code || '');
        
        // Load params if exists
        if (api.params) {
          try {
            const parsedParams = typeof api.params === 'string' ? JSON.parse(api.params) : api.params;
            console.log('Parsed params:', parsedParams);
            setApiParams(Array.isArray(parsedParams) ? parsedParams : []);
          } catch (e) {
            console.error('Failed to parse params:', e);
            setApiParams([]);
          }
        }
        
        const parsed = parseApiPath(api.path);
        if (parsed) {
          setPathBuilder({
            version: parsed.version,
            category: parsed.category,
            endpointName: parsed.name,
          });
        }
      } else {
        toast.error('Failed to load API: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to fetch API:', error);
      toast.error('Failed to load API');
    } finally {
      setLoading(false);
    }
  };

  const handleTestCode = async () => {
    if (!formData.code.trim()) {
      toast.error('Please enter code to test');
      return;
    }

    // Check if code has proper export
    const hasExport = 
      /module\.exports\s*=/.test(formData.code) ||
      /exports\.default\s*=/.test(formData.code) ||
      /export\s+default/.test(formData.code);
    
    if (!hasExport) {
      toast.error('Code must export a function. Use: module.exports = async (params) => {...} or export default async (params) => {...}');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Build test params from apiParams
      const testParams: Record<string, any> = {};
      apiParams.forEach(param => {
        if (param.default) {
          testParams[param.name] = param.default;
        } else if (param.type === 'string') {
          testParams[param.name] = 'test_value';
        } else if (param.type === 'number') {
          testParams[param.name] = 123;
        } else if (param.type === 'boolean') {
          testParams[param.name] = true;
        } else {
          testParams[param.name] = 'test';
        }
      });

      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          language: formData.language,
          testData: testParams
        }),
      });

      const data = await response.json();
      
      // Handle different response formats
      if (!response.ok) {
        setTestResult({
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          result: data
        });
      } else {
        setTestResult(data);
      }
      
      // Show toast notification
      if (data.success && data.result?.success) {
        toast.success('Test passed successfully!');
      } else if (data.error) {
        toast.error(`Test failed: ${data.error}`);
      } else if (data.result?.error) {
        toast.error(`Execution error: ${data.result.error}`);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to test code';
      setTestResult({
        success: false,
        error: errorMsg,
        result: { success: false, error: errorMsg }
      });
      toast.error(errorMsg);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiId) {
      toast.error('API ID not loaded');
      return;
    }
    
    setSaving(true);

    try {
      if (pathError) {
        toast.error(`Invalid path: ${pathError}`);
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/endpoints/${apiId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          params: apiParams,  // Include params in update
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('API updated successfully!');
        router.push('/admin/api-data');
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      toast.error('Failed to update API');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertCode = async () => {
    if (!formData.code) {
      toast.error('Please enter code to convert');
      return;
    }

    setConverting(true);
    try {
      const response = await fetch('/api/gemini/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          fromLanguage: 'auto-detect',
          toLanguage: formData.language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, code: data.convertedCode });
        toast.success(`Code converted to ${formData.language} successfully!`);
      } else {
        toast.error(`Conversion failed: ${data.error}`);
      }
    } catch (error) {
      toast.error('Failed to convert code');
    } finally {
      setConverting(false);
    }
  };

  const handleDetectParameters = async () => {
    if (!formData.code) {
      toast.error('Please enter code first');
      return;
    }

    setDetectingParams(true);
    try {
      const response = await fetch('/api/gemini/detect-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.parameters.length > 0) {
          setApiParams(data.parameters);
          toast.success(`${data.message}! Parameters have been auto-filled.`);
        } else {
          toast.info('No parameters detected in the code. You can add them manually.');
        }
      } else {
        let errorMsg = `Detection failed: ${data.error}`;
        if (data.details) {
          errorMsg += ` - ${JSON.stringify(data.details)}`;
        }
        console.error('Parameter detection error:', data);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Failed to detect parameters:', error);
      toast.error(`Failed to detect parameters: ${error.message || 'Unknown error'}`);
    } finally {
      setDetectingParams(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit API</h1>
          <p className="text-muted-foreground mt-1">
            Update your API endpoint configuration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={
              formData.status === 'approved' ? 'default' :
              formData.status === 'pending' ? 'secondary' :
              'destructive'
            }
          >
            {formData.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {formData.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
            {formData.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
            {formData.status}
          </Badge>
          <AnimatedButton 
            variant="outline" 
            onClick={() => router.back()}
            className="gap-2"
            hoverScale={1.05}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </AnimatedButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Path Builder Section */}
        <GlowCard className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">API Path Builder</h3>
              <p className="text-sm text-muted-foreground">Generate a standardized API path automatically</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Version</Label>
                <select
                  value={pathBuilder.version}
                  onChange={(e) => setPathBuilder({ ...pathBuilder, version: e.target.value })}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  {API_VERSIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={pathBuilder.category}
                  onChange={(e) => setPathBuilder({ ...pathBuilder, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  {API_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Endpoint Name *</Label>
                <Input
                  value={pathBuilder.endpointName}
                  onChange={(e) => setPathBuilder({ ...pathBuilder, endpointName: e.target.value })}
                  placeholder="e.g., phoneChecker"
                  className="border-2"
                />
              </div>
            </div>

            {formData.path && (
              <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
                <Label className="text-xs text-muted-foreground">Generated Path:</Label>
                <code className="block mt-1 text-sm font-mono text-primary">{formData.path}</code>
                {pathError && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {pathError}
                  </p>
                )}
              </div>
            )}
          </div>
        </GlowCard>

        {/* Basic Details Section */}
        <GlowCard className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">API Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>API Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Phone Checker API"
                  required
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label>HTTP Method</Label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="nodejs">Node.js</option>
                  <option value="php">PHP</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Rate Limit (per minute)</Label>
                <Input
                  type="number"
                  value={formData.rateLimit}
                  onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                  min="1"
                  className="border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your API does..."
                rows={3}
                className="border-2 resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresAuth}
                  onChange={(e) => setFormData({ ...formData, requiresAuth: e.target.checked })}
                  className="w-4 h-4 rounded border-2 border-border"
                />
                <span className="text-sm">Requires Authentication</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-2 border-border"
                />
                <span className="text-sm">Enable API</span>
              </label>
            </div>
          </div>
        </GlowCard>

        {/* Parameters Section */}
        <GlowCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">API Parameters</h3>
                <p className="text-sm text-muted-foreground">Define parameters that your API will accept</p>
              </div>
              <div className="flex gap-2">
                <AnimatedButton
                  type="button"
                  onClick={handleDetectParameters}
                  disabled={!formData.code || detectingParams}
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                  hoverScale={1.05}
                >
                  <Sparkles className="h-4 w-4" />
                  {detectingParams ? 'Detecting...' : 'Auto-Detect'}
                </AnimatedButton>
                <AnimatedButton
                  type="button"
                  onClick={() => setApiParams([...apiParams, { name: '', type: 'string', required: false, default: '', description: '' }])}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  hoverScale={1.05}
                >
                  <Plus className="h-4 w-4" />
                  Add Manually
                </AnimatedButton>
              </div>
            </div>

            {apiParams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No parameters defined yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiParams.map((param, index) => (
                  <div key={index} className="p-4 border-2 border-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Parameter {index + 1}</span>
                      <AnimatedButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setApiParams(apiParams.filter((_, i) => i !== index))}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        hoverScale={1.1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={param.name}
                          onChange={(e) => {
                            const newParams = [...apiParams];
                            newParams[index].name = e.target.value;
                            setApiParams(newParams);
                          }}
                          placeholder="e.g., userId"
                          className="border-2"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Type</Label>
                         <select
                          value={param.type}
                          onChange={(e) => {
                            const newParams = [...apiParams];
                            newParams[index].type = e.target.value;
                            setApiParams(newParams);
                          }}
                          className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="array">Array</option>
                          <option value="object">Object</option>
                          <option value="file">File</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Default Value</Label>
                        <Input
                          value={param.default}
                          onChange={(e) => {
                            const newParams = [...apiParams];
                            newParams[index].default = e.target.value;
                            setApiParams(newParams);
                          }}
                          placeholder="Optional default value"
                          className="border-2"
                        />
                      </div>
                      
                      <div className="flex items-center pt-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => {
                              const newParams = [...apiParams];
                              newParams[index].required = e.target.checked;
                              setApiParams(newParams);
                            }}
                            className="w-4 h-4 rounded border-2 border-border"
                          />
                          <span className="text-sm">Required</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={param.description}
                        onChange={(e) => {
                          const newParams = [...apiParams];
                          newParams[index].description = e.target.value;
                          setApiParams(newParams);
                        }}
                        placeholder="Describe what this parameter does"
                        className="border-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {apiParams.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  💡 <strong>Tip:</strong> Access parameters in your code using{' '}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-xs">
                    const &#123; {apiParams.map(p => p.name).filter(Boolean).join(', ')} &#125; = params;
                  </code>
                </p>
              </div>
            )}
          </div>
        </GlowCard>

        {/* Code Section */}
        <GlowCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">API Code *</h3>
                <p className="text-sm text-muted-foreground">Update your API implementation</p>
              </div>
              <div className="flex items-center gap-2">
                <AnimatedButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleConvertCode}
                  disabled={converting || !formData.code}
                  hoverScale={1.05}
                  className="gap-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {converting ? 'Converting...' : 'AI Convert'}
                </AnimatedButton>
                <AnimatedButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestCode}
                  disabled={testing || !formData.code}
                  className="gap-2"
                  hoverScale={1.05}
                >
                  <Play className="h-3.5 w-3.5" />
                  {testing ? 'Testing...' : 'Test Code'}
                </AnimatedButton>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                AI Code Converter
              </p>
              <p className="text-xs text-muted-foreground">
                Change the language above, then click <strong>"AI Convert"</strong> to automatically convert your code to {formData.language}.
              </p>
            </div>

            <Textarea
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="font-mono text-sm min-h-[350px] border-2 resize-none"
              placeholder="Paste your code here..."
              required
            />

            {/* Test Result */}
            {testResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Test Result
                  </h4>
                  <button
                    onClick={() => setTestResult(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
                
                <div className={`rounded-lg border-2 overflow-hidden ${
                  testResult.success 
                    ? 'border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20' 
                    : 'border-red-500/50 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20'
                }`}>
                  {/* Header */}
                  <div className={`px-4 py-3 border-b-2 flex items-center justify-between ${
                    testResult.success 
                      ? 'bg-green-100/50 dark:bg-green-900/20 border-green-500/30' 
                      : 'bg-red-100/50 dark:bg-red-900/20 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{testResult.success ? '✅' : '❌'}</span>
                      <div>
                        <p className="font-semibold text-sm">
                          {testResult.success ? 'Test Passed' : 'Test Failed'}
                        </p>
                        {testResult.executionTime && (
                          <p className="text-xs text-muted-foreground">
                            ⚡ {testResult.executionTime}ms
                          </p>
                        )}
                      </div>
                    </div>
                    {testResult.language && (
                      <span className="text-xs px-2 py-1 rounded bg-background/50 font-mono">
                        {testResult.language}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Output */}
                    {testResult.result?.output && (
                      <div>
                        <p className="text-xs font-semibold mb-2 text-muted-foreground">OUTPUT:</p>
                        <pre className="text-xs bg-background/80 p-3 rounded-lg border overflow-auto max-h-48 font-mono">
{JSON.stringify(testResult.result.output, null, 2)}</pre>
                      </div>
                    )}

                    {/* Error */}
                    {(testResult.error || testResult.result?.error) && (
                      <div>
                        <p className="text-xs font-semibold mb-2 text-red-600 dark:text-red-400">ERROR:</p>
                        <pre className="text-xs bg-red-100/50 dark:bg-red-900/20 p-3 rounded-lg border border-red-300 dark:border-red-800 overflow-auto max-h-32 font-mono text-red-900 dark:text-red-200 whitespace-pre-wrap">
{testResult.error || testResult.result?.error}</pre>
                        
                        {/* Common error hints */}
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-xs font-semibold mb-2 text-yellow-900 dark:text-yellow-100">💡 Common Issues:</p>
                          <ul className="text-xs text-yellow-900 dark:text-yellow-100 space-y-1.5 list-disc list-inside">
                            <li><strong>No executable function found:</strong> Your code must export a function using one of these:
                              <ul className="ml-4 mt-1 space-y-0.5">
                                <li>• <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">module.exports = async (params) =&gt; &#123;...&#125;</code></li>
                                <li>• <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">export default async (params) =&gt; &#123;...&#125;</code></li>
                              </ul>
                            </li>
                            <li><strong>Missing parameters:</strong> Define all required parameters in the Parameters section with default values for testing</li>
                            <li><strong>Blocked modules:</strong> Only use allowed modules (axios, cheerio, qrcode, etc.). Avoid: child_process, vm, fs-extra</li>
                            <li><strong>Return structure:</strong> Always return an object like: <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">&#123; code: 200, status: true, data: ... &#125;</code></li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Note */}
                    {testResult.result?.note && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-900 dark:text-blue-100">
                          ℹ️ {testResult.result.note}
                        </p>
                      </div>
                    )}

                    {/* Full Result (Collapsible) */}
                    <details className="group">
                      <summary className="text-xs font-semibold cursor-pointer hover:text-primary transition-colors list-none flex items-center gap-2">
                        <span className="group-open:rotate-90 transition-transform">▶</span>
                        View Full Response
                      </summary>
                      <pre className="text-xs bg-muted/50 p-3 rounded-lg border mt-2 overflow-auto max-h-64 font-mono">
{JSON.stringify(testResult, null, 2)}</pre>
                    </details>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-muted/50 rounded-lg border-2 border-border">
              <p className="text-xs font-semibold mb-2">📌 Correct Format:</p>
              <p className="text-xs text-muted-foreground mb-2">
                Paste <strong>ONLY the function code</strong>. Both ES6 and CommonJS syntax are supported:
              </p>
              
              <div className="space-y-3">
                {/* CommonJS Example */}
                <div>
                  <p className="text-xs font-semibold mb-1 text-muted-foreground">✅ CommonJS (Recommended):</p>
                  <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`module.exports = async (params) => {
    const axios = require("axios");
    const { phone } = params;
    
    const result = await axios.get(\`https://api.example.com/check?phone=\${phone}\`);
    
    return {
        code: 200,
        status: true,
        data: result.data
    };
};`}</pre>
                </div>

                {/* ES6 Example */}
                <div>
                  <p className="text-xs font-semibold mb-1 text-muted-foreground">✅ ES6 (Auto-converted):</p>
                  <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`import axios from "axios";

export default async (params) => {
    const { phone } = params;
    
    const result = await axios.get(\`https://api.example.com/check?phone=\${phone}\`);
    
    return {
        code: 200,
        status: true,
        data: result.data
    };
};`}</pre>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs font-semibold mb-1 text-muted-foreground">✅ Valid export formats:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                  <li><code className="bg-muted px-1 rounded">module.exports = async (params) =&gt; &#123;...&#125;</code></li>
                  <li><code className="bg-muted px-1 rounded">exports.default = async (params) =&gt; &#123;...&#125;</code></li>
                  <li><code className="bg-muted px-1 rounded">export default async (params) =&gt; &#123;...&#125;</code> (ES6)</li>
                </ul>
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <AnimatedButton
            type="button"
            variant="outline"
            onClick={() => router.back()}
            hoverScale={1.05}
          >
            Cancel
          </AnimatedButton>
          <AnimatedButton
            type="submit"
            disabled={saving}
            className="gap-2"
            hoverScale={1.05}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
}
