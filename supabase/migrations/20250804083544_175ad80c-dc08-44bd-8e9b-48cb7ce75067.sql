-- Fix security warnings: add search_path to functions

DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.apply_xp(UUID, TEXT, UUID, INTEGER, JSONB);
DROP FUNCTION IF EXISTS public.get_profile_stats(UUID);

-- Recreate functions with proper search_path security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quests_updated_at
  BEFORE UPDATE ON public.quests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to apply XP with proper search_path
CREATE OR REPLACE FUNCTION public.apply_xp(
  p_profile_id UUID,
  p_source TEXT,
  p_source_id UUID,
  p_base_xp INTEGER,
  p_context JSONB DEFAULT '{}'::jsonb
) 
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Function to calculate user level and XP stats with proper search_path
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
) 
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
$$;