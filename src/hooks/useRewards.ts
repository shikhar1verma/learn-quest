import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useProfileStats } from "./useProfile";

export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('cost_xp');
      
      if (error) throw error;
      return data;
    },
  });
}

export function usePurchases() {
  const { data: profile } = useProfile();
  
  return useQuery({
    queryKey: ['purchases', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No profile');
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
}

export function usePurchaseReward() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: stats } = useProfileStats();
  
  return useMutation({
    mutationFn: async ({ rewardId, cost }: { rewardId: string; cost: number }) => {
      if (!profile?.id) throw new Error('No profile');
      if (!stats || stats.total_xp < cost) {
        throw new Error('Insufficient XP');
      }
      
      // Check cooldown
      const { data: recentPurchases } = await supabase
        .from('purchases')
        .select('created_at, reward:rewards(cooldown_days)')
        .eq('profile_id', profile.id)
        .eq('reward_id', rewardId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (recentPurchases && recentPurchases.length > 0) {
        const lastPurchase = new Date(recentPurchases[0].created_at);
        const cooldownDays = recentPurchases[0].reward?.cooldown_days || 0;
        const cooldownEnd = new Date(lastPurchase);
        cooldownEnd.setDate(cooldownEnd.getDate() + cooldownDays);
        
        if (new Date() < cooldownEnd) {
          throw new Error('Reward is still on cooldown');
        }
      }
      
      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          profile_id: profile.id,
          reward_id: rewardId,
          cost_xp: cost,
        })
        .select()
        .single();
      
      if (purchaseError) throw purchaseError;
      
      // Deduct XP by adding negative transaction
      const { error: xpError } = await supabase
        .from('xp_transactions')
        .insert({
          profile_id: profile.id,
          source: 'reward_adjust',
          source_id: purchase.id,
          base_xp: -cost,
          multiplier: 1.0,
          notes: `Purchased reward`,
        });
      
      if (xpError) throw xpError;
      
      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
      queryClient.invalidateQueries({ queryKey: ['xp-transactions'] });
    },
  });
}

export function useRedeemPurchase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ purchaseId, note }: { purchaseId: string; note?: string }) => {
      const { error } = await supabase
        .from('purchases')
        .update({
          redeemed_at: new Date().toISOString(),
          redemption_note: note,
        })
        .eq('id', purchaseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}