import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AdminSkill {
  id: string;
  name: string;
  description?: string;
  slug: string;
  tier: number;
  class_id: string;
  parent_id?: string;
  created_at: string;
  player_class?: {
    id: string;
    name: string;
    code: string;
  };
  parent_skill?: {
    id: string;
    name: string;
  };
}

export function useAdminSkills() {
  return useQuery({
    queryKey: ['admin-skills'],
    queryFn: async () => {
      // Get all skills with basic info
      const { data: skills, error } = await supabase
        .from('skills')
        .select('*')
        .order('tier', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      if (!skills) return [];

      // Get all player classes
      const { data: playerClasses } = await supabase
        .from('player_classes')
        .select('id, name, code');

      // Map skills with class information
      const enrichedSkills = skills.map(skill => ({
        ...skill,
        player_class: playerClasses?.find(pc => pc.id === skill.class_id),
        parent_skill: skill.parent_id ? skills.find(s => s.id === skill.parent_id) : undefined
      }));
      
      return enrichedSkills as AdminSkill[];
    }
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skill: {
      name: string;
      description?: string;
      slug: string;
      tier: number;
      class_id: string;
      parent_id?: string;
    }) => {
      // Clean the data before insertion
      const cleanSkill = {
        name: skill.name.trim(),
        description: skill.description?.trim() || null,
        slug: skill.slug.trim(),
        tier: skill.tier,
        class_id: skill.class_id,
        parent_id: skill.parent_id && skill.parent_id.length > 0 ? skill.parent_id : null
      };



      const { data, error } = await supabase
        .from('skills')
        .insert(cleanSkill)
        .select()
        .single();
      
      if (error) {
        console.error('Skill creation error:', error);
        throw error;
      }
      
      // Log audit (but don't fail if it fails)
      try {
        await supabase.rpc('log_audit', {
          p_action: 'create',
          p_entity: 'skill',
          p_entity_id: data.id,
          p_after: data
        });
      } catch (auditError) {
        console.warn('Audit logging failed:', auditError);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      toast({
        title: "Skill created",
        description: "New skill has been created successfully."
      });
    },
    onError: (error: any) => {
      console.error('Create skill mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create skill.",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<AdminSkill>) => {
      // Clean the update data
      const cleanUpdates = {
        ...updates,
        name: typeof updates.name === 'string' ? updates.name.trim() : updates.name,
        description: typeof updates.description === 'string' ? (updates.description.trim() || null) : updates.description,
        slug: typeof updates.slug === 'string' ? updates.slug.trim() : updates.slug,
        parent_id: updates.parent_id && updates.parent_id.length > 0 ? updates.parent_id : null
      };

      // Remove undefined values
      Object.keys(cleanUpdates).forEach(key => {
        if (cleanUpdates[key as keyof typeof cleanUpdates] === undefined) {
          delete cleanUpdates[key as keyof typeof cleanUpdates];
        }
      });



      // Get current data for audit
      const { data: current } = await supabase
        .from('skills')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('skills')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Skill update error:', error);
        throw error;
      }
      
      // Log audit (but don't fail if it fails)
      try {
        await supabase.rpc('log_audit', {
          p_action: 'update',
          p_entity: 'skill',
          p_entity_id: id,
          p_before: current,
          p_after: data
        });
      } catch (auditError) {
        console.warn('Audit logging failed:', auditError);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      toast({
        title: "Skill updated",
        description: "Skill has been updated successfully."
      });
    },
    onError: (error: any) => {
      console.error('Update skill mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update skill.",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get current data for audit
      const { data: current } = await supabase
        .from('skills')
        .select('*')
        .eq('id', id)
        .single();
      
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
      
      await supabase.rpc('log_audit', {
        p_action: 'delete',
        p_entity: 'skill',
        p_entity_id: id,
        p_before: current
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      toast({
        title: "Skill deleted",
        description: "Skill has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete skill.",
        variant: "destructive"
      });
    }
  });
} 