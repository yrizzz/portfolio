'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Key, 
  Activity, 
  FolderOpen,
  FileText,
  BarChart3,
  Code2
} from "lucide-react";
import { GlowCard } from '@/components/ui/glow-card';
import { AnimatedButton } from '@/components/ui/animated-button';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeApiKeys: 0,
    totalRequests: 0,
    totalProjects: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/logs?limit=5'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setRecentLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active API Keys",
      value: stats.activeApiKeys,
      icon: Key,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "API Requests",
      value: stats.totalRequests.toLocaleString(),
      icon: Activity,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Projects",
      value: stats.totalProjects,
      icon: FolderOpen,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your portfolio admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <GlowCard key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {loading ? '...' : stat.value}
                </h3>
              </div>
              <div className={`h-12 w-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlowCard className="p-6 group cursor-pointer" onClick={() => window.location.href = '/admin/projects'}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Content Management</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Manage projects, experience, and skills
          </p>
          <span className="text-sm font-medium text-primary group-hover:underline">
            Manage Content →
          </span>
        </GlowCard>

        <GlowCard className="p-6 group cursor-pointer" onClick={() => window.location.href = '/admin/api-data'}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">API Management</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Create, edit, and manage API endpoints
          </p>
          <span className="text-sm font-medium text-primary group-hover:underline">
            Manage APIs →
          </span>
        </GlowCard>

        <GlowCard className="p-6 group cursor-pointer" onClick={() => window.location.href = '/admin/api-monitoring'}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">API Monitoring</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Monitor API usage and performance
          </p>
          <span className="text-sm font-medium text-primary group-hover:underline">
            View Monitoring →
          </span>
        </GlowCard>
      </div>

      {/* Recent Activity */}
      <GlowCard className="p-6">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Recent API Requests</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : recentLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Endpoint</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentLogs.map((log: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        log.method === 'GET' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        log.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                        'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                      {log.endpoint}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        log.statusCode < 400 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {log.responseTime}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
            No recent activity to display
          </p>
        )}
      </GlowCard>
    </div>
  );
}
