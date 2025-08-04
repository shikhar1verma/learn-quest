import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { DEFAULT_BASE_XP } from "@/lib/xp/engine";

export function useEvents() {
  const { data: profile } = useProfile();
  
  return useQuery({
    queryKey: ['events', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No profile');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  
  return useMutation({
    mutationFn: async (eventData: {
      title: string;
      tags: string[];
      evidenceUrl?: string;
      notes?: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }) => {
      if (!profile?.id) throw new Error('No profile');
      
      // Create the event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          profile_id: profile.id,
          title: eventData.title,
          tags: eventData.tags,
          evidence_url: eventData.evidenceUrl,
          notes: eventData.notes,
          difficulty: eventData.difficulty,
        })
        .select()
        .single();
      
      if (eventError) throw eventError;
      
      // Calculate base XP based on tags or use default
      let baseXP = 15; // Default
      if (eventData.tags.includes('tutorial')) baseXP = DEFAULT_BASE_XP.complete_tutorial;
      else if (eventData.tags.includes('deploy')) baseXP = DEFAULT_BASE_XP.deploy_mvp;
      else if (eventData.tags.includes('post')) baseXP = DEFAULT_BASE_XP.write_post;
      else if (eventData.tags.includes('bug')) baseXP = DEFAULT_BASE_XP.fix_bug;
      
      // Check for novelty (first time tag combination in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentEvents } = await supabase
        .from('events')
        .select('tags')
        .eq('profile_id', profile.id)
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      const isNovelCombo = !recentEvents?.some(e => 
        e.tags.length === eventData.tags.length && 
        e.tags.every(tag => eventData.tags.includes(tag))
      );
      
      // Award XP
      const context = {
        difficulty: eventData.difficulty,
        classAligned: true, // Custom events are considered class-aligned
        socialProof: !!eventData.evidenceUrl,
        novelty: isNovelCombo,
        notes: eventData.notes,
      };
      
      const { error: xpError } = await supabase
        .rpc('apply_xp', {
          p_profile_id: profile.id,
          p_source: 'event',
          p_source_id: event.id,
          p_base_xp: baseXP,
          p_context: context,
        });
      
      if (xpError) throw xpError;
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
      queryClient.invalidateQueries({ queryKey: ['xp-transactions'] });
    },
  });
}

export function useXPTransactions() {
  const { data: profile } = useProfile();
  
  return useQuery({
    queryKey: ['xp-transactions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No profile');
      
      const { data, error } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
}