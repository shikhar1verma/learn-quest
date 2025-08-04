// Database types for GrindQuest
export type QuestType = 'primary' | 'side' | 'boss' | 'weekly'
export type QuestStatus = 'not_started' | 'active' | 'paused' | 'completed'
export type XPSourceType = 'quest' | 'event' | 'random_encounter' | 'streak_bonus' | 'weekly_contract' | 'admin_adjustment'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface User {
  id: string
  name: string
  email?: string
  created_at: string
  updated_at: string
}

export interface PlayerClass {
  id: string
  user_id: string
  name: string
  description?: string
  active_flag: boolean
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  class_id: string
  name: string
  description?: string
  order_index: number
  prerequisites: string[]
  created_at: string
}

export interface SkillMilestone {
  id: string
  skill_id: string
  title: string
  description?: string
  target_xp: number
  evidence_url?: string
  completed_at?: string
  created_at: string
}

export interface Quest {
  id: string
  class_id: string
  type: QuestType
  title: string
  description?: string
  checklists: string[]
  estimated_xp: number
  actual_xp?: number
  status: QuestStatus
  tags: string[]
  difficulty: Difficulty
  prerequisites: any[]
  timebox_minutes?: number
  evidence_required: boolean
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  class_id: string
  title: string
  description?: string
  tags: string[]
  difficulty: Difficulty
  estimated_minutes?: number
  actual_minutes?: number
  links: { url: string; title: string }[]
  evidence_required: boolean
  occurred_at: string
  created_at: string
}

export interface XPTransaction {
  id: string
  class_id: string
  source_type: XPSourceType
  source_id?: string
  base_xp: number
  multiplier_applied: number
  total_xp: number
  notes?: string
  created_at: string
}

export interface Level {
  id: string
  class_id: string
  level: number
  total_xp_at_level: number
  reached_at: string
}

export interface Streak {
  id: string
  class_id: string
  current_days: number
  longest_days: number
  last_xp_date?: string
  freeze_tokens: number
  updated_at: string
}

export interface RandomEncounter {
  id: string
  title: string
  description?: string
  weight: number
  reward_xp_min: number
  reward_xp_max: number
  buff_duration_hours: number
  buff_multiplier: number
  tags: string[]
  active: boolean
  created_at: string
}

export interface WeeklyContract {
  id: string
  class_id: string
  title: string
  description?: string
  week_start: string
  week_end: string
  target_value: number
  current_progress: number
  xp_reward: number
  completed_at?: string
  created_at: string
}

export interface Reward {
  id: string
  title: string
  description?: string
  xp_cost: number
  cooldown_hours: number
  prerequisites: any
  tags: string[]
  category: string
  active: boolean
  created_at: string
}

export interface Purchase {
  id: string
  class_id: string
  reward_id: string
  xp_spent: number
  purchased_at: string
  redeemed_at?: string
  redemption_note?: string
  proof_link?: string
}

export interface Ruleset {
  id: string
  name: string
  description?: string
  rules_json: any
  active_flag: boolean
  created_at: string
}

export interface Achievement {
  id: string
  class_id: string
  achievement_key: string
  title: string
  description?: string
  icon?: string
  awarded_at: string
}

// Computed types for UI
export interface PlayerStats {
  totalXP: number
  currentLevel: number
  xpToNextLevel: number
  xpProgress: number
  todayXP: number
  currentStreak: number
  longestStreak: number
  freezeTokens: number
}

export interface QuestWithProgress extends Quest {
  progressPercent: number
  canStart: boolean
  isBlocked: boolean
}