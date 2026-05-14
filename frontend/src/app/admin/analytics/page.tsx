'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Clock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/ui/glow-card';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">API usage and performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          {['24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {p === '24h' ? '24 Hours' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : analytics ? (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <GlowCard className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.totalRequests?.toLocaleString() || 0}</p>
            </GlowCard>

            <GlowCard className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.successRate?.toFixed(1) || 0}%</p>
            </GlowCard>

            <GlowCard className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-purple-500" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.avgResponseTime?.toFixed(0) || 0}ms</p>
            </GlowCard>

            <GlowCard className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-orange-500" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Endpoints</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.activeEndpoints || 0}</p>
            </GlowCard>
          </div>

          {/* Top Endpoints */}
          {analytics.topEndpoints && analytics.topEndpoints.length > 0 && (
            <GlowCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BarChart3 className="h-4 w-4" />
                Top Endpoints
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Endpoint</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {analytics.topEndpoints.map((ep: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">{ep.endpoint}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                          {ep._count?.toLocaleString() || ep.count?.toLocaleString() || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlowCard>
          )}

          {/* Status Breakdown */}
          {analytics.statusBreakdown && analytics.statusBreakdown.length > 0 && (
            <GlowCard className="p-6">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Response Status Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {analytics.statusBreakdown.map((status: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      status.statusCode < 300 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      status.statusCode < 400 ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                      status.statusCode < 500 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {status.statusCode}
                    </span>
                    <p className="text-lg font-bold mt-2 text-gray-900 dark:text-gray-100">
                      {status._count?.toLocaleString() || status.count?.toLocaleString() || 0}
                    </p>
                  </div>
                ))}
              </div>
            </GlowCard>
          )}
        </>
      ) : (
        <GlowCard className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30 text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
        </GlowCard>
      )}
    </div>
  );
}
