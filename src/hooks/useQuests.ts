import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export function useQuests(classId?: string) {
  const { data: profile } = useProfile();
  const activeClassId = classId || profile?.active_class;
  
  return useQuery({
    queryKey: ['quests', activeClassId],
    queryFn: async () => {
      if (!activeClassId) throw new Error('No class ID');
      
      const { data, error } = await supabase
        .from('quests')
        .select(`
          *,
          quest_checklist(*)
        `)
        .eq('class_id', activeClassId)
        .order('created_at');
      
      if (error) throw error;
      return data;
    },
    enabled: !!activeClassId,
  });
}

export function useUpdateQuestStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ questId, status }: { questId: string; status: string }) => {
      const { error } = await supabase
        .from('quests')
        .update({ status })
        .eq('id', questId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, isDone }: { itemId: string; isDone: boolean }) => {
      const { error } = await supabase
        .from('quest_checklist')
        .update({ is_done: isDone })
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });
}

export function useCompleteQuest() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  
  return useMutation({
    mutationFn: async ({ questId, evidenceUrl, notes }: { 
      questId: string; 
      evidenceUrl?: string; 
      notes?: string; 
    }) => {
      if (!profile?.id) throw new Error('No profile');
      
      // Get quest details
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();
      
      if (questError) throw questError;
      
      // Update quest status to done
      const { error: updateError } = await supabase
        .from('quests')
        .update({ status: 'done' })
        .eq('id', questId);
      
      if (updateError) throw updateError;
      
      // Award XP using the apply_xp function
      const context = {
        difficulty: quest.difficulty,
        classAligned: true, // Quest completion is always class-aligned
        socialProof: !!evidenceUrl,
        notes,
      };
      
      const { error: xpError } = await supabase
        .rpc('apply_xp', {
          p_profile_id: profile.id,
          p_source: 'quest',
          p_source_id: questId,
          p_base_xp: quest.base_xp,
          p_context: context,
        });
      
      if (xpError) throw xpError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
      queryClient.invalidateQueries({ queryKey: ['xp-transactions'] });
    },
  });
}