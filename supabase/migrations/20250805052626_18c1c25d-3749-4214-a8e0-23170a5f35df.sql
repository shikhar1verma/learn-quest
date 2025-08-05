-- Add missing RPC functions for admin stats
CREATE OR REPLACE FUNCTION public.get_total_xp_today()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(total_xp), 0)::INTEGER
  FROM public.xp_transactions
  WHERE created_at >= CURRENT_DATE;
$$;

CREATE OR REPLACE FUNCTION public.get_total_xp_week()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(total_xp), 0)::INTEGER
  FROM public.xp_transactions
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
$$;