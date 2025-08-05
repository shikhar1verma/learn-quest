# GrindQuest XP & Gamification System

This document details the comprehensive XP (Experience Points) and gamification mechanics that drive user engagement and progression in GrindQuest.

## XP System Architecture

```mermaid
flowchart TD
    subgraph "XP Sources"
        QuestComplete[Quest Completion]
        SkillMilestone[Skill Milestone]
        CustomEvent[Custom Event]
        AdminAward[Admin Award]
    end
    
    subgraph "XP Calculation Engine"
        BaseXP[Base XP Value]
        Multipliers[Apply Multipliers]
        Rules[Rules Engine]
        
        subgraph "Multiplier Types"
            Difficulty[Difficulty: Easy=1.0x, Medium=1.2x, Hard=1.5x]
            ClassAlign[Class Alignment: +20%]
            Novelty[Novelty Bonus: +10%]
            SocialProof[Social Proof: +10%]
        end
    end
    
    subgraph "Progression System"
        XPTransaction[XP Transaction Record]
        TotalXP[Update Total XP]
        LevelCalc[Level Calculation]
        ProgressUpdate[Progress Update]
        
        subgraph "Level Formula"
            Level1[Level 1: 100 XP]
            Level2[Level 2: 150 XP]
            Level3[Level 3: 200 XP]
            LevelN["Level N: 100 + 50×&lpar;N-1&rpar;"]
        end
    end
    
    subgraph "Reward Systems"
        Streaks[Daily Streaks]
        FreezeTokens[Freeze Tokens]
        Unlocks[Feature Unlocks]
        StoreAccess[Store Access]
    end
    
    %% Flow Connections
    QuestComplete --> BaseXP
    SkillMilestone --> BaseXP
    CustomEvent --> BaseXP
    AdminAward --> BaseXP
    
    BaseXP --> Multipliers
    Multipliers --> Rules
    Rules --> XPTransaction
    XPTransaction --> TotalXP
    TotalXP --> LevelCalc
    LevelCalc --> ProgressUpdate
    
    ProgressUpdate --> Streaks
    ProgressUpdate --> FreezeTokens
    ProgressUpdate --> Unlocks
    ProgressUpdate --> StoreAccess
```

## Detailed XP Calculation Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Action as Action Source
    participant Engine as XP Engine
    participant Rules as Rules Engine
    participant DB as Database
    participant UI as User Interface
    
    User->>Action: Complete Activity
    Action->>Engine: Request XP Calculation
    Engine->>Engine: Get Base XP Value
    
    Note over Engine: Base XP Examples:<br/>Read Doc: 5 XP<br/>Tutorial: 20 XP<br/>MVP Deploy: 50 XP<br/>Close Deal: 120 XP
    
    Engine->>Rules: Apply Difficulty Multiplier
    Rules->>Rules: Easy=1.0x, Medium=1.2x, Hard=1.5x
    
    Engine->>Rules: Check Class Alignment
    Rules->>Rules: +20% if activity matches user's class
    
    Engine->>Rules: Check Novelty Bonus
    Rules->>Rules: +10% for first-time tag combinations
    
    Engine->>Rules: Check Social Proof
    Rules->>Rules: +10% if evidence URL provided
    
    Rules->>Engine: Return Final Multiplier
    Engine->>Engine: Calculate: Base XP × Multiplier
    Engine->>DB: Create XP Transaction Record
    
    DB->>DB: Update User's Total XP
    DB->>DB: Check Level Progression
    DB->>DB: Update Daily Streak
    
    DB->>UI: Send Updated Stats
    UI->>User: Show XP Gain Animation
    UI->>User: Show Level Up (if applicable)
    UI->>User: Update Progress Bars
```

## Level Progression System

```mermaid
graph TD
    subgraph "Level Calculation"
        Start[User Current XP]
        Formula["Level = 1 + floor&lpar;&lpar;XP - 100&rpar; ÷ 50&rpar;"]
        Calculate[Calculate Current Level]
        NextLevel[XP to Next Level]
        Progress[Progress Percentage]
    end
    
    subgraph "Level Benefits"
        L1[Level 1: Basic Access]
        L5[Level 5: Unlock Analytics]
        L10[Level 10: Weekly Contracts]
        L15[Level 15: Boss Quests]
        L20[Level 20: Premium Rewards]
        LMax["Level Max: Prestige System"]
    end
    
    subgraph "Visual Indicators"
        ProgressBar[Progress Bar]
        XPCounter[XP Counter]
        LevelBadge[Level Badge]
        NextReward[Next Reward Preview]
    end
    
    Start --> Formula
    Formula --> Calculate
    Calculate --> NextLevel
    NextLevel --> Progress
    
    Calculate --> L1
    Calculate --> L5
    Calculate --> L10
    Calculate --> L15
    Calculate --> L20
    Calculate --> LMax
    
    Progress --> ProgressBar
    Calculate --> XPCounter
    Calculate --> LevelBadge
    NextLevel --> NextReward
```

## Streak System Mechanics

```mermaid
stateDiagram-v2
    [*] --> NoStreak: User Signup
    NoStreak --> DayOne: First XP Earned
    DayOne --> Growing: Daily XP Earned
    Growing --> Growing: Continue Daily XP
    Growing --> Frozen: Use Freeze Token
    Growing --> Broken: Miss Day (No Token)
    Frozen --> Growing: Resume Next Day
    Frozen --> Broken: Miss Multiple Days
    Broken --> DayOne: Restart Streak
    Growing --> Milestone: 7 Day Milestone
    Milestone --> FreezeReward: Award Freeze Token
    FreezeReward --> Growing: Continue Streak
    
    note right of Growing
        Streak continues with any XP gain
        Grace period: 200+ XP in prior 2 days
        = one weekly save
    end note
    
    note right of Frozen
        Freeze tokens protect streaks
        Max 3 tokens per user
        Auto-use if available
    end note
```

## Quest Type & Reward Structure

```mermaid
graph TB
    subgraph "Quest Types & XP Rewards"
        subgraph "Primary Quests"
            P1[Foundation Building: 20-50 XP]
            P2[Core Implementation: 50-80 XP]
            P3[Advanced Projects: 80-120 XP]
        end
        
        subgraph "Side Quests"
            S1[Quick Wins: 10-30 XP]
            S2[Skill Practice: 20-40 XP]
            S3[Community Engagement: 15-35 XP]
        end
        
        subgraph "Boss Fights"
            B1[Major Milestones: 100-200 XP]
            B2[Capstone Projects: 150-300 XP]
            B3[Challenge Quests: 200-500 XP]
        end
        
        subgraph "Weekly Contracts"
            W1[Consistency Goals: 30-60 XP]
            W2[Learning Targets: 40-80 XP]
            W3[Output Goals: 50-100 XP]
        end
    end
    
    subgraph "Multiplier Applications"
        ClassBonus[Class Aligned: +20%]
        DifficultyBonus[Hard Difficulty: +50%]
        NoveltyBonus[First Time: +10%]
        EvidenceBonus[With Proof: +10%]
        
        MaxMultiplier["Maximum: 1.5 × 1.2 × 1.1 × 1.1 = 2.178x"]
    end
    
    P1 --> ClassBonus
    S1 --> ClassBonus
    B1 --> DifficultyBonus
    W1 --> NoveltyBonus
    ClassBonus --> MaxMultiplier
    DifficultyBonus --> MaxMultiplier
    NoveltyBonus --> MaxMultiplier
    EvidenceBonus --> MaxMultiplier
```

## Store Economy & Rewards

```mermaid
flowchart TD
    subgraph "XP Economy Tiers"
        Micro[Micro Rewards: 10-50 XP]
        Small[Small Rewards: 50-150 XP]
        Medium[Medium Rewards: 150-400 XP]
        Large[Large Rewards: 400-1000 XP]
        Epic[Epic Rewards: 1000+ XP]
    end
    
    subgraph "Reward Categories"
        subgraph "Learning Resources"
            LR1[Course Access: 100-300 XP]
            LR2[Book Credits: 150-250 XP]
            LR3[Tool Licenses: 200-500 XP]
        end
        
        subgraph "Physical Rewards"
            PR1[Coffee/Snacks: 20-50 XP]
            PR2[Merchandise: 100-200 XP]
            PR3[Tech Gadgets: 500-1500 XP]
        end
        
        subgraph "Experience Rewards"
            ER1[Break Time: 30-60 XP]
            ER2[Entertainment: 100-300 XP]
            ER3[Travel/Events: 1000-3000 XP]
        end
        
        subgraph "Career Rewards"
            CR1[Portfolio Review: 200-400 XP]
            CR2[Mentorship Session: 500-800 XP]
            CR3[Conference Tickets: 1000-2000 XP]
        end
    end
    
    subgraph "Prerequisites System"
        LevelReq[Level Requirements]
        SkillReq[Skill Prerequisites]
        StreakReq[Streak Requirements]
        TimeReq[Time-based Unlocks]
    end
    
    Micro --> LR1
    Small --> LR2
    Medium --> PR2
    Large --> CR1
    Epic --> CR3
    
    LR1 --> LevelReq
    PR2 --> SkillReq
    CR1 --> StreakReq
    CR3 --> TimeReq
```

## Gamification Psychology Elements

```mermaid
mindmap
    root((GrindQuest Gamification))
        Motivation
            Autonomy
                Player Choice
                Custom Goals
                Self-Direction
            Mastery
                Skill Trees
                Progressive Difficulty
                Clear Progress
            Purpose
                Real Learning
                Career Growth
                Meaningful Rewards
        
        Engagement
            Achievement
                XP Points
                Level Progression
                Badges/Milestones
            Social
                Leaderboards
                Sharing Evidence
                Community Features
            Competition
                Boss Fights
                Weekly Challenges
                Personal Bests
        
        Retention
            Habits
                Daily Streaks
                Consistent Rewards
                Routine Building
            Variety
                Multiple Quest Types
                Different Activities
                Surprise Elements
            Progress
                Visual Indicators
                Milestone Celebrations
                Long-term Goals
```

## XP Transaction Audit Trail

```mermaid
erDiagram
    XP_TRANSACTION {
        uuid id PK
        uuid profile_id FK
        string source
        uuid source_id FK
        integer base_xp
        numeric multiplier
        integer total_xp "COMPUTED"
        jsonb context
        timestamp created_at
    }
    
    AUDIT_LOG {
        uuid id PK
        string action
        string entity
        uuid entity_id
        string actor
        jsonb before
        jsonb after
        timestamp created_at
    }
    
    PROFILE_STATS {
        uuid profile_id PK
        integer total_xp
        integer current_level
        integer xp_to_next
        integer today_xp
        integer current_streak
        integer best_streak
        integer freeze_tokens
    }
    
    XP_TRANSACTION ||--o| AUDIT_LOG : "generates audit"
    XP_TRANSACTION ||--|| PROFILE_STATS : "updates stats"
```

## Real-time Progress Updates

```mermaid
sequenceDiagram
    participant User as User Browser
    participant Frontend as React Frontend
    participant Query as TanStack Query
    participant Supabase as Supabase Client
    participant DB as PostgreSQL
    participant Realtime as Supabase Realtime
    
    User->>Frontend: Complete Activity
    Frontend->>Query: Mutation: completeQuest()
    Query->>Supabase: Insert XP transaction
    Supabase->>DB: CALL apply_xp()
    
    Note over DB: apply_xp() function:<br/>1. Calculate multipliers<br/>2. Insert transaction<br/>3. Update total XP<br/>4. Check level up<br/>5. Update streaks
    
    DB->>Realtime: Data change trigger
    Realtime->>Supabase: Broadcast update
    Supabase->>Query: Real-time event
    Query->>Query: Invalidate cached data
    Query->>Frontend: Trigger re-render
    Frontend->>User: Show updated progress
    
    Note over Frontend: UI Updates:<br/>• XP counter animation<br/>• Progress bar update<br/>• Level up celebration<br/>• Streak counter update
```

This comprehensive XP and gamification system creates a compelling loop of progression, achievement, and reward that keeps users engaged in their learning journey while providing clear feedback and motivation for continued growth. 