import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface ProjectFinancials {
  project_id: string;
  budget: number;
  invoiced: number;
  collected: number;
  expense_total: number;
  last_payment_date: string | null;
  revenue: number;
  gross_profit: number;
  outstanding: number;
  budget_variance: number;
}

const EMPTY: Omit<ProjectFinancials, 'project_id'> = {
  budget: 0, invoiced: 0, collected: 0, expense_total: 0,
  last_payment_date: null, revenue: 0, gross_profit: 0, outstanding: 0, budget_variance: 0,
};

// All projects' financials as a map keyed by project_id.
export function useProjectFinancials() {
  return useQuery({
    queryKey: ['project_financials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_financials').select('*');
      if (error) throw error;
      const map: Record<string, ProjectFinancials> = {};
      (data ?? []).forEach((r: any) => { map[r.project_id] = r as ProjectFinancials; });
      return map;
    },
  });
}

// One project's financials (falls back to zeros while loading / if absent).
export function useProjectFinancial(projectId?: string) {
  return useQuery({
    queryKey: ['project_financials', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('project_financials').select('*').eq('project_id', projectId!).maybeSingle();
      if (error) throw error;
      return (data as ProjectFinancials) ?? { project_id: projectId!, ...EMPTY };
    },
  });
}
