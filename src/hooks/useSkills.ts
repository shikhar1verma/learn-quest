import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export function useSkills() {
  const { data: profile } = useProfile();
  const activeClassId = profile?.active_class;
  
  return useQuery({
    queryKey: ['skills', activeClassId],
    queryFn: async () => {
      if (!activeClassId) throw new Error('No class ID');
      
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('class_id', activeClassId)
        .order('tier', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Group skills by tier
      const skillsByTier = data.reduce((acc, skill) => {
        const tier = skill.tier;
        if (!acc[tier]) acc[tier] = [];
        acc[tier].push(skill);
        return acc;
      }, {} as Record<number, typeof data>);
      
      return skillsByTier;
    },
    enabled: !!activeClassId,
  });
}

export function useAnalytics() {
  const { data: profile } = useProfile();
  
  return useQuery({
    queryKey: ['analytics', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No profile');
      
      // Get XP over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: xpData, error: xpError } = await supabase
        .from('xp_transactions')
        .select('total_xp, created_at, source')
        .eq('profile_id', profile.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');
      
      if (xpError) throw xpError;
      
      // Get quest completions by type
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .select('type')
        .eq('status', 'done');
      
      if (questError) throw questError;
      
      // Process data for charts
      const xpOverTime = xpData.reduce((acc, transaction) => {
        const date = new Date(transaction.created_at).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = 0;
        acc[date] += transaction.total_xp;
        return acc;
      }, {} as Record<string, number>);
      
      const questsByType = questData.reduce((acc, quest) => {
        if (!acc[quest.type]) acc[quest.type] = 0;
        acc[quest.type]++;
        return acc;
      }, {} as Record<string, number>);
      
      const xpBySource = xpData.reduce((acc, transaction) => {
        if (!acc[transaction.source]) acc[transaction.source] = 0;
        acc[transaction.source] += transaction.total_xp;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        xpOverTime,
        questsByType,
        xpBySource,
        recentTransactions: xpData.slice(-10),
      };
    },
    enabled: !!profile?.id,
  });
}