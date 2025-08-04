import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Target, 
  Swords, 
  Crown, 
  Calendar,
  Zap,
  TrendingUp,
  Gift,
  Dice6
} from "lucide-react"
import { useProfileStats } from "@/hooks/useProfile"
import { useXPTransactions } from "@/hooks/useEvents"
import { useRewards } from "@/hooks/useRewards"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useProfileStats();
  const { data: transactions, isLoading: transactionsLoading } = useXPTransactions();
  const { data: rewards } = useRewards();
  const navigate = useNavigate();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const recentActivity = transactions?.slice(0, 3).map(tx => ({
    id: tx.id,
    type: tx.source,
    title: `${tx.source === 'quest' ? 'Quest' : 'Event'} completed`,
    xp: tx.total_xp,
    time: formatTimeAgo(tx.created_at),
  })) || [];

  const nextReward = rewards ? rewards.find(r => (stats?.total_xp || 0) < r.cost_xp) : null;

  if (statsLoading || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your learning journey and progress</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64" />
          </div>
          <div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Track your learning journey and progress</p>
        </div>
        <Button 
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
          size="lg"
        >
          <Dice6 className="mr-2 h-4 w-4" />
          Spin Random Encounter
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2 bg-quest-primary/10 border-quest-primary/30 hover:bg-quest-primary/20"
          onClick={() => navigate('/quests')}
        >
          <Target className="h-5 w-5 text-quest-primary" />
          <span className="text-sm">Primary Quest</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2 bg-quest-side/10 border-quest-side/30 hover:bg-quest-side/20"
          onClick={() => navigate('/quests')}
        >
          <Swords className="h-5 w-5 text-quest-side" />
          <span className="text-sm">Side Quest</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2 bg-quest-boss/10 border-quest-boss/30 hover:bg-quest-boss/20"
          onClick={() => navigate('/quests')}
        >
          <Crown className="h-5 w-5 text-quest-boss" />
          <span className="text-sm">Boss Fight</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2 bg-accent hover:bg-accent/80"
          onClick={() => navigate('/events')}
        >
          <Calendar className="h-5 w-5 text-accent-foreground" />
          <span className="text-sm">Custom Event</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest XP gains and achievements</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-xp/20 text-xp">
                  +{stats?.today_xp || 0} XP today
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-xp/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-xp" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge className="bg-xp/20 text-xp border-xp/30">
                    +{activity.xp} XP
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activity</p>
                  <p className="text-sm">Complete quests or log events to see activity here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Contracts */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-quest-weekly" />
                Weekly Contracts
              </CardTitle>
              <CardDescription>Weekly goals coming soon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Weekly contracts coming soon</p>
                <p className="text-sm">Check back for automatically generated weekly goals</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Next Reward Preview */}
          <Card className="bg-gradient-surface border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-level">
                <Gift className="h-5 w-5" />
                Next Reward
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-level/20 flex items-center justify-center">
                  <Gift className="h-8 w-8 text-level" />
                </div>
                <h3 className="font-medium">{nextReward?.title || 'No rewards available'}</h3>
                <p className="text-sm text-muted-foreground">
                  {nextReward?.description || 'Complete more quests to unlock rewards'}
                </p>
                {nextReward && (
                  <Badge className="bg-level/20 text-level border-level/30">
                    {nextReward.cost_xp} XP
                  </Badge>
                )}
              </div>
              <Button 
                className="w-full bg-gradient-hero text-primary-foreground"
                onClick={() => navigate('/store')}
              >
                View Store
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="text-sm font-medium text-xp">{stats?.today_xp || 0} XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <span className="text-sm font-medium">{stats?.total_xp || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Streak</span>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                  {stats?.current_streak || 0} days
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Freeze Tokens</span>
                <span className="text-sm font-medium">{stats?.freeze_tokens || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}