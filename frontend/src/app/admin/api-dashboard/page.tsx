'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlowCard } from '@/components/ui/glow-card';
import { AnimatedButton } from '@/components/ui/animated-button';

export default function APIManagementDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, endpointsRes] = await Promise.all([
        fetch('/api/analytics?period=24h'),
        fetch('/api/endpoints'),
      ]);

      const analytics = await analyticsRes.json();
      const endpoints = await endpointsRes.json();

      setStats({
        analytics: analytics.success ? analytics : null,
        endpoints: endpoints.success ? endpoints.endpoints : [],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const summary = stats?.analytics?.summary || {};
  const endpoints = stats?.endpoints || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your API management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold mt-1">
                {summary.totalRequests?.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
        </GlowCard>

        <GlowCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active APIs</p>
              <p className="text-2xl font-bold mt-1">
                {summary.activeEndpoints || 0} / {summary.totalEndpoints || 0}
              </p>
            </div>
            <div className="text-3xl">🔌</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Enabled endpoints</p>
        </GlowCard>

        <GlowCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {summary.successRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
        </GlowCard>

        <GlowCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
              <p className="text-2xl font-bold mt-1">
                {summary.avgResponseTime?.toFixed(0) || 0}ms
              </p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Average time</p>
        </GlowCard>
      </div>

      {/* Quick Actions */}
      <GlowCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/api-create"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent transition-colors"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-medium">Create New API</p>
              <p className="text-sm text-muted-foreground">Add endpoint manually</p>
            </div>
          </Link>

          <Link
            href="/admin/api-submit"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent transition-colors"
          >
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium">Submit Script</p>
              <p className="text-sm text-muted-foreground">AI-powered analysis</p>
            </div>
          </Link>

          <Link
            href="/admin/api-review"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent transition-colors"
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium">Review Queue</p>
              <p className="text-sm text-muted-foreground">Pending submissions</p>
            </div>
          </Link>
        </div>
      </GlowCard>

      {/* Recent APIs */}
      <GlowCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent APIs</h3>
          <Link
            href="/admin/api-data"
            className="text-sm text-primary hover:underline"
          >
            View All →
          </Link>
        </div>
        
        {endpoints.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No APIs yet</p>
        ) : (
          <div className="space-y-3">
            {endpoints.slice(0, 5).map((api: any) => (
              <div
                key={api.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    api.method === 'GET' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    api.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                    api.method === 'PUT' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    api.method === 'DELETE' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {api.method}
                  </span>
                  <div>
                    <p className="font-medium">{api.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{api.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    api.enabled ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                  }`}></span>
                  <span className="text-sm text-muted-foreground">
                    {api.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlowCard>

      {/* Recent Errors */}
      {stats?.analytics?.recentErrors?.length > 0 && (
        <GlowCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Errors</h3>
          <div className="space-y-2">
            {stats.analytics.recentErrors.slice(0, 5).map((error: any) => (
              <div
                key={error.id}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div>
                  <p className="font-mono text-sm">{error.endpoint}</p>
                  <p className="text-xs text-muted-foreground">{error.ipAddress}</p>
                </div>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium rounded">
                  {error.statusCode}
                </span>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
