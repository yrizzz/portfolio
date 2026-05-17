'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/ui/animated-button';
import { GlowCard } from '@/components/ui/glow-card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GlobalHeader {
  id: string;
  name: string;
  description?: string;
  service: string;
  headers: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function GlobalHeadersPage() {
  const router = useRouter();
  const [headers, setHeaders] = useState<GlobalHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterService, setFilterService] = useState<string>('all');

  const services = ['all', 'instagram', 'tiktok', 'twitter', 'facebook', 'youtube', 'custom'];

  useEffect(() => {
    fetchHeaders();
  }, [filterService]);

  const fetchHeaders = async () => {
    try {
      setLoading(true);
      const url = filterService === 'all' 
        ? '/api/global-headers'
        : `/api/global-headers?service=${filterService}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setHeaders(data.headers);
      } else {
        toast.error(data.error || 'Failed to fetch headers');
      }
    } catch (error) {
      toast.error('Failed to fetch headers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this header?')) {
      return;
    }

    try {
      setDeleting(id);
      const response = await fetch(`/api/global-headers/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Header deleted successfully');
        fetchHeaders();
      } else {
        toast.error(data.error || 'Failed to delete header');
      }
    } catch (error) {
      toast.error('Failed to delete header');
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/global-headers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Header ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchHeaders();
      } else {
        toast.error(data.error || 'Failed to update header');
      }
    } catch (error) {
      toast.error('Failed to update header');
    }
  };

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
      tiktok: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      twitter: 'bg-gradient-to-r from-blue-400 to-blue-600',
      facebook: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      youtube: 'bg-gradient-to-r from-red-500 to-red-600',
      custom: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };
    return colors[service] || colors.custom;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Global Headers</h2>
          <p className="text-muted-foreground mt-1">Manage global headers for API requests</p>
        </div>
        <AnimatedButton
          onClick={() => router.push('/admin/global-headers/create')}
          className="gap-2"
          hoverScale={1.05}
        >
          <Plus className="h-4 w-4" />
          Add Header
        </AnimatedButton>
      </div>

      {/* Filter */}
      <GlowCard className="p-4">
        <div className="flex gap-2 flex-wrap">
          {services.map((service) => (
            <button
              key={service}
              onClick={() => setFilterService(service)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterService === service
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {service.charAt(0).toUpperCase() + service.slice(1)}
            </button>
          ))}
        </div>
      </GlowCard>

      {/* Loading */}
      {loading && (
        <GlowCard className="p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading headers...</p>
          </div>
        </GlowCard>
      )}

      {/* Empty State */}
      {!loading && headers.length === 0 && (
        <GlowCard className="p-12 text-center">
          <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Headers Found</h3>
          <p className="text-muted-foreground mb-6">
            {filterService === 'all'
              ? 'Create your first global header to get started'
              : `No headers found for ${filterService}`}
          </p>
          <AnimatedButton
            onClick={() => router.push('/admin/global-headers/create')}
            className="gap-2"
            hoverScale={1.05}
          >
            <Plus className="h-4 w-4" />
            Add Header
          </AnimatedButton>
        </GlowCard>
      )}

      {/* Headers List */}
      {!loading && headers.length > 0 && (
        <GlowCard className="p-4 sm:p-6">
          <div className="space-y-4">
            {headers.map((header) => (
              <div
                key={header.id}
                className="group relative bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl p-4 sm:p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold truncate">{header.name}</h3>
                      <Badge className={`${getServiceColor(header.service)} text-white border-0 shrink-0`}>
                        {header.service}
                      </Badge>
                      {header.isActive ? (
                        <Badge variant="outline" className="gap-1 border-green-500 text-green-600 shrink-0">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-gray-500 text-gray-600 shrink-0">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    
                    {header.description && (
                      <p className="text-sm text-muted-foreground mb-3 break-words">
                        {header.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>{Object.keys(header.headers).length} headers</span>
                      <span>•</span>
                      <span>Updated {new Date(header.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Headers Preview */}
                    <details className="mt-4">
                      <summary className="text-sm font-medium cursor-pointer hover:text-primary transition-colors">
                        View Headers
                      </summary>
                      <div className="mt-2 p-3 bg-muted rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <pre className="text-xs max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
                            {JSON.stringify(header.headers, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </details>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(header.id, header.isActive)}
                      hoverScale={1.05}
                    >
                      {header.isActive ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/global-headers/edit/${header.id}`)}
                      hoverScale={1.05}
                    >
                      <Edit className="h-4 w-4" />
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(header.id)}
                      disabled={deleting === header.id}
                      hoverScale={1.05}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
