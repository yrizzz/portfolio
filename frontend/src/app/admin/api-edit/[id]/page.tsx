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
import { Save, ArrowLeft, Play, AlertCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function EditAPIPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [apiId, setApiId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [converting, setConverting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
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
    if (!apiId) return;
    
    try {
      const response = await fetch(`/api/endpoints/${apiId}`);
      const data = await response.json();
      
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
        
        const parsed = parseApiPath(api.path);
        if (parsed) {
          setPathBuilder({
            version: parsed.version,
            category: parsed.category,
            endpointName: parsed.name,
          });
        }
      } else {
        alert('Failed to load API: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to fetch API:', error);
      alert('Failed to load API');
    } finally {
      setLoading(false);
    }
  };

  const handleTestCode = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          language: formData.language,
          testData: { message: 'Test execution' }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiId) {
      alert('API ID not loaded');
      return;
    }
    
    setSaving(true);

    try {
      if (pathError) {
        alert(`Invalid path: ${pathError}`);
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/endpoints/${apiId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('API updated successfully!');
        router.push('/admin/api-data');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to update API');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertCode = async () => {
    if (!formData.code) {
      alert('Please enter code to convert');
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
        alert(`Code converted to ${formData.language} successfully!`);
      } else {
        alert(`Conversion failed: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to convert code');
    } finally {
      setConverting(false);
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
              <div className={`p-4 rounded-lg border-2 ${
                testResult.success 
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{testResult.success ? '✅' : '❌'}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-2">
                      {testResult.success ? 'Test Passed' : 'Test Failed'}
                    </h4>
                    <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-40 font-mono">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                    {testResult.executionTime && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ⚡ Execution time: {testResult.executionTime}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-muted/50 rounded-lg border-2 border-border">
              <p className="text-xs font-semibold mb-2">📌 Correct Format:</p>
              <p className="text-xs text-muted-foreground mb-2">
                Paste <strong>ONLY the function code</strong>, not the full object:
              </p>
              <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`async (params) => {
    const { phone } = params;
    
    // Your logic here
    
    return {
        code: 200,
        status: true,
        data: result
    };
}`}</pre>
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
