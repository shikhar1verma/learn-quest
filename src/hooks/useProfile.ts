import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          active_class_data:active_class(*)
        `)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useProfileStats() {
  const { data: profile } = useProfile();
  
  return useQuery({
    queryKey: ['profile-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No profile');
      
      const { data, error } = await supabase
        .rpc('get_profile_stats', { p_profile_id: profile.id });
      
      if (error) throw error;
      return data[0];
    },
    enabled: !!profile?.id,
  });
}

export function useUpdateActiveClass() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (classId: string) => {
      if (!user) throw new Error('No user');
      
      const { error } = await supabase
        .from('profiles')
        .update({ active_class: classId })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function usePlayerClasses() {
  return useQuery({
    queryKey: ['player-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_classes')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      return data;
    },
  });
}