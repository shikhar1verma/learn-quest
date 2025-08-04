import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Target, 
  Swords, 
  Crown, 
  Calendar,
  CheckCircle,
  PlayCircle,
  PauseCircle
} from "lucide-react"
import { useQuests, useUpdateQuestStatus, useCompleteQuest } from "@/hooks/useQuests"
import { toast } from "sonner"

const getQuestIcon = (type: string) => {
  switch (type) {
    case 'primary': return Target
    case 'side': return Swords
    case 'boss': return Crown
    case 'weekly': return Calendar
    default: return Target
  }
}

const getQuestColor = (type: string) => {
  switch (type) {
    case 'primary': return 'quest-primary'
    case 'side': return 'quest-side'
    case 'boss': return 'quest-boss'
    case 'weekly': return 'quest-weekly'
    default: return 'quest-primary'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done': return 'bg-xp/20 text-xp'
    case 'active': return 'bg-blue-500/20 text-blue-400'
    case 'paused': return 'bg-orange-500/20 text-orange-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/20 text-green-400'
    case 'medium': return 'bg-yellow-500/20 text-yellow-400'
    case 'hard': return 'bg-red-500/20 text-red-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

export default function Quests() {
  const [activeTab, setActiveTab] = useState('primary')
  const { data: quests, isLoading, error } = useQuests()
  const updateQuestStatus = useUpdateQuestStatus()
  const completeQuest = useCompleteQuest()
  
  const getQuestsByType = (type: string) => {
    return quests?.filter(quest => quest.type === type) || []
  }

  const getProgress = (quest: any) => {
    if (quest.status === 'done') return 100
    if (quest.status === 'planned') return 0
    const completedItems = quest.quest_checklist?.filter((item: any) => item.is_done).length || 0
    const totalItems = quest.quest_checklist?.length || 1
    return Math.round((completedItems / totalItems) * 100)
  }

  const handleStatusChange = async (questId: string, newStatus: string) => {
    try {
      await updateQuestStatus.mutateAsync({ questId, status: newStatus })
      toast.success(`Quest ${newStatus}`)
    } catch (error) {
      toast.error(`Failed to ${newStatus} quest`)
    }
  }

  const handleCompleteQuest = async (questId: string) => {
    try {
      await completeQuest.mutateAsync({ 
        questId, 
        evidenceUrl: '', 
        notes: 'Quest completed via UI' 
      })
      toast.success('Quest completed! XP awarded.')
    } catch (error) {
      toast.error('Failed to complete quest')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quests</h1>
          <p className="text-muted-foreground">Choose your next challenge and level up your skills</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Unable to load quests</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quests</h1>
          <p className="text-muted-foreground">Choose your next challenge and level up your skills</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground">
          Create Custom Quest
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="primary">
            <Target className="mr-2 h-4 w-4" />
            Primary
          </TabsTrigger>
          <TabsTrigger value="side">
            <Swords className="mr-2 h-4 w-4" />
            Side Quests
          </TabsTrigger>
          <TabsTrigger value="boss">
            <Crown className="mr-2 h-4 w-4" />
            Boss Fights
          </TabsTrigger>
          <TabsTrigger value="weekly">
            <Calendar className="mr-2 h-4 w-4" />
            Weekly
          </TabsTrigger>
        </TabsList>

        {['primary', 'side', 'boss', 'weekly'].map(type => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid gap-4">
              {getQuestsByType(type).length > 0 ? getQuestsByType(type).map((quest) => {
                const Icon = getQuestIcon(quest.type)
                const progress = getProgress(quest)
                
                return (
                  <Card key={quest.id} className="bg-card border-border shadow-card hover:shadow-elevated transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{quest.title}</CardTitle>
                            <CardDescription>{quest.description}</CardDescription>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getStatusColor(quest.status)} variant="outline">
                                {quest.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getDifficultyColor(quest.difficulty)} variant="outline">
                                {quest.difficulty}
                              </Badge>
                              <Badge variant="outline" className="border-xp/30 text-xp">
                                {quest.base_xp} XP
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {quest.status === 'planned' && (
                            <Button 
                              size="sm" 
                              className="bg-gradient-primary"
                              onClick={() => handleStatusChange(quest.id, 'active')}
                              disabled={updateQuestStatus.isPending}
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Start
                            </Button>
                          )}
                          {quest.status === 'active' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusChange(quest.id, 'paused')}
                                disabled={updateQuestStatus.isPending}
                              >
                                <PauseCircle className="mr-2 h-4 w-4" />
                                Pause
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-xp text-xp-foreground"
                                onClick={() => handleCompleteQuest(quest.id)}
                                disabled={completeQuest.isPending}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {quest.status !== 'planned' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Checklist</h4>
                        <div className="space-y-1">
                          {quest.quest_checklist?.length > 0 ? quest.quest_checklist.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <div className={`w-4 h-4 rounded border cursor-pointer ${
                                item.is_done 
                                  ? 'bg-xp border-xp' 
                                  : 'border-muted-foreground hover:border-primary'
                              }`} />
                              <span className={
                                item.is_done 
                                  ? 'line-through text-muted-foreground' 
                                  : 'text-foreground'
                              }>
                                {item.label}
                              </span>
                            </div>
                          )) : (
                            <p className="text-sm text-muted-foreground">No checklist items</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              }) : (
                <Card className="p-8">
                  <div className="text-center">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No {type} quests available</h3>
                    <p className="text-muted-foreground">Check back later for new challenges!</p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}