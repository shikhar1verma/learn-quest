import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entity_id?: string;
  before: any;
  after: any;
  created_at: string;
}

export function useAuditLogs(filters?: {
  entity?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['admin-audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (filters?.entity) {
        query = query.eq('entity', filters.entity);
      }
      
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AuditLog[];
    }
  });
}