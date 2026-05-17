'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  generateApiPath, 
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
import { Upload, Code, Plus, Trash2, AlertCircle, Save, ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateAPIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [codeInputMode, setCodeInputMode] = useState<'text' | 'file'>('text');
  const [params, setParams] = useState<Array<{
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
    category: 'tool',
    language: 'nodejs',
    code: '',
    requiresAuth: false,
    rateLimit: 100,
    enabled: true,
  });
  
  const [pathBuilder, setPathBuilder] = useState({
    version: 'v1',
    category: 'tool',
    endpointName: '',
  });
  
  const [pathError, setPathError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFormData({ ...formData, code: content });
      };
      reader.readAsText(file);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.path || !formData.code) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      if (pathError) {
        toast.error(`Invalid path: ${pathError}`);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          params: params,  // Send as array, will be stringified in backend
        }),
      });

      const data = await response.json();
      console.log('Create API response:', data);

      if (data.success) {
        toast.success('API created successfully!');
        router.push('/admin/api-data');
      } else {
        console.error('Create API error:', data);
        toast.error(`Error: ${data.error}${data.details ? ' - ' + data.details : ''}`);
      }
    } catch (error: any) {
      console.error('Failed to create API:', error);
      toast.error(`Failed to create API: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const codeTemplate = `async (params) => {
    try {
        // Extract parameters
        const { } = params;
        
        // Your API logic here
        
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
            message: "Internal server error",
            error: error.message
        };
    }
}`;

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

  const [detectingParams, setDetectingParams] = useState(false);

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
          setParams(data.parameters);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New API</h1>
          <p className="text-muted-foreground mt-1">
            Build and deploy your custom API endpoint
          </p>
        </div>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">API Parameters</h3>
                <p className="text-sm text-muted-foreground">Define parameters that your API will accept</p>
              </div>
              <div className="flex flex-wrap gap-2">
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
                  onClick={() => setParams([...params, { name: '', type: 'string', required: false, default: '', description: '' }])}
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

            {params.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No parameters defined yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {params.map((param, index) => (
                  <div key={index} className="p-4 bg-background/50 border-2 border-border rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Parameter Name *</Label>
                        <Input
                          value={param.name}
                          onChange={(e) => {
                            const newParams = [...params];
                            newParams[index].name = e.target.value;
                            setParams(newParams);
                          }}
                          placeholder="phone, email, userId..."
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Type</Label>
                        <select
                          value={param.type}
                          onChange={(e) => {
                            const newParams = [...params];
                            newParams[index].type = e.target.value;
                            setParams(newParams);
                          }}
                          className="w-full h-9 px-3 py-1 bg-background border-2 border-border rounded-lg text-sm"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="array">Array</option>
                          <option value="object">Object</option>
                          <option value="file">File</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Default Value</Label>
                        <Input
                          value={param.default}
                          onChange={(e) => {
                            const newParams = [...params];
                            newParams[index].default = e.target.value;
                            setParams(newParams);
                          }}
                          placeholder="Optional"
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={param.description}
                          onChange={(e) => {
                            const newParams = [...params];
                            newParams[index].description = e.target.value;
                            setParams(newParams);
                          }}
                          placeholder="What is this for?"
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={param.required}
                          onChange={(e) => {
                            const newParams = [...params];
                            newParams[index].required = e.target.checked;
                            setParams(newParams);
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-xs">Required</span>
                      </label>

                      <AnimatedButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setParams(params.filter((_, i) => i !== index))}
                        className="text-destructive hover:text-destructive h-8 gap-1"
                        hoverScale={1.05}
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </AnimatedButton>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {params.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  💡 <strong>Tip:</strong> Access parameters in your code using{' '}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-xs">
                    const &#123; {params.map(p => p.name).filter(Boolean).join(', ')} &#125; = params;
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
                <p className="text-sm text-muted-foreground">Write or upload your API implementation</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AnimatedButton
                  type="button"
                  variant={codeInputMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCodeInputMode('text')}
                  hoverScale={1.05}
                  className="gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Text
                </AnimatedButton>
                <AnimatedButton
                  type="button"
                  variant={codeInputMode === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCodeInputMode('file')}
                  hoverScale={1.05}
                  className="gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  File
                </AnimatedButton>
                <AnimatedButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, code: codeTemplate })}
                  hoverScale={1.05}
                  className="gap-1.5"
                >
                  <Code className="h-3.5 w-3.5" />
                  Template
                </AnimatedButton>
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
              </div>
            </div>

            {codeInputMode === 'text' ? (
              <>
                <Textarea
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="font-mono text-sm min-h-[350px] border-2 resize-none"
                  placeholder="Paste your code here..."
                  required
                />
                
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    AI Code Converter
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Paste code in any language, select target language above, then click <strong>"AI Convert"</strong> to automatically convert it to {formData.language}.
                  </p>
                </div>
                
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
              </>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept=".js,.ts,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="codeFile"
                  />
                  <label htmlFor="codeFile" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">.js, .ts, or .txt files</p>
                  </label>
                </div>

                {formData.code && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Preview:</Label>
                      <AnimatedButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, code: '' })}
                        hoverScale={1.05}
                      >
                        Clear
                      </AnimatedButton>
                    </div>
                    <pre className="bg-muted/50 p-4 rounded-lg border-2 border-border text-xs font-mono max-h-60 overflow-auto">
                      {formData.code}
                    </pre>
                  </div>
                )}
              </div>
            )}
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
            disabled={loading}
            className="gap-2"
            hoverScale={1.05}
          >
            <Save className="h-4 w-4" />
            {loading ? 'Creating...' : 'Create API'}
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
}
