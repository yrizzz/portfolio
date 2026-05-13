import { auth } from "@/lib/auth";
import { 
  Users, 
  Key, 
  Activity, 
  DollarSign,
  TrendingUp,
  FileText,
  BarChart3
} from "lucide-react";

async function getAdminStats() {
  // TODO: Replace with actual database queries
  return {
    totalUsers: 0,
    activeApiKeys: 0,
    totalRequests: 0,
    revenue: 0,
    recentUsers: [],
    recentRequests: [],
  };
}

export default async function AdminDashboard() {
  const session = await auth();
  const stats = await getAdminStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Active API Keys",
      value: stats.activeApiKeys,
      icon: Key,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "API Requests",
      value: stats.totalRequests.toLocaleString(),
      icon: Activity,
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Revenue",
      value: `Rp ${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      change: "+15%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                <p className={`text-sm mt-2 flex items-center gap-1 ${
                  stat.changeType === "positive" 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  <TrendingUp className="h-4 w-4" />
                  {stat.change} from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-semibold">Content Management</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Manage projects, experience, and skills
          </p>
          <a
            href="/admin/content"
            className="text-sm font-medium text-primary hover:underline"
          >
            Manage Content →
          </a>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="font-semibold">User Management</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            View and manage user accounts
          </p>
          <a
            href="/admin/users"
            className="text-sm font-medium text-primary hover:underline"
          >
            Manage Users →
          </a>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="font-semibold">API Analytics</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Monitor API usage and performance
          </p>
          <a
            href="/admin/analytics"
            className="text-sm font-medium text-primary hover:underline"
          >
            View Analytics →
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity to display
          </p>
        </div>
      </div>
    </div>
  );
}
