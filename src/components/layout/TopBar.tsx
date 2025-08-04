import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Flame, Zap } from "lucide-react"

// Mock data - will be replaced with real data
const mockClasses = [
  { id: '1', name: 'Copywriter Strategist', color: '#8b5cf6', active: true },
  { id: '2', name: 'Finance/FinTech Builder', color: '#06b6d4', active: false },
  { id: '3', name: 'Backend/Full-Stack Engineer', color: '#10b981', active: false },
]

const mockStats = {
  totalXP: 847,
  currentLevel: 12,
  xpToNextLevel: 153,
  xpProgress: 68.4,
  todayXP: 45,
  currentStreak: 4,
}

export function TopBar() {
  const [activeClass, setActiveClass] = useState(mockClasses.find(c => c.active) || mockClasses[0])

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        {/* Active Class Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-gradient-primary text-primary-foreground border-0"
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: activeClass.color }}
              />
              <span className="font-medium">{activeClass.name}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {mockClasses.map((cls) => (
              <DropdownMenuItem 
                key={cls.id}
                onClick={() => setActiveClass(cls)}
                className="flex items-center gap-2"
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: cls.color }}
                />
                {cls.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Display */}
      <div className="flex items-center gap-6">
        {/* Level & XP Progress */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-level">Level {mockStats.currentLevel}</div>
            <div className="text-xs text-muted-foreground">{mockStats.totalXP} total XP</div>
          </div>
          <div className="flex flex-col gap-1">
            <Progress 
              value={mockStats.xpProgress} 
              className="w-32 h-2 bg-muted"
            />
            <div className="text-xs text-muted-foreground text-center">
              {mockStats.xpToNextLevel} XP to next level
            </div>
          </div>
        </div>

        {/* Today's XP */}
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-xp" />
          <div className="text-sm">
            <span className="font-medium text-xp">+{mockStats.todayXP}</span>
            <span className="text-muted-foreground ml-1">today</span>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            {mockStats.currentStreak} day streak
          </Badge>
        </div>
      </div>
    </header>
  )
}