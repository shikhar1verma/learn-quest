import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/hooks/useAdmin";
import { Users, Swords, Gift, Zap, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminOverview() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return <div className="animate-pulse">Loading stats...</div>;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Registered players"
    },
    {
      title: "Active Quests",
      value: stats?.totalQuests || 0,
      icon: Swords,
      description: "Available quests"
    },
    {
      title: "Store Rewards",
      value: stats?.totalRewards || 0,
      icon: Gift,
      description: "Purchasable rewards"
    },
    {
      title: "Today's XP",
      value: stats?.todayXP || 0,
      icon: Zap,
      description: "XP earned today"
    },
    {
      title: "This Week's XP",
      value: stats?.weekXP || 0,
      icon: TrendingUp,
      description: "XP earned this week"
    }
  ];

  const quickActions = [
    {
      title: "Create Quest",
      description: "Add new quests for players",
      href: "/admin/quests",
      action: "Create New"
    },
    {
      title: "Manage Rules",
      description: "Configure XP and game mechanics",
      href: "/admin/rules",
      action: "Edit Rules"
    },
    {
      title: "Add Rewards",
      description: "Create new store items",
      href: "/admin/store",
      action: "Add Reward"
    },
    {
      title: "Manage Users",
      description: "View and manage player accounts",
      href: "/admin/users",
      action: "View Users"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your GrindQuest system and quick actions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Ruleset:</span>
              <span className="text-sm font-medium">{stats?.activeRuleset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">System Status:</span>
              <span className="text-sm font-medium text-green-600">Operational</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <div key={action.title} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={action.href}>{action.action}</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}