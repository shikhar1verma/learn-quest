-- Create admins table
CREATE TABLE public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = uid
  );
$$;

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  before JSONB DEFAULT '{}',
  after JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Update rules table to have active flag if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rules' AND column_name = 'active') THEN
    ALTER TABLE public.rules ADD COLUMN active BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create quest_checklist table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quest_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on quest_checklist
ALTER TABLE public.quest_checklist ENABLE ROW LEVEL SECURITY;

-- Update rewards table structure if needed
DO $$
BEGIN
  -- Check if rewards table has the right structure
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'cooldown_days') THEN
    ALTER TABLE public.rewards ADD COLUMN cooldown_days INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'prerequisite_json') THEN
    ALTER TABLE public.rewards ADD COLUMN prerequisite_json JSONB DEFAULT '{}';
  END IF;
END $$;

-- Update purchases table if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'redemption_note') THEN
    ALTER TABLE public.purchases ADD COLUMN redemption_note TEXT;
  END IF;
END $$;

-- RLS Policies for admins table
CREATE POLICY "Admins can view admin list" ON public.admins
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage admin list" ON public.admins
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Update existing tables to allow admin access
CREATE POLICY "Admins can manage rules" ON public.rules
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage quests" ON public.quests
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage skills" ON public.skills
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage rewards" ON public.rewards
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage player classes" ON public.player_classes
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all xp transactions" ON public.xp_transactions
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all purchases" ON public.purchases
  FOR ALL USING (public.is_admin(auth.uid()));

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_entity TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_before JSONB DEFAULT '{}',
  p_after JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (actor, action, entity, entity_id, before, after)
  VALUES (auth.uid(), p_action, p_entity, p_entity_id, p_before, p_after)
  RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Function to simulate XP calculation
CREATE OR REPLACE FUNCTION public.simulate_xp(
  p_base_xp INTEGER,
  p_difficulty TEXT DEFAULT 'easy',
  p_class_aligned BOOLEAN DEFAULT false,
  p_social_proof BOOLEAN DEFAULT false,
  p_first_time BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_multiplier NUMERIC := 1.0;
  v_breakdown JSONB := '{}'::jsonb;
  v_total INTEGER;
BEGIN
  -- Base breakdown
  v_breakdown := jsonb_build_object('base', p_base_xp, 'difficulty', 1.0);
  
  -- Apply difficulty multiplier
  CASE p_difficulty
    WHEN 'medium' THEN 
      v_multiplier := v_multiplier * 1.2;
      v_breakdown := jsonb_set(v_breakdown, '{difficulty}', '1.2');
    WHEN 'hard' THEN 
      v_multiplier := v_multiplier * 1.5;
      v_breakdown := jsonb_set(v_breakdown, '{difficulty}', '1.5');
  END CASE;
  
  -- Apply class alignment bonus
  IF p_class_aligned THEN
    v_multiplier := v_multiplier * 1.2;
    v_breakdown := jsonb_set(v_breakdown, '{classAlignment}', '1.2');
  END IF;
  
  -- Apply social proof bonus
  IF p_social_proof THEN
    v_multiplier := v_multiplier * 1.1;
    v_breakdown := jsonb_set(v_breakdown, '{socialProof}', '1.1');
  END IF;
  
  -- Apply first time bonus
  IF p_first_time THEN
    v_multiplier := v_multiplier * 1.1;
    v_breakdown := jsonb_set(v_breakdown, '{novelty}', '1.1');
  END IF;
  
  v_total := CEIL(p_base_xp * v_multiplier);
  
  RETURN jsonb_build_object(
    'total', v_total,
    'multiplier', v_multiplier,
    'breakdown', v_breakdown
  );
END;
$$;

-- Fix the ambiguous total_xp issue in get_profile_stats function
CREATE OR REPLACE FUNCTION public.get_profile_stats(p_profile_id uuid)
RETURNS TABLE(total_xp integer, current_level integer, xp_to_next_level integer, xp_progress numeric, today_xp integer, current_streak integer, longest_streak integer, freeze_tokens integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
  -- Get total XP (using qualified column name)
  SELECT COALESCE(SUM(xt.total_xp), 0) INTO v_total_xp
  FROM public.xp_transactions xt
  WHERE xt.profile_id = p_profile_id;
  
  -- Get today's XP (using qualified column name)
  SELECT COALESCE(SUM(xt.total_xp), 0) INTO v_today_xp
  FROM public.xp_transactions xt
  WHERE xt.profile_id = p_profile_id 
  AND xt.created_at >= CURRENT_DATE;
  
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
$$;