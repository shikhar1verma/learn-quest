import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useIsAdmin() {
  return useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      return !!data;
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalQuests },
        { count: totalRewards },
        { data: activeRules },
        { data: todayXP },
        { data: weekXP }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('quests').select('*', { count: 'exact', head: true }),
        supabase.from('rewards').select('*', { count: 'exact', head: true }),
        supabase.from('rules').select('name').eq('active', true).single(),
        supabase.rpc('get_total_xp_today'),
        supabase.rpc('get_total_xp_week')
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalQuests: totalQuests || 0,
        totalRewards: totalRewards || 0,
        activeRuleset: activeRules?.name || 'None',
        todayXP: todayXP || 0,
        weekXP: weekXP || 0
      };
    },
    enabled: true
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          admins!left(user_id)
        `);
      
      if (error) throw error;
      return data.map(profile => ({
        ...profile,
        isAdmin: !!profile.admins?.user_id
      }));
    }
  });
}

export function useToggleAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      if (isAdmin) {
        const { error } = await supabase.from('admins').delete().eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('admins').insert({ user_id: userId });
        if (error) throw error;
      }
      
      await supabase.rpc('log_audit', {
        p_action: isAdmin ? 'revoke_admin' : 'grant_admin',
        p_entity: 'user',
        p_entity_id: userId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Admin status updated",
        description: "User admin privileges have been updated."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update admin status.",
        variant: "destructive"
      });
    }
  });
}