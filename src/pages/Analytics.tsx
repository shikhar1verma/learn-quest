import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useSkills";
import { useProfileStats } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Target, Zap, Calendar } from "lucide-react";

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: stats, isLoading: statsLoading } = useProfileStats();

  if (analyticsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your learning progress and performance</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  // Prepare chart data
  const xpOverTimeData = analytics?.xpOverTime 
    ? Object.entries(analytics.xpOverTime).map(([date, xp]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        xp: xp as number,
      }))
    : [];

  const questTypeData = analytics?.questsByType
    ? Object.entries(analytics.questsByType).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: count as number,
      }))
    : [];

  const xpSourceData = analytics?.xpBySource
    ? Object.entries(analytics.xpBySource).map(([source, xp]) => ({
        source: source.charAt(0).toUpperCase() + source.slice(1),
        xp: xp as number,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">Track your learning progress and performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_xp || 0}</div>
            <p className="text-xs text-muted-foreground">
              Level {stats?.current_level || 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's XP</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today_xp || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.xp_to_next_level || 0} XP to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.current_streak || 0}</div>
            <p className="text-xs text-muted-foreground">
              Best: {stats?.longest_streak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Freeze Tokens</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.freeze_tokens || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available to use
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>XP Over Time</CardTitle>
            <CardDescription>
              Daily XP earned in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {xpOverTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={xpOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>XP by Source</CardTitle>
            <CardDescription>
              Total XP earned from different activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {xpSourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={xpSourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="xp" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quest Completions */}
      {questTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quest Completions by Type</CardTitle>
            <CardDescription>
              Number of completed quests by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {analytics?.recentTransactions && analytics.recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest XP transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentTransactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{transaction.source}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Zap className="h-3 w-3" />
                    <span className="font-semibold">+{transaction.total_xp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}