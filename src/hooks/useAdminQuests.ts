import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AdminQuest {
  id: string;
  title: string;
  description?: string;
  type: string;
  difficulty: string;
  base_xp: number;
  status: string;
  due_at?: string;
  class_id: string;
  created_at: string;
  updated_at: string;
  quest_checklist?: Array<{
    id: string;
    label: string;
    sort_order: number;
    is_done: boolean;
  }>;
}

export function useAdminQuests() {
  return useQuery({
    queryKey: ['admin-quests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quests')
        .select(`
          *,
          quest_checklist (
            id,
            label,
            sort_order,
            is_done
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminQuest[];
    }
  });
}

export function useCreateQuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quest: {
      title: string;
      description?: string;
      type: string;
      difficulty: string;
      base_xp: number;
      class_id: string;
      due_at?: string;
      checklist?: Array<{ label: string; sort_order: number }>;
    }) => {
      const { checklist, ...questData } = quest;
      
      const { data, error } = await supabase
        .from('quests')
        .insert(questData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add checklist items if provided
      if (checklist && checklist.length > 0) {
        const checklistItems = checklist.map(item => ({
          quest_id: data.id,
          label: item.label,
          sort_order: item.sort_order
        }));
        
        await supabase.from('quest_checklist').insert(checklistItems);
      }
      
      await supabase.rpc('log_audit', {
        p_action: 'create',
        p_entity: 'quest',
        p_entity_id: data.id,
        p_after: data
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quests'] });
      toast({
        title: "Quest created",
        description: "New quest has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quest.",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateQuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, checklist, ...updates }: { id: string; checklist?: Array<{ id?: string; label: string; sort_order: number; is_done?: boolean }> } & Partial<AdminQuest>) => {
      // Get current data for audit
      const { data: current } = await supabase
        .from('quests')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('quests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update checklist if provided
      if (checklist) {
        // Delete existing checklist items
        await supabase.from('quest_checklist').delete().eq('quest_id', id);
        
        // Insert new checklist items
        if (checklist.length > 0) {
          const checklistItems = checklist.map(item => ({
            quest_id: id,
            label: item.label,
            sort_order: item.sort_order,
            is_done: item.is_done || false
          }));
          
          await supabase.from('quest_checklist').insert(checklistItems);
        }
      }
      
      await supabase.rpc('log_audit', {
        p_action: 'update',
        p_entity: 'quest',
        p_entity_id: id,
        p_before: current,
        p_after: data
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quests'] });
      toast({
        title: "Quest updated",
        description: "Quest has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quest.",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteQuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get current data for audit
      const { data: current } = await supabase
        .from('quests')
        .select('*')
        .eq('id', id)
        .single();
      
      const { error } = await supabase.from('quests').delete().eq('id', id);
      if (error) throw error;
      
      await supabase.rpc('log_audit', {
        p_action: 'delete',
        p_entity: 'quest',
        p_entity_id: id,
        p_before: current
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quests'] });
      toast({
        title: "Quest deleted",
        description: "Quest has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quest.",
        variant: "destructive"
      });
    }
  });
}