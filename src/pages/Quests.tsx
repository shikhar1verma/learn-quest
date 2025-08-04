import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  Swords, 
  Crown, 
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle
} from "lucide-react"
import type { Quest, QuestType } from "@/types/database"

// Mock quest data
const mockQuests: Quest[] = [
  {
    id: '1',
    class_id: '1',
    type: 'primary',
    title: 'Build a RAG System with LangChain',
    description: 'Create a retrieval-augmented generation system using LangChain and vector embeddings',
    checklists: ['Set up vector database', 'Implement document chunking', 'Create retrieval pipeline', 'Build chat interface'],
    estimated_xp: 120,
    status: 'not_started',
    tags: ['langchain', 'rag', 'ai'],
    difficulty: 'hard',
    prerequisites: [],
    timebox_minutes: 480,
    evidence_required: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    class_id: '1',
    type: 'side',
    title: 'Write Prompt Engineering Guide',
    description: 'Create a comprehensive guide on advanced prompt engineering techniques',
    checklists: ['Research current techniques', 'Draft content structure', 'Write guide', 'Add code examples'],
    estimated_xp: 60,
    status: 'active',
    tags: ['prompting', 'content', 'ai'],
    difficulty: 'medium',
    prerequisites: [],
    timebox_minutes: 240,
    evidence_required: false,
    started_at: '2024-01-02',
    created_at: '2024-01-01',
    updated_at: '2024-01-02'
  },
  {
    id: '3',
    class_id: '1',
    type: 'boss',
    title: 'Launch AI SaaS MVP',
    description: 'Build and deploy a complete AI-powered SaaS application',
    checklists: ['Design architecture', 'Build backend API', 'Create frontend', 'Set up payments', 'Deploy to production'],
    estimated_xp: 300,
    status: 'not_started',
    tags: ['saas', 'fullstack', 'deployment'],
    difficulty: 'hard',
    prerequisites: [],
    timebox_minutes: 2400,
    evidence_required: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
]

const getQuestIcon = (type: QuestType) => {
  switch (type) {
    case 'primary': return Target
    case 'side': return Swords
    case 'boss': return Crown
    case 'weekly': return Calendar
  }
}

const getQuestColor = (type: QuestType) => {
  switch (type) {
    case 'primary': return 'quest-primary'
    case 'side': return 'quest-side'
    case 'boss': return 'quest-boss'
    case 'weekly': return 'quest-weekly'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-xp/20 text-xp'
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
  
  const getQuestsByType = (type: QuestType) => {
    return mockQuests.filter(quest => quest.type === type)
  }

  const getProgress = (quest: Quest) => {
    if (quest.status === 'completed') return 100
    if (quest.status === 'not_started') return 0
    // Mock progress for active quests
    return 35
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quests</h1>
          <p className="text-muted-foreground">Choose your next challenge and level up your skills</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground">
          Create Custom Quest
        </Button>
      </div>

      {/* Quest Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="primary" className="data-[state=active]:bg-quest-primary/20 data-[state=active]:text-quest-primary">
            <Target className="mr-2 h-4 w-4" />
            Primary
          </TabsTrigger>
          <TabsTrigger value="side" className="data-[state=active]:bg-quest-side/20 data-[state=active]:text-quest-side">
            <Swords className="mr-2 h-4 w-4" />
            Side Quests
          </TabsTrigger>
          <TabsTrigger value="boss" className="data-[state=active]:bg-quest-boss/20 data-[state=active]:text-quest-boss">
            <Crown className="mr-2 h-4 w-4" />
            Boss Fights
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-quest-weekly/20 data-[state=active]:text-quest-weekly">
            <Calendar className="mr-2 h-4 w-4" />
            Weekly
          </TabsTrigger>
        </TabsList>

        {['primary', 'side', 'boss', 'weekly'].map(type => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid gap-4">
              {getQuestsByType(type as QuestType).map((quest) => {
                const Icon = getQuestIcon(quest.type)
                const progress = getProgress(quest)
                
                return (
                  <Card key={quest.id} className="bg-card border-border shadow-card hover:shadow-elevated transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-${getQuestColor(quest.type)}/20 flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 text-${getQuestColor(quest.type)}`} />
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
                                {quest.estimated_xp} XP
                              </Badge>
                              {quest.timebox_minutes && (
                                <Badge variant="outline" className="text-muted-foreground">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {Math.floor(quest.timebox_minutes / 60)}h {quest.timebox_minutes % 60}m
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {quest.status === 'not_started' && (
                            <Button size="sm" className="bg-gradient-primary">
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Start
                            </Button>
                          )}
                          {quest.status === 'active' && (
                            <>
                              <Button size="sm" variant="outline">
                                <PauseCircle className="mr-2 h-4 w-4" />
                                Pause
                              </Button>
                              <Button size="sm" className="bg-xp text-xp-foreground">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {quest.status !== 'not_started' && (
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
                          {quest.checklists.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className={`w-4 h-4 rounded border ${
                                progress > (index + 1) * (100 / quest.checklists.length) 
                                  ? 'bg-xp border-xp' 
                                  : 'border-muted-foreground'
                              }`} />
                              <span className={
                                progress > (index + 1) * (100 / quest.checklists.length) 
                                  ? 'line-through text-muted-foreground' 
                                  : 'text-foreground'
                              }>
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {quest.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {quest.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}