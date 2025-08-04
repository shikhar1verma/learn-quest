import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RuleSet {
  id: string;
  name: string;
  active: boolean;
  rules_json: any;
  updated_at: string;
}

export function useRulesets() {
  return useQuery({
    queryKey: ['admin-rulesets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as RuleSet[];
    }
  });
}

export function useCreateRuleset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ruleset: { name: string; rules_json: any }) => {
      const { data, error } = await supabase
        .from('rules')
        .insert(ruleset)
        .select()
        .single();
      
      if (error) throw error;
      
      await supabase.rpc('log_audit', {
        p_action: 'create',
        p_entity: 'ruleset',
        p_entity_id: data.id,
        p_after: data
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rulesets'] });
      toast({
        title: "Ruleset created",
        description: "New ruleset has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create ruleset.",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateRuleset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<RuleSet>) => {
      // Get current data for audit
      const { data: current } = await supabase
        .from('rules')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await supabase.rpc('log_audit', {
        p_action: 'update',
        p_entity: 'ruleset',
        p_entity_id: id,
        p_before: current,
        p_after: data
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rulesets'] });
      toast({
        title: "Ruleset updated",
        description: "Ruleset has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ruleset.",
        variant: "destructive"
      });
    }
  });
}

export function useActivateRuleset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Deactivate all rulesets first
      await supabase.from('rules').update({ active: false }).neq('id', '');
      
      // Activate the selected one
      const { data, error } = await supabase
        .from('rules')
        .update({ active: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await supabase.rpc('log_audit', {
        p_action: 'activate',
        p_entity: 'ruleset',
        p_entity_id: id
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rulesets'] });
      toast({
        title: "Ruleset activated",
        description: "Ruleset is now active and will be used for XP calculations."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate ruleset.",
        variant: "destructive"
      });
    }
  });
}

export function useSimulateXP() {
  return useMutation({
    mutationFn: async (params: {
      base_xp: number;
      difficulty: string;
      class_aligned: boolean;
      social_proof: boolean;
      first_time: boolean;
    }) => {
      const { data, error } = await supabase.rpc('simulate_xp', {
        p_base_xp: params.base_xp,
        p_difficulty: params.difficulty,
        p_class_aligned: params.class_aligned,
        p_social_proof: params.social_proof,
        p_first_time: params.first_time
      });
      
      if (error) throw error;
      return data;
    }
  });
}