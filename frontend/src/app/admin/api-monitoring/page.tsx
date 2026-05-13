'use client';

import { useState, useEffect } from 'react';
import { GlowCard } from '@/components/ui/glow-card';

export default function MonitoringPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const requestsByStatus = analytics?.requestsByStatus || [];
  const requestsByEndpoint = analytics?.requestsByEndpoint || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monitoring & Analytics</h2>
          <p className="text-muted-foreground mt-1">Track API performance and usage</p>
        </div>
        
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-3xl font-bold mt-2">
                {summary.totalRequests?.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </GlowCard>

        <GlowCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {summary.successRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </GlowCard>

        <GlowCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {summary.avgResponseTime?.toFixed(0) || 0}ms
              </p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </GlowCard>

        <GlowCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Endpoints</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {summary.activeEndpoints || 0}
              </p>
            </div>
            <div className="text-4xl">🔌</div>
          </div>
        </GlowCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Status */}
        <GlowCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Requests by Status Code</h3>
          
          {requestsByStatus.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {requestsByStatus.map((item: any) => {
                const percentage = summary.totalRequests > 0 
                  ? (item.count / summary.totalRequests * 100).toFixed(1)
                  : 0;
                
                const statusColor = 
                  item.statusCode < 300 ? 'bg-green-500' :
                  item.statusCode < 400 ? 'bg-blue-500' :
                  item.statusCode < 500 ? 'bg-yellow-500' :
                  'bg-red-500';

                return (
                  <div key={item.statusCode}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">
                        {item.statusCode}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${statusColor} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlowCard>

        {/* Top Endpoints */}
        <GlowCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Endpoints</h3>
          
          {requestsByEndpoint.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {requestsByEndpoint.map((item: any, index: number) => {
                const percentage = summary.totalRequests > 0 
                  ? (item.count / summary.totalRequests * 100).toFixed(1)
                  : 0;

                return (
                  <div key={item.endpoint}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-mono truncate">
                        #{index + 1} {item.endpoint}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlowCard>
      </div>

      {/* Recent Errors */}
      {analytics?.recentErrors?.length > 0 && (
        <GlowCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Errors</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Endpoint
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.recentErrors.map((error: any) => (
                  <tr key={error.id}>
                    <td className="px-4 py-3 text-sm font-mono">
                      {error.endpoint}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium rounded">
                        {error.statusCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {error.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(error.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlowCard>
      )}
    </div>
  );
}
