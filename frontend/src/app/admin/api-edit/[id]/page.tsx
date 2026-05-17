'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlowCard } from '@/components/ui/glow-card';
import { Textarea } from '@/components/ui/textarea';
import { PrettyPrint } from '@/components/ui/pretty-print';
import { Save, ArrowLeft, Play, Plus, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function EditAPIPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [apiId, setApiId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    method: 'GET',
    path: '',
    category: 'custom',
    language: 'nodejs',
    code: '',
    enabled: true,
  });

  const [apiParams, setApiParams] = useState<Array<{
    name: string;
    type: string;
    required: boolean;
    default: string;
    description: string;
  }>>([]);

  useEffect(() => {
    params.then(p => {
      setApiId(p.id);
      fetchAPI(p.id);
    });
  }, []);

  const fetchAPI = async (id: string) => {
    try {
      const response = await fetch(`/api/endpoints/${id}`);
      const data = await response.json();
      
      if (data.success && data.endpoint) {
        const endpoint = data.endpoint;
        setFormData({
          name: endpoint.name || '',
          description: endpoint.description || '',
          method: endpoint.method || 'GET',
          path: endpoint.path || '',
          category: endpoint.category || 'custom',
          language: endpoint.language || 'nodejs',
          code: endpoint.code || '',
          enabled: endpoint.enabled !== false,
        });
        
        // Parse params
        if (endpoint.params && Array.isArray(endpoint.params)) {
          setApiParams(endpoint.params.map((p: any) => ({
            name: p.name || '',
            type: p.type || 'string',
            required: p.required || false,
            default: p.default || '',
            description: p.description || '',
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching API:', error);
      toast.error('Failed to load API');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/endpoints/${apiId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          params: apiParams,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('API updated successfully!');
        router.push('/admin/api-data');
      } else {
        toast.error(data.error || 'Failed to update API');
      }
    } catch (error) {
      console.error('Error updating API:', error);
      toast.error('Failed to update API');
    } finally {
      setSaving(false);
    }
  };

  const handleTestCode = async () => {
    if (!formData.code.trim()) {
      toast.error('Please enter code to test');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const testParams: Record<string, any> = {};
      apiParams.forEach(param => {
        if (param.default) {
          testParams[param.name] = param.default;
        } else if (param.type === 'number') {
          testParams[param.name] = 123;
        } else if (param.type === 'boolean') {
          testParams[param.name] = true;
        } else {
          testParams[param.name] = 'test_value';
        }
      });

      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: formData.code,
          language: formData.language,
          testData: testParams
        }),
      });

      const data = await response.json();
      setTestResult(data);

      if (data.success) {
        toast.success('Test completed successfully!');
      } else {
        toast.error('Test failed');
      }
    } catch (error) {
      console.error('Error testing code:', error);
      toast.error('Failed to test code');
    } finally {
      setTesting(false);
    }
  };

  const addParam = () => {
    setApiParams([...apiParams, {
      name: '',
      type: 'string',
      required: false,
      default: '',
      description: '',
    }]);
  };

  const removeParam = (index: number) => {
    setApiParams(apiParams.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: string, value: any) => {
    const updated = [...apiParams];
    updated[index] = { ...updated[index], [field]: value };
    setApiParams(updated);
  };

  const copyResult = () => {
    if (testResult) {
      navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
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
      <div className="flex items-center gap-4">
        <AnimatedButton
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          hoverScale={1.05}
        >
          <ArrowLeft className="h-4 w-4" />
        </AnimatedButton>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit API</h2>
          <p className="text-muted-foreground mt-1">Update your API endpoint</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Request Section */}
        <GlowCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Request</h3>
          
          <div className="space-y-4">
            {/* Method and Path */}
            <div className="flex gap-3">
              <div className="w-32">
                <Label>Method</Label>
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
              
              <div className="flex-1">
                <Label>Path</Label>
                <Input
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/v1/category/endpoint-name"
                  required
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My API Endpoint"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this API do?"
                rows={2}
              />
            </div>

            {/* Category and Language */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="tool">Tool</option>
                  <option value="ai">AI</option>
                  <option value="downloader">Downloader</option>
                  <option value="socialmedia">Social Media</option>
                  <option value="domain">Domain</option>
                  <option value="game">Game</option>
                  <option value="random">Random</option>
                  <option value="maps">Maps</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
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
            </div>
          </div>
        </GlowCard>

        {/* Parameters Section */}
        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Parameters</h3>
            <AnimatedButton
              type="button"
              variant="outline"
              size="sm"
              onClick={addParam}
              hoverScale={1.05}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Parameter
            </AnimatedButton>
          </div>

          {apiParams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
              No parameters yet. Click "Add Parameter" to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 rounded-lg text-xs font-semibold text-muted-foreground">
                <div className="col-span-3">Key</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Default</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-1">Required</div>
                <div className="col-span-1"></div>
              </div>

              {/* Params */}
              {apiParams.map((param, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <Input
                      value={param.name}
                      onChange={(e) => updateParam(index, 'name', e.target.value)}
                      placeholder="username"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={param.type}
                      onChange={(e) => updateParam(index, 'type', e.target.value)}
                      className="w-full h-9 px-2 bg-background border-2 border-border rounded-lg text-sm"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="file">File</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={param.default}
                      onChange={(e) => updateParam(index, 'default', e.target.value)}
                      placeholder="default value"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      value={param.description}
                      onChange={(e) => updateParam(index, 'description', e.target.value)}
                      placeholder="description"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) => updateParam(index, 'required', e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-border"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <AnimatedButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParam(index)}
                      hoverScale={1.05}
                      className="h-9 w-9 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </AnimatedButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlowCard>

        {/* Code Section */}
        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Code</h3>
            <AnimatedButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestCode}
              disabled={testing}
              hoverScale={1.05}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {testing ? 'Testing...' : 'Test Code'}
            </AnimatedButton>
          </div>

          <Textarea
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="font-mono text-sm min-h-[400px] resize-none"
            placeholder="module.exports = async (params) => {
  const axios = require('axios');
  
  // Your code here
  
  return {
    code: 200,
    status: true,
    data: { ... }
  };
};"
            required
          />

          {/* Test Result */}
          {testResult && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Test Result
                </h4>
                <div className="flex items-center gap-2">
                  <AnimatedButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyResult}
                    hoverScale={1.05}
                    className="gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </AnimatedButton>
                  <button
                    type="button"
                    onClick={() => setTestResult(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
              
              <div className={`rounded-lg border-2 overflow-hidden ${
                testResult.success 
                  ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20' 
                  : 'border-red-500/50 bg-red-50 dark:bg-red-950/20'
              }`}>
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

                <div className="p-4 max-h-[600px] overflow-auto">
                  {testResult.result?.output && (
                    <div>
                      <p className="text-xs font-semibold mb-2 text-muted-foreground">OUTPUT:</p>
                      <PrettyPrint data={testResult.result.output} />
                    </div>
                  )}

                  {testResult.result?.error && (
                    <div>
                      <p className="text-xs font-semibold mb-2 text-red-600 dark:text-red-400">ERROR:</p>
                      <pre className="text-xs bg-red-100/50 dark:bg-red-900/20 p-3 rounded-lg border border-red-300 dark:border-red-800 overflow-auto max-h-32 font-mono text-red-900 dark:text-red-200 whitespace-pre-wrap">
{testResult.result.error}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </GlowCard>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
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
            hoverScale={1.05}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Update API'}
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
}
