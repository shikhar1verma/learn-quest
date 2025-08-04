-- Create GrindQuest schema with tables, RLS policies, and seed data

-- Core tables
CREATE TABLE public.player_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  active_class UUID REFERENCES public.player_classes(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.player_classes(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tier INTEGER NOT NULL,
  parent_id UUID REFERENCES public.skills(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.player_classes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('primary', 'side', 'boss', 'weekly')),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  base_xp INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'paused', 'done')),
  due_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.quest_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  evidence_url TEXT,
  notes TEXT,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.xp_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('quest', 'event', 'reward_adjust', 'admin')),
  source_id UUID,
  base_xp INTEGER NOT NULL,
  multiplier NUMERIC NOT NULL DEFAULT 1.0,
  total_xp INTEGER GENERATED ALWAYS AS (CEIL(base_xp * multiplier)) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.streaks (
  profile_id UUID NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current INTEGER NOT NULL DEFAULT 0,
  best INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.freeze_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cost_xp INTEGER NOT NULL,
  cooldown_days INTEGER NOT NULL DEFAULT 0,
  prerequisite_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  cost_xp INTEGER NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redemption_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  rules_json JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_active_class ON public.profiles(active_class);
CREATE INDEX idx_skills_class_tier ON public.skills(class_id, tier);
CREATE INDEX idx_quests_class_type_status ON public.quests(class_id, type, status);
CREATE INDEX idx_events_profile_created ON public.events(profile_id, created_at DESC);
CREATE INDEX idx_xp_transactions_profile_created ON public.xp_transactions(profile_id, created_at DESC);
CREATE INDEX idx_quest_checklist_quest_id ON public.quest_checklist(quest_id);

-- Enable RLS
ALTER TABLE public.player_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freeze_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Player classes are globally readable
CREATE POLICY "Player classes are viewable by everyone" ON public.player_classes FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Skills are globally readable
CREATE POLICY "Skills are viewable by everyone" ON public.skills FOR SELECT USING (true);

-- Quests are globally readable
CREATE POLICY "Quests are viewable by everyone" ON public.quests FOR SELECT USING (true);

-- Quest checklist follows quest permissions
CREATE POLICY "Quest checklist viewable by everyone" ON public.quest_checklist FOR SELECT USING (true);
CREATE POLICY "Users can update quest checklist through their profile" ON public.quest_checklist 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Events policies
CREATE POLICY "Users can view their own events" ON public.events 
FOR SELECT USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert their own events" ON public.events 
FOR INSERT WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- XP transactions policies
CREATE POLICY "Users can view their own xp transactions" ON public.xp_transactions 
FOR SELECT USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert their own xp transactions" ON public.xp_transactions 
FOR INSERT WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Streaks policies
CREATE POLICY "Users can view their own streaks" ON public.streaks 
FOR SELECT USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert their own streaks" ON public.streaks 
FOR INSERT WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their own streaks" ON public.streaks 
FOR UPDATE USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Freeze tokens policies
CREATE POLICY "Users can view their own freeze tokens" ON public.freeze_tokens 
FOR SELECT USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert their own freeze tokens" ON public.freeze_tokens 
FOR INSERT WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Rewards are globally readable
CREATE POLICY "Rewards are viewable by everyone" ON public.rewards FOR SELECT USING (true);

-- Purchases policies
CREATE POLICY "Users can view their own purchases" ON public.purchases 
FOR SELECT USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert their own purchases" ON public.purchases 
FOR INSERT WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their own purchases" ON public.purchases 
FOR UPDATE USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Rules are globally readable
CREATE POLICY "Rules are viewable by everyone" ON public.rules FOR SELECT USING (true);

-- Trigger for updating profiles updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quests_updated_at
  BEFORE UPDATE ON public.quests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to apply XP
CREATE OR REPLACE FUNCTION public.apply_xp(
  p_profile_id UUID,
  p_source TEXT,
  p_source_id UUID,
  p_base_xp INTEGER,
  p_context JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_multiplier NUMERIC := 1.0;
  v_difficulty TEXT;
  v_class_aligned BOOLEAN := false;
  v_social_proof BOOLEAN := false;
  v_transaction_id UUID;
BEGIN
  -- Extract context
  v_difficulty := COALESCE(p_context->>'difficulty', 'easy');
  v_class_aligned := COALESCE((p_context->>'classAligned')::boolean, false);
  v_social_proof := COALESCE((p_context->>'socialProof')::boolean, false);
  
  -- Apply difficulty multiplier
  CASE v_difficulty
    WHEN 'medium' THEN v_multiplier := v_multiplier * 1.2;
    WHEN 'hard' THEN v_multiplier := v_multiplier * 1.5;
    ELSE v_multiplier := v_multiplier * 1.0;
  END CASE;
  
  -- Apply class alignment bonus
  IF v_class_aligned THEN
    v_multiplier := v_multiplier * 1.2;
  END IF;
  
  -- Apply social proof bonus
  IF v_social_proof THEN
    v_multiplier := v_multiplier * 1.1;
  END IF;
  
  -- Insert XP transaction
  INSERT INTO public.xp_transactions (profile_id, source, source_id, base_xp, multiplier, notes)
  VALUES (p_profile_id, p_source, p_source_id, p_base_xp, v_multiplier, p_context->>'notes')
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed data

-- Player classes
INSERT INTO public.player_classes (code, name, description) VALUES 
('ai_backend', 'AI-adjacent Backend Engineer', 'Build AI-powered backend systems, APIs, and data pipelines'),
('copywriter', 'Copywriter Strategist', 'Create compelling content and strategic messaging'),
('fintech', 'Finance/FinTech Builder', 'Develop financial technology solutions and products');

-- Get the AI backend class ID for seeding
DO $$
DECLARE
  ai_backend_id UUID;
BEGIN
  SELECT id INTO ai_backend_id FROM public.player_classes WHERE code = 'ai_backend';
  
  -- Skills for AI Backend (Tier 1)
  INSERT INTO public.skills (class_id, slug, name, description, tier) VALUES 
  (ai_backend_id, 'python_tooling', 'Python Tooling', 'Master Python development tools and best practices', 1),
  (ai_backend_id, 'git_workflows', 'Git Workflows', 'Version control and collaboration workflows', 1),
  (ai_backend_id, 'fastapi_basics', 'FastAPI Basics', 'Build REST APIs with FastAPI framework', 1),
  (ai_backend_id, 'docker', 'Docker', 'Containerization and deployment', 1),
  (ai_backend_id, 'postgres', 'PostgreSQL', 'Database design and optimization', 1);
  
  -- Skills for AI Backend (Tier 2)
  INSERT INTO public.skills (class_id, slug, name, description, tier) VALUES 
  (ai_backend_id, 'vector_dbs', 'Vector Databases', 'pgvector and vector similarity search', 2),
  (ai_backend_id, 'rag_retrieval', 'RAG & Retrieval', 'Retrieval-Augmented Generation systems', 2),
  (ai_backend_id, 'langchain', 'LangChain/LLM Clients', 'LLM integration and orchestration', 2),
  (ai_backend_id, 'embeddings', 'Embeddings', 'Text and document embeddings', 2);
  
  -- Skills for AI Backend (Tier 3)
  INSERT INTO public.skills (class_id, slug, name, description, tier) VALUES 
  (ai_backend_id, 'evaluation', 'Evaluation & Observability', 'LLM evaluation and monitoring', 3),
  (ai_backend_id, 'prompt_safety', 'Prompt Safety', 'Security and safety in prompt engineering', 3),
  (ai_backend_id, 'caching', 'Caching (Redis)', 'Performance optimization with caching', 3),
  (ai_backend_id, 'streaming', 'Streaming', 'Real-time data processing and streaming', 3);
  
  -- Primary quests
  INSERT INTO public.quests (class_id, type, title, description, difficulty, base_xp) VALUES 
  (ai_backend_id, 'primary', 'Build FastAPI RAG Microservice', 'Create a complete RAG service with FastAPI, embeddings, and vector search', 'hard', 120),
  (ai_backend_id, 'primary', 'Index Documents into pgvector', 'Set up document indexing pipeline with embeddings and pgvector storage', 'medium', 80),
  (ai_backend_id, 'primary', 'Implement LLM Evaluation Framework', 'Build automated evaluation system for LLM outputs with metrics', 'hard', 100),
  (ai_backend_id, 'primary', 'Deploy Production AI API', 'Deploy and monitor an AI-powered API in production environment', 'hard', 150);
  
  -- Side quests
  INSERT INTO public.quests (class_id, type, title, description, difficulty, base_xp) VALUES 
  (ai_backend_id, 'side', 'Write Technical Blog Post', 'Publish a technical article about AI backend development', 'medium', 50),
  (ai_backend_id, 'side', 'Optimize Database Queries', 'Improve database performance through query optimization', 'medium', 40),
  (ai_backend_id, 'side', 'Set up CI/CD Pipeline', 'Implement automated testing and deployment pipeline', 'medium', 60),
  (ai_backend_id, 'side', 'Add Caching Layer', 'Implement Redis caching for improved performance', 'easy', 30);
  
  -- Weekly quests
  INSERT INTO public.quests (class_id, type, title, description, difficulty, base_xp) VALUES 
  (ai_backend_id, 'weekly', 'Weekly Learning Sprint', 'Complete 3 tutorials or documentation deep-dives', 'easy', 40),
  (ai_backend_id, 'weekly', 'Code Review & Refactoring', 'Review and improve existing codebase quality', 'medium', 50);
  
  -- Add checklist items for some quests
  INSERT INTO public.quest_checklist (quest_id, label) 
  SELECT q.id, unnest(ARRAY[
    'Set up FastAPI project structure',
    'Implement document embedding pipeline',
    'Configure pgvector database',
    'Build search and retrieval endpoints',
    'Add proper error handling',
    'Write comprehensive tests'
  ])
  FROM public.quests q 
  WHERE q.title = 'Build FastAPI RAG Microservice';
  
  INSERT INTO public.quest_checklist (quest_id, label) 
  SELECT q.id, unnest(ARRAY[
    'Choose appropriate embedding model',
    'Process and chunk documents',
    'Generate embeddings for document chunks',
    'Store vectors in pgvector',
    'Implement similarity search',
    'Test retrieval accuracy'
  ])
  FROM public.quests q 
  WHERE q.title = 'Index Documents into pgvector';
  
END $$;

-- Rewards
INSERT INTO public.rewards (title, description, cost_xp, cooldown_days) VALUES 
('30-min Gaming Break', 'Take a guilt-free 30-minute gaming session', 40, 1),
('Favorite Food Treat', 'Order your favorite meal or snack', 70, 3),
('Tech Book Purchase', 'Buy that technical book youve been eyeing', 200, 14),
('Weekend Day Pass', 'Full day off from any learning commitments', 500, 30),
('New Dev Tool/App', 'Purchase a productivity tool or app subscription', 150, 7),
('Coffee Shop Work Session', 'Work from your favorite coffee shop', 60, 2);

-- Default rules
INSERT INTO public.rules (name, rules_json) VALUES 
('default', '{
  "baseXP": {
    "read_doc": 5,
    "implement_utility": 15,
    "complete_tutorial": 20,
    "ship_mvp_local": 35,
    "deploy_mvp": 50,
    "write_post": 15,
    "get_dm_lead": 40,
    "book_meeting": 60,
    "close_pilot": 120,
    "publish_demo": 20,
    "run_evaluation": 30,
    "fix_bug": 30
  },
  "multipliers": {
    "difficulty": {
      "easy": 1.0,
      "medium": 1.2,
      "hard": 1.5
    },
    "classAlignment": 1.2,
    "novelty": 1.1,
    "socialProof": 1.1
  },
  "levelCurve": {
    "base": 100,
    "increment": 50
  },
  "dailySoftCap": 120,
  "diminishingReturns": 0.3
}');

-- Function to calculate user level and XP stats
CREATE OR REPLACE FUNCTION public.get_profile_stats(p_profile_id UUID)
RETURNS TABLE(
  total_xp INTEGER,
  current_level INTEGER,
  xp_to_next_level INTEGER,
  xp_progress NUMERIC,
  today_xp INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  freeze_tokens INTEGER
) AS $$
DECLARE
  v_total_xp INTEGER := 0;
  v_today_xp INTEGER := 0;
  v_current_level INTEGER := 1;
  v_xp_to_next INTEGER;
  v_xp_progress NUMERIC := 0;
  v_streak_current INTEGER := 0;
  v_streak_best INTEGER := 0;
  v_freeze_count INTEGER := 0;
  v_level_base INTEGER := 100;
  v_level_increment INTEGER := 50;
BEGIN
  -- Get total XP
  SELECT COALESCE(SUM(total_xp), 0) INTO v_total_xp
  FROM public.xp_transactions 
  WHERE profile_id = p_profile_id;
  
  -- Get today's XP
  SELECT COALESCE(SUM(total_xp), 0) INTO v_today_xp
  FROM public.xp_transactions 
  WHERE profile_id = p_profile_id 
  AND created_at >= CURRENT_DATE;
  
  -- Calculate current level
  WHILE v_total_xp >= (v_level_base + v_level_increment * (v_current_level - 1)) LOOP
    v_current_level := v_current_level + 1;
  END LOOP;
  
  -- Calculate XP to next level
  v_xp_to_next := (v_level_base + v_level_increment * (v_current_level - 1)) - v_total_xp;
  
  -- Calculate progress percentage
  IF v_current_level > 1 THEN
    v_xp_progress := (v_total_xp - (v_level_base + v_level_increment * (v_current_level - 2))::NUMERIC) / 
                     (v_level_increment::NUMERIC) * 100;
  ELSE
    v_xp_progress := (v_total_xp::NUMERIC / v_level_base::NUMERIC) * 100;
  END IF;
  
  -- Get streak info
  SELECT COALESCE(s.current, 0), COALESCE(s.best, 0) INTO v_streak_current, v_streak_best
  FROM public.streaks s 
  WHERE s.profile_id = p_profile_id;
  
  -- Get freeze token count
  SELECT COUNT(*) INTO v_freeze_count
  FROM public.freeze_tokens 
  WHERE profile_id = p_profile_id AND redeemed_at IS NULL;
  
  RETURN QUERY SELECT 
    v_total_xp,
    v_current_level,
    GREATEST(v_xp_to_next, 0),
    LEAST(v_xp_progress, 100.0),
    v_today_xp,
    v_streak_current,
    v_streak_best,
    v_freeze_count::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;