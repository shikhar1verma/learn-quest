# GrindQuest User Journey Flows

This document illustrates the complete user experience flows within GrindQuest, from initial signup to advanced progression tracking.

## Complete User Journey Overview

```mermaid
flowchart TD
    Start([User Visits GrindQuest]) --> Auth{Authenticated?}
    
    %% Authentication Flow
    Auth -->|No| Login[Login/Register Page]
    Login --> SignUp[Sign Up Form]
    Login --> SignIn[Sign In Form]
    SignUp --> EmailVerify[Email Verification]
    EmailVerify --> ProfileSetup[Auto Profile Creation]
    SignIn --> Dashboard
    ProfileSetup --> Dashboard
    
    %% Main Application Flow
    Auth -->|Yes| Dashboard[Dashboard Overview]
    Dashboard --> ClassSelect[Select Player Class]
    Dashboard --> ViewProgress[View Progress Stats]
    Dashboard --> QuickActions[Quick Action Buttons]
    
    %% Core Features Access
    QuickActions --> Quests[Quest Management]
    QuickActions --> Skills[Skills Tracking]
    QuickActions --> Events[Custom Events]
    QuickActions --> Store[XP Store]
    QuickActions --> Analytics[Analytics Dashboard]
    
    %% Quest Flow
    Quests --> BrowseQuests[Browse Available Quests]
    BrowseQuests --> StartQuest[Start New Quest]
    BrowseQuests --> ContinueQuest[Continue Active Quest]
    StartQuest --> QuestDetails[Quest Details & Checklist]
    ContinueQuest --> QuestDetails
    QuestDetails --> CompleteChecklist[Complete Checklist Items]
    CompleteChecklist --> SubmitEvidence[Submit Evidence URL]
    SubmitEvidence --> EarnXP[Earn XP Rewards]
    
    %% Skills Flow
    Skills --> ViewSkillTree[View Skill Trees by Class]
    ViewSkillTree --> MarkMilestone[Mark Skill Milestone]
    MarkMilestone --> ProvideEvidence[Provide Evidence & Notes]
    ProvideEvidence --> EarnXP
    
    %% Events Flow
    Events --> LogActivity[Log Custom Activity]
    LogActivity --> SetDifficulty[Set Difficulty Level]
    SetDifficulty --> AddTags[Add Tags & Evidence]
    AddTags --> EarnXP
    
    %% Store Flow
    Store --> BrowseRewards[Browse Available Rewards]
    BrowseRewards --> CheckPrereqs[Check Prerequisites]
    CheckPrereqs --> PurchaseReward[Purchase with XP]
    PurchaseReward --> RedeemReward[Redeem Reward]
    
    %% Progression Loop
    EarnXP --> UpdateStats[Update Profile Stats]
    UpdateStats --> LevelUp{Level Up?}
    LevelUp -->|Yes| Celebrate[Level Up Celebration]
    LevelUp -->|No| Dashboard
    Celebrate --> UnlockFeatures[Unlock New Features]
    UnlockFeatures --> Dashboard
    
    %% Analytics Flow
    Analytics --> ViewCharts[View Progress Charts]
    ViewCharts --> TrackHabits[Track Learning Habits]
    TrackHabits --> Dashboard
```

## Authentication & Onboarding Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant Auth as Supabase Auth
    participant DB as Database
    participant Email as Email Service
    
    %% Sign Up Flow
    U->>UI: Visit signup page
    UI->>U: Show signup form
    U->>UI: Enter email & password
    UI->>Auth: signUp(email, password)
    Auth->>Email: Send verification email
    Auth->>UI: Signup response
    UI->>U: "Check your email" message
    
    %% Email Verification
    U->>Email: Click verification link
    Email->>Auth: Verify email
    Auth->>DB: Mark email as verified
    
    %% Auto Profile Creation
    Auth->>UI: User signed in event
    UI->>DB: Check if profile exists
    DB->>UI: Profile not found
    UI->>DB: Get default player class
    UI->>DB: Create profile with default class
    UI->>DB: Initialize streak record
    UI->>U: Redirect to dashboard
    
    %% Sign In Flow
    U->>UI: Enter login credentials
    UI->>Auth: signInWithPassword()
    Auth->>DB: Authenticate user
    DB->>Auth: User data
    Auth->>UI: User session
    UI->>U: Redirect to dashboard
```

## Quest Completion Flow

```mermaid
flowchart TD
    Start([User Opens Quests Page]) --> LoadQuests[Load Quests by Class]
    LoadQuests --> DisplayQuests[Display Quest Cards by Type]
    
    subgraph QuestTypes["Quest Types"]
        Primary[Primary Quests]
        Side[Side Quests] 
        Boss[Boss Fights]
        Weekly[Weekly Contracts]
    end
    
    DisplayQuests --> QuestTypes
    QuestTypes --> SelectQuest[User Selects Quest]
    SelectQuest --> QuestDetail[Quest Detail Modal]
    
    %% Quest Status Check
    QuestDetail --> StatusCheck{Quest Status?}
    StatusCheck -->|Planned| StartQuest[Start Quest]
    StatusCheck -->|Active| ContinueQuest[Continue Quest]
    StatusCheck -->|Paused| ResumeQuest[Resume Quest]
    
    StartQuest --> UpdateStatus[Update Status to Active]
    ContinueQuest --> ShowChecklist[Show Checklist Items]
    ResumeQuest --> ShowChecklist
    UpdateStatus --> ShowChecklist
    
    %% Checklist Management
    ShowChecklist --> CheckItem[Check Off Items]
    CheckItem --> AllDone{All Items Done?}
    AllDone -->|No| ShowChecklist
    AllDone -->|Yes| CompleteQuest[Complete Quest Form]
    
    %% Quest Completion
    CompleteQuest --> EvidenceForm[Evidence URL Form]
    EvidenceForm --> SubmitEvidence[Submit Evidence & Notes]
    SubmitEvidence --> CalculateXP[Calculate XP with Multipliers]
    
    %% XP Calculation
    CalculateXP --> BaseXP[Base XP from Quest]
    BaseXP --> DifficultyMultiplier[Apply Difficulty Multiplier]
    DifficultyMultiplier --> ClassBonus[Apply Class Alignment Bonus]
    ClassBonus --> SocialProof[Apply Social Proof Bonus]
    SocialProof --> FinalXP[Final XP Amount]
    
    %% Award XP
    FinalXP --> AwardXP[Award XP to User]
    AwardXP --> UpdateProfile[Update Profile Stats]
    UpdateProfile --> CheckLevel{Level Up?}
    CheckLevel -->|Yes| LevelUpReward[Show Level Up Animation]
    CheckLevel -->|No| ShowSuccess[Show Success Toast]
    LevelUpReward --> ShowSuccess
    ShowSuccess --> UpdateUI[Refresh Quest List]
    UpdateUI --> End([End])
```

## XP and Progression System Flow

```mermaid
flowchart TD
    Action([User Completes Action]) --> ActionType{Action Type}
    
    %% Different Action Sources
    ActionType -->|Quest| QuestXP[Quest Base XP]
    ActionType -->|Event| EventXP[Event Base XP]
    ActionType -->|Skill| SkillXP[Skill Milestone XP]
    
    %% XP Calculation Process
    QuestXP --> ApplyRules[Apply XP Rules Engine]
    EventXP --> ApplyRules
    SkillXP --> ApplyRules
    
    ApplyRules --> DifficultyCheck[Check Difficulty Level]
    DifficultyCheck --> Easy[Easy: 1.0x]
    DifficultyCheck --> Medium[Medium: 1.2x]
    DifficultyCheck --> Hard[Hard: 1.5x]
    
    Easy --> ClassCheck{Class Aligned?}
    Medium --> ClassCheck
    Hard --> ClassCheck
    
    ClassCheck -->|Yes| ClassBonus[+20% Class Bonus]
    ClassCheck -->|No| NoClassBonus[No Class Bonus]
    
    ClassBonus --> NoveltyCheck{First Time Combo?}
    NoClassBonus --> NoveltyCheck
    
    NoveltyCheck -->|Yes| NoveltyBonus[+10% Novelty Bonus]
    NoveltyCheck -->|No| NoNoveltyBonus[No Novelty Bonus]
    
    NoveltyBonus --> ProofCheck{Has Evidence?}
    NoNoveltyBonus --> ProofCheck
    
    ProofCheck -->|Yes| ProofBonus[+10% Social Proof Bonus]
    ProofCheck -->|No| NoProofBonus[No Proof Bonus]
    
    ProofBonus --> FinalCalculation[Calculate Final XP]
    NoProofBonus --> FinalCalculation
    
    %% Apply XP and Update Systems
    FinalCalculation --> CreateTransaction[Create XP Transaction]
    CreateTransaction --> UpdateTotalXP[Update Total XP]
    UpdateTotalXP --> CheckLevelUp{Level Threshold Reached?}
    
    CheckLevelUp -->|Yes| LevelUp[Increment Level]
    CheckLevelUp -->|No| UpdateProgress[Update Progress Bar]
    
    LevelUp --> UnlockCheck[Check Unlocked Features]
    UnlockCheck --> UpdateProgress
    UpdateProgress --> StreakCheck[Update Daily Streak]
    StreakCheck --> NotifyUser[Notify User of Progress]
    NotifyUser --> End([End])
```

## Skills Progression Flow

```mermaid
flowchart TD
    Start([User Opens Skills Page]) --> LoadSkills[Load Skills for Active Class]
    LoadSkills --> GroupByTier[Group Skills by Tier]
    GroupByTier --> DisplayTiers[Display Tier Cards]
    
    %% Skill Tree Structure
    DisplayTiers --> Tier1[Tier 1: Foundation]
    DisplayTiers --> Tier2[Tier 2: Intermediate]  
    DisplayTiers --> Tier3[Tier 3: Advanced]
    
    Tier1 --> SkillCard[Skill Card Display]
    Tier2 --> SkillCard
    Tier3 --> SkillCard
    
    %% Skill Interaction
    SkillCard --> ViewProgress[View Skill Progress]
    ViewProgress --> MilestoneAction[Mark Milestone Button]
    MilestoneAction --> MilestoneForm[Milestone Form Modal]
    
    %% Milestone Completion
    MilestoneForm --> EvidenceURL[Evidence URL Field]
    MilestoneForm --> NotesField[Achievement Notes Field]
    EvidenceURL --> ValidateForm[Validate Form Data]
    NotesField --> ValidateForm
    
    ValidateForm --> CreateEvent[Create Skill Event]
    CreateEvent --> TagEvent[Tag with Skill & Milestone]
    TagEvent --> SetDifficulty[Set to Medium Difficulty]
    SetDifficulty --> TriggerXP[Trigger XP Calculation]
    
    %% XP and Progress
    TriggerXP --> ClassAligned[Apply Class Alignment Bonus]
    ClassAligned --> CalculateXP[Calculate Final XP]
    CalculateXP --> AwardXP[Award XP to User]
    AwardXP --> UpdateSkillProgress[Update Skill Progress]
    UpdateSkillProgress --> CheckPrereqs[Check Prerequisite Skills]
    CheckPrereqs --> UnlockNext[Unlock Next Tier Skills]
    UnlockNext --> ShowSuccess[Show Success Message]
    ShowSuccess --> RefreshView[Refresh Skills View]
    RefreshView --> End([End])
```

## Store & Rewards Flow

```mermaid
flowchart TD
    Start([User Opens Store Page]) --> LoadRewards[Load Available Rewards]
    LoadRewards --> CheckXP[Get User's Current XP]
    CheckXP --> DisplayCards[Display Reward Cards]
    
    %% Reward Card States
    DisplayCards --> Affordable{Can Afford?}
    Affordable -->|Yes| AvailableCard[Available - Green Border]
    Affordable -->|No| ExpensiveCard[Too Expensive - Red Border]
    
    %% Prerequisite Checking
    AvailableCard --> PrereqCheck{Meets Prerequisites?}
    ExpensiveCard --> ShowPrice[Show Required XP]
    
    PrereqCheck -->|Yes| ReadyToBuy[Ready to Purchase]
    PrereqCheck -->|No| MissingPrereqs[Show Missing Requirements]
    
    %% Purchase Flow
    ReadyToBuy --> ClickPurchase[User Clicks Purchase]
    ClickPurchase --> ConfirmDialog[Purchase Confirmation Dialog]
    ConfirmDialog --> ConfirmPurchase[User Confirms]
    ConfirmPurchase --> DeductXP[Deduct XP from Balance]
    DeductXP --> CreatePurchase[Create Purchase Record]
    CreatePurchase --> CooldownCheck{Has Cooldown?}
    
    CooldownCheck -->|Yes| SetCooldown[Set Cooldown Period]
    CooldownCheck -->|No| Available[Immediately Available]
    
    SetCooldown --> NotifyPurchase[Show Purchase Success]
    Available --> NotifyPurchase
    NotifyPurchase --> UpdateBalance[Update XP Balance Display]
    UpdateBalance --> RefreshStore[Refresh Store Items]
    
    %% Redemption Flow
    RefreshStore --> RedemptionCheck{Ready to Redeem?}
    RedemptionCheck -->|Yes| RedeemButton[Show Redeem Button]
    RedemptionCheck -->|No| WaitCooldown[Show Cooldown Timer]
    
    RedeemButton --> RedeemAction[User Redeems Reward]
    RedeemAction --> UpdateRecord[Mark as Redeemed]
    UpdateRecord --> ShowInstructions[Show Redemption Instructions]
    ShowInstructions --> End([End])
```

## Admin Management Flow

```mermaid
flowchart TD
    Start([Admin Opens Admin Panel]) --> AdminCheck{Is Admin User?}
    AdminCheck -->|No| AccessDenied[Access Denied - Redirect]
    AdminCheck -->|Yes| AdminDashboard[Admin Dashboard]
    
    AdminDashboard --> Overview[Overview Stats]
    AdminDashboard --> ManageUsers[User Management]
    AdminDashboard --> ManageQuests[Quest Management]
    AdminDashboard --> ManageSkills[Skills Management]
    AdminDashboard --> ManageStore[Store Management]
    AdminDashboard --> ManageRules[Rules Configuration]
    AdminDashboard --> AuditLogs[Audit Logs]
    
    %% Quest Management Flow
    ManageQuests --> CreateQuest[Create New Quest]
    ManageQuests --> EditQuest[Edit Existing Quest]
    ManageQuests --> DeleteQuest[Delete Quest]
    
    CreateQuest --> QuestForm[Quest Creation Form]
    QuestForm --> SetBasicInfo[Title, Description, Type]
    SetBasicInfo --> SetDifficulty[Difficulty & XP Rewards]
    SetDifficulty --> AddChecklist[Add Checklist Items]
    AddChecklist --> SaveQuest[Save Quest]
    SaveQuest --> AuditLog[Log Admin Action]
    
    %% Skills Management Flow
    ManageSkills --> CreateSkill[Create New Skill]
    ManageSkills --> EditSkill[Edit Existing Skill]
    ManageSkills --> DeleteSkill[Delete Skill]
    
    CreateSkill --> SkillForm[Skill Creation Form]
    SkillForm --> SetSkillInfo[Name, Description, Slug]
    SetSkillInfo --> SetTier[Set Skill Tier]
    SetTier --> SetParent[Set Parent Skill]
    SetParent --> SaveSkill[Save Skill]
    SaveSkill --> AuditLog
    
    %% Store Management Flow
    ManageStore --> CreateReward[Create New Reward]
    ManageStore --> EditReward[Edit Existing Reward]
    ManageStore --> DeleteReward[Delete Reward]
    
    CreateReward --> RewardForm[Reward Creation Form]
    RewardForm --> SetRewardInfo[Title, Description, Cost]
    SetRewardInfo --> SetCooldown[Set Cooldown Period]
    SetCooldown --> SetPrerequisites[Set Prerequisites JSON]
    SetPrerequisites --> SaveReward[Save Reward]
    SaveReward --> AuditLog
    
    %% Audit and Completion
    AuditLog --> RefreshData[Refresh Admin Data]
    RefreshData --> ShowSuccess[Show Success Message]
    ShowSuccess --> AdminDashboard
    AccessDenied --> End([End])
```

These user journey flows provide a comprehensive understanding of how users interact with GrindQuest at every level, from basic navigation to advanced progression mechanics and administrative functions. 