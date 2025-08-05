# GrindQuest - Gamified AI Learning Platform

GrindQuest transforms AI-adjacent learning and GenAI work into an engaging, game-like experience. Track your progress, complete quests, earn XP, level up, and unlock rewards as you build expertise across different skill domains.

## 🚀 Features

### Core Gameplay Loop
- **Player Classes**: Switch between different learning personas (Copywriter Strategist, Finance/FinTech Builder, Backend/Full-Stack Engineer)
- **XP System**: Earn experience points for completing tasks, with smart multipliers and progression tracking
- **Quest System**: Primary quests, side quests, boss fights, and weekly contracts
- **Skills & Progression**: Structured skill trees with milestones and evidence tracking
- **Streak System**: Maintain daily learning streaks with freeze tokens for flexibility
- **Store & Rewards**: Spend earned XP on real-world rewards and treats
- **Random Encounters**: Surprise challenges for variety and engagement

### Technical Features
- **Real-time Progress Tracking**: Visual progress bars, level indicators, and XP counters
- **Admin Rules Editor**: JSON-driven economy configuration without code changes
- **Analytics Dashboard**: Track learning patterns, productivity, and progress over time
- **Responsive Design**: Beautiful, gaming-inspired UI that works on all devices
- **Database-Driven**: Supabase backend with structured data models for scalability

## 🎮 Pages & Functionality

### Dashboard
- Active class switcher with real-time stats
- Level progression and XP to next level
- Today's XP earnings and streak counter
- Recent activity feed
- Weekly contracts progress
- Next reward preview
- Quick action buttons for starting missions

### Quests
- Tabbed interface for different quest types
- Detailed quest cards with progress tracking
- Checklist management and completion flow
- Difficulty indicators and XP rewards
- Status management (Start, Pause, Complete)
- Evidence collection for high-value activities

### Skills (Coming Soon)
- Visual skill trees per player class
- Milestone tracking with evidence URLs
- Prerequisite management
- Progress visualization

### Events (Coming Soon)
- Custom activity logging
- Smart XP calculation with suggested values
- Evidence attachment
- Tag-based categorization

### Store (Coming Soon)
- Reward catalog with XP costs
- Purchase history and redemption tracking
- Cooldown management
- Prerequisite checking

### Analytics (Coming Soon)
- XP over time charts
- Productivity heatmaps
- Quest completion analytics
- Streak history visualization

### Admin Panel (Coming Soon)
- Rules editor for XP calculations
- Multiplier configuration
- Reward management
- Level curve adjustments

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with custom gaming theme
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd grindquest
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema
Run the database migration in your Supabase SQL Editor:
```sql
-- Copy and paste the contents of supabase/migrations/001_create_grindquest_schema.sql
```

### 4. Seed Data (Optional)
The app includes mock data for development. For production, you can add seed data through the Supabase dashboard or create a seed script.

### 5. Start Development
```bash
npm run dev
```

Visit `http://localhost:8080` to see your GrindQuest installation!

## 🎯 XP System Rules

### Base XP Values (Configurable via Admin)
- Read/skim core documentation: 5 XP
- Implement coded utility/helper: 15 XP
- Complete tutorial with repository: 20 XP
- Ship micro-MVP (local): 35 XP
- Deploy MVP (public): 50 XP
- Write distribution post/thread: 15 XP
- Get qualified lead from post: 40 XP
- Book discovery meeting: 60 XP
- Close paid pilot project: 120 XP

### Multipliers
- **Class Alignment**: +20% for activities matching active class skills
- **Novelty Bonus**: +10% for first-time tag combinations (30-day window)
- **Difficulty**: Easy ×1.0, Medium ×1.2, Hard ×1.5
- **Social Proof**: +10% for activities with public artifacts

### Level Progression
- Level N requires: 100 + 50×(N-1) total XP
- Visual progress bars show advancement
- Level-up achievements unlock new rewards

### Streak System
- Daily XP earning maintains streaks
- Freeze tokens protect against missed days
- Weekly 7-day streaks award freeze tokens (max 3)
- Grace period: 200+ XP in prior 2 days = one weekly save

## 🎨 Design System

GrindQuest uses a custom gaming-inspired design system with:

- **Dark Fantasy Theme**: Deep purples, gold accents, and mystical gradients
- **Quest Type Colors**: Primary (purple), Side (blue), Boss (red), Weekly (gold)
- **XP Visualization**: Green gradients for experience and progress
- **Responsive Layout**: Mobile-first design with collapsible sidebar
- **Smooth Animations**: Smooth transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader support

### Custom Tailwind Tokens
All colors and styles are defined in the design system using HSL color space:
- `--primary`: Epic purple for main brand elements
- `--xp`: Green for experience points and progress
- `--quest-*`: Specialized colors for different quest types
- `--gradient-*`: Multiple gradient combinations for visual interest

## 📖 Documentation

For complete architecture diagrams, technical specifications, and developer guides, see the comprehensive documentation:

**👉 [Complete Documentation →](./docs/README.md)**

### Documentation Contents:
- **[Database Schema](./docs/database-schema.md)** - Complete database design and relationships
- **[Application Architecture](./docs/application-architecture.md)** - Technical stack and component structure  
- **[User Journey Flows](./docs/user-journey-flows.md)** - How users interact with the system
- **[XP & Gamification System](./docs/xp-gamification-system.md)** - Detailed gamification mechanics
- **[Quick Reference](./docs/quick-reference.md)** - Essential information at a glance

## 🚀 Deployment

### Quick Deploy with Lovable
1. Click the "Publish" button in your Lovable editor
2. Your app will be live instantly with a generated URL

### Custom Domain (Lovable Pro)
1. Go to Project Settings > Domains
2. Connect your custom domain
3. DNS will be configured automatically

### Self-Hosted Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🔧 Configuration

### Environment Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Customizing Rules
All XP calculations, level curves, and reward configurations are stored in the database and can be modified through the Admin panel (coming soon) or directly in Supabase.

## 🗺️ Roadmap

### Phase 1 - MVP (Current)
- ✅ Core XP system and level progression
- ✅ Dashboard with activity tracking
- ✅ Quest management system
- ✅ Player class switching
- ✅ Beautiful gaming UI

### Phase 2 - Core Features
- 🔄 Skills system with visual progression trees
- 🔄 Custom event logging
- 🔄 Store and reward redemption
- 🔄 Admin rules editor
- 🔄 Weekly contracts automation

### Phase 3 - Analytics & Polish
- 📋 Comprehensive analytics dashboard
- 📋 Achievement system
- 📋 Random encounter system
- 📋 Mobile app optimization
- 📋 Advanced notification system

### Phase 4 - Social Features
- 📋 Party mode (leaderboards)
- 📋 Invite system
- 📋 Achievement sharing
- 📋 Multi-user support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Start Your Quest!

Ready to turn your learning journey into an epic adventure? Fire up GrindQuest and start earning those XP points! 

*"Small XP stacks beat big intentions."* 🚀