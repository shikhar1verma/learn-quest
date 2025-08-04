import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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

// Mock data for MVP
const recentActivity = [
  { id: '1', type: 'quest', title: 'Build FastAPI MVP', xp: 50, time: '2 hours ago' },
  { id: '2', type: 'event', title: 'Write blog post on AI trends', xp: 25, time: '4 hours ago' },
  { id: '3', type: 'random', title: 'Bug Bounty: Fixed async issue', xp: 15, time: '6 hours ago' },
]

const weeklyContracts = [
  { id: '1', title: 'Complete 3 coding tutorials', progress: 2, target: 3, xp: 60 },
  { id: '2', title: 'Write 2 technical posts', progress: 1, target: 2, xp: 40 },
  { id: '3', title: 'Deploy 1 side project', progress: 0, target: 1, xp: 80 },
]

const nextReward = {
  title: "Premium IDE Theme",
  cost: 150,
  description: "Unlock exclusive coding environment customization"
}

export default function Dashboard() {
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
        >
          <Target className="h-5 w-5 text-quest-primary" />
          <span className="text-sm">Primary Quest</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2 bg-quest-side/10 border-quest-side/30 hover:bg-quest-side/20"
        >
          <Swords className="h-5 w-5 text-quest-side" />
          <span className="text-sm">Side Quest</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2 bg-quest-boss/10 border-quest-boss/30 hover:bg-quest-boss/20"
        >
          <Crown className="h-5 w-5 text-quest-boss" />
          <span className="text-sm">Boss Fight</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2 bg-accent hover:bg-accent/80"
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
                  +140 XP today
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
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
              ))}
            </CardContent>
          </Card>

          {/* Weekly Contracts */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-quest-weekly" />
                Weekly Contracts
              </CardTitle>
              <CardDescription>Complete these by Sunday for bonus XP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyContracts.map((contract) => (
                <div key={contract.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{contract.title}</p>
                    <Badge variant="outline" className="border-quest-weekly/30 text-quest-weekly">
                      {contract.xp} XP
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(contract.progress / contract.target) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-muted-foreground min-w-fit">
                      {contract.progress}/{contract.target}
                    </span>
                  </div>
                </div>
              ))}
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
                <h3 className="font-medium">{nextReward.title}</h3>
                <p className="text-sm text-muted-foreground">{nextReward.description}</p>
                <Badge className="bg-level/20 text-level border-level/30">
                  {nextReward.cost} XP
                </Badge>
              </div>
              <Button className="w-full bg-gradient-hero text-primary-foreground">
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
                <span className="text-sm font-medium text-xp">485 XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quests Completed</span>
                <span className="text-sm font-medium">7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Streak</span>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                  4 days
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Freeze Tokens</span>
                <span className="text-sm font-medium">2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}