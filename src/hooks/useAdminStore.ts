import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AdminReward {
  id: string;
  title: string;
  description?: string;
  cost_xp: number;
  cooldown_days: number;
  prerequisite_json: any;
  created_at: string;
}

export function useAdminRewards() {
  return useQuery({
    queryKey: ['admin-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('cost_xp', { ascending: true });
      
      if (error) throw error;
      return data as AdminReward[];
    }
  });
}

export function useCreateReward() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reward: {
      title: string;
      description?: string;
      cost_xp: number;
      cooldown_days?: number;
      prerequisite_json?: any;
    }) => {
      const rewardData = {
        ...reward,
        cooldown_days: reward.cooldown_days || 0,
        prerequisite_json: reward.prerequisite_json || {}
      };
      
      const { data, error } = await supabase
        .from('rewards')
        .insert(rewardData)
        .select()
        .single();
      
      if (error) throw error;
      
      await supabase.rpc('log_audit', {
        p_action: 'create',
        p_entity: 'reward',
        p_entity_id: data.id,
        p_after: data
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      toast({
        title: "Reward created",
        description: "New reward has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create reward.",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateReward() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<AdminReward>) => {
      // Get current data for audit
      const { data: current } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await supabase.rpc('log_audit', {
        p_action: 'update',
        p_entity: 'reward',
        p_entity_id: id,
        p_before: current,
        p_after: data
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      toast({
        title: "Reward updated",
        description: "Reward has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reward.",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteReward() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get current data for audit
      const { data: current } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', id)
        .single();
      
      const { error } = await supabase.from('rewards').delete().eq('id', id);
      if (error) throw error;
      
      await supabase.rpc('log_audit', {
        p_action: 'delete',
        p_entity: 'reward',
        p_entity_id: id,
        p_before: current
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      toast({
        title: "Reward deleted",
        description: "Reward has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete reward.",
        variant: "destructive"
      });
    }
  });
} 