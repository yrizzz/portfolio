'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlowCard } from '@/components/ui/glow-card';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateGlobalHeaderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service: 'instagram',
    isActive: true,
  });
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ]);

  const services = ['instagram', 'tiktok', 'twitter', 'facebook', 'youtube', 'custom'];

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    // Convert headers array to object
    const headersObject: Record<string, string> = {};
    headers.forEach((header) => {
      if (header.key.trim() && header.value.trim()) {
        headersObject[header.key.trim()] = header.value.trim();
      }
    });

    if (Object.keys(headersObject).length === 0) {
      toast.error('At least one header is required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/global-headers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          headers: headersObject,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Global header created successfully!');
        router.push('/admin/global-headers');
      } else {
        toast.error(data.error || 'Failed to create header');
      }
    } catch (error) {
      toast.error('Failed to create header');
    } finally {
      setSaving(false);
    }
  };

  const loadPreset = (service: string) => {
    const presets: Record<string, Array<{ key: string; value: string }>> = {
      instagram: [
        { key: 'Cookie', value: '' },
        { key: 'X-Asbd-Id', value: '359341' },
        { key: 'X-Fb-Friendly-Name', value: 'PolarisStoriesV3TrayContainerQuery' },
        { key: 'X-Csrftoken', value: '' },
        { key: 'X-Ig-App-Id', value: '1217981644879628' },
        { key: 'Content-Type', value: 'application/x-www-form-urlencoded' },
        { key: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      ],
      tiktok: [
        { key: 'Cookie', value: '' },
        { key: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      ],
      twitter: [
        { key: 'Authorization', value: 'Bearer ' },
        { key: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      ],
    };

    if (presets[service]) {
      setHeaders(presets[service]);
      toast.success(`Loaded ${service} preset`);
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
          <h2 className="text-3xl font-bold tracking-tight">Create Global Header</h2>
          <p className="text-muted-foreground mt-1">Add new global headers for API requests</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlowCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Instagram Default Headers"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="service">Service *</Label>
              <select
                id="service"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                required
              >
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Select the service these headers are for
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (headers will be used immediately)
              </Label>
            </div>
          </div>
        </GlowCard>

        {/* Headers */}
        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Headers</h3>
            <div className="flex gap-2">
              {['instagram', 'tiktok', 'twitter'].includes(formData.service) && (
                <AnimatedButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset(formData.service)}
                  hoverScale={1.05}
                >
                  Load Preset
                </AnimatedButton>
              )}
              <AnimatedButton
                type="button"
                variant="outline"
                size="sm"
                onClick={addHeader}
                className="gap-2"
                hoverScale={1.05}
              >
                <Plus className="h-4 w-4" />
                Add Header
              </AnimatedButton>
            </div>
          </div>

          <div className="space-y-3">
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Input
                  placeholder="Header Key (e.g., Cookie)"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  className="flex-1 min-w-[200px]"
                />
                <Input
                  placeholder="Header Value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  className="flex-[2] min-w-[300px] font-mono text-xs"
                />
                {headers.length > 1 && (
                  <AnimatedButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeHeader(index)}
                    hoverScale={1.05}
                    className="text-red-600 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </AnimatedButton>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            💡 Tip: Headers will be automatically injected into API requests as{' '}
            <code className="bg-muted px-1 rounded">params._globalHeaders.{formData.service}</code>
          </p>
        </GlowCard>

        {/* Submit */}
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
            {saving ? 'Creating...' : 'Create Header'}
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
}
