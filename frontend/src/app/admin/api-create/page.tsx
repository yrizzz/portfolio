'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlowCard } from '@/components/ui/glow-card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft, Plus, Trash2, Play, Code2 } from 'lucide-react';
import { toast } from 'sonner';

interface Param {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'file';
  required: boolean;
  defaultValue: string;
  description: string;
}

export default function CreateAPISimplePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    method: 'GET',
    path: '',
    category: 'tool',
    language: 'nodejs',
    code: `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    // Your code here
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: {}
    };
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};`,
  });

  const [params, setParams] = useState<Param[]>([
    { key: '', type: 'string', required: false, defaultValue: '', description: '' }
  ]);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const categories = ['tool', 'ai', 'downloader', 'socialmedia', 'domain', 'game', 'random', 'maps'];
  const languages = ['nodejs', 'python', 'php', 'go'];

  const addParam = () => {
    setParams([...params, { key: '', type: 'string', required: false, defaultValue: '', description: '' }]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: keyof Param, value: any) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    setParams(newParams);
  };

  const handleTest = async () => {
    if (!formData.code.trim()) {
      toast.error('Please enter code to test');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const testData: Record<string, any> = {};
      params.forEach(param => {
        if (param.key) {
          testData[param.key] = param.defaultValue || 'test_value';
        }
      });

      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: formData.code,
          language: formData.language,
          testData
        }),
      });

      const data = await response.json();
      setTestResult(data);

      if (data.success) {
        toast.success('Test passed!');
      } else {
        toast.error('Test failed');
      }
    } catch (error: any) {
      toast.error('Test failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.path || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const apiParams = params
        .filter(p => p.key.trim())
        .map(p => ({
          name: p.key,
          type: p.type,
          required: p.required,
          default: p.defaultValue,
          description: p.description
        }));

      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          params: JSON.stringify(apiParams),
          enabled: true,
          status: 'approved',
          requiresAuth: false,
          rateLimit: 100
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('API created successfully!');
        router.push('/admin/api-data');
      } else {
        toast.error(data.error || 'Failed to create API');
      }
    } catch (error: any) {
      toast.error('Failed to create API: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Create New API</h2>
          <p className="text-muted-foreground mt-1">Simple and easy like Postman</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Request Section */}
        <GlowCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Request</h3>
          
          <div className="space-y-4">
            {/* Method + Path */}
            <div className="flex gap-3">
              <div className="w-32">
                <Label>Method</Label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-border bg-background rounded-md font-semibold"
                >
                  {methods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <Label>Path *</Label>
                <Input
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/v1/category/endpoint-name"
                  required
                  className="font-mono"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Get User Profile"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this API do?"
              />
            </div>

            {/* Category + Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-border bg-background rounded-md"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label>Language</Label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-border bg-background rounded-md"
                >
                  {languages.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Params Section */}
        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Parameters</h3>
            <AnimatedButton
              type="button"
              variant="outline"
              size="sm"
              onClick={addParam}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Parameter
            </AnimatedButton>
          </div>

          <div className="space-y-3">
            {params.map((param, index) => (
              <div key={index} className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 grid grid-cols-12 gap-2">
                  <Input
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => updateParam(index, 'key', e.target.value)}
                    className="col-span-3"
                  />
                  
                  <select
                    value={param.type}
                    onChange={(e) => updateParam(index, 'type', e.target.value)}
                    className="col-span-2 px-2 py-2 border-2 border-border bg-background rounded-md text-sm"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="file">File</option>
                  </select>
                  
                  <Input
                    placeholder="Default value"
                    value={param.defaultValue}
                    onChange={(e) => updateParam(index, 'defaultValue', e.target.value)}
                    className="col-span-3"
                  />
                  
                  <Input
                    placeholder="Description"
                    value={param.description}
                    onChange={(e) => updateParam(index, 'description', e.target.value)}
                    className="col-span-3"
                  />
                  
                  <label className="col-span-1 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) => updateParam(index, 'required', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs">Required</span>
                  </label>
                </div>
                
                {params.length > 1 && (
                  <AnimatedButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeParam(index)}
                    className="text-red-600 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </AnimatedButton>
                )}
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Code Section */}
        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Code
            </h3>
            <AnimatedButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testing}
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
            required
          />

          {/* Test Result */}
          {testResult && (
            <div className={`mt-4 p-4 rounded-lg border-2 ${
              testResult.success 
                ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20' 
                : 'border-red-500/50 bg-red-50 dark:bg-red-950/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{testResult.success ? '✅' : '❌'}</span>
                <span className="font-semibold">
                  {testResult.success ? 'Test Passed' : 'Test Failed'}
                </span>
                {testResult.executionTime && (
                  <span className="text-xs text-muted-foreground">({testResult.executionTime}ms)</span>
                )}
              </div>
              
              {testResult.result?.output && (
                <pre className="text-xs bg-background/80 p-3 rounded border overflow-auto max-h-48">
                  {JSON.stringify(testResult.result.output, null, 2)}
                </pre>
              )}
              
              {testResult.result?.error && (
                <pre className="text-xs text-red-600 dark:text-red-400">
                  {testResult.result.error}
                </pre>
              )}
            </div>
          )}
        </GlowCard>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <AnimatedButton
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </AnimatedButton>
          <AnimatedButton
            type="submit"
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Creating...' : 'Create API'}
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
}
