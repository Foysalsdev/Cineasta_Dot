import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface ProjectExpense {
  id: string;
  project_id: string;
  category: string;
  vendor: string | null;
  amount: number;
  note: string | null;
  spent_at: string;
  is_unplanned: boolean;
}
export interface ProjectPayment {
  id: string;
  project_id: string;
  amount: number;
  payment_date: string;
  method: string | null;
  notes: string | null;
}

const inval = (qc: ReturnType<typeof useQueryClient>, pid: string) => {
  qc.invalidateQueries({ queryKey: ['project_expenses', pid] });
  qc.invalidateQueries({ queryKey: ['project_payments', pid] });
  qc.invalidateQueries({ queryKey: ['project_financials'] });
};

/* ---- Categories (for the typeahead) ---- */
export function useExpenseCategoryNames() {
  return useQuery({
    queryKey: ['expense_category_names'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expense_categories').select('name').order('name');
      if (error) throw error;
      return (data ?? []).map((r: any) => r.name as string);
    },
  });
}

// Budget per category from the project's CURRENT quotation (for planned/unplanned + variance).
export function useCurrentQuotationBudget(projectId?: string) {
  return useQuery({
    queryKey: ['current_quotation_budget', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data: q } = await supabase
        .from('quotations').select('id').eq('project_id', projectId!).eq('is_current', true)
        .order('version', { ascending: false }).limit(1).maybeSingle();
      if (!q) return {} as Record<string, number>;
      const { data: items } = await supabase
        .from('quotation_line_items').select('category, amount').eq('quotation_id', q.id);
      const map: Record<string, number> = {};
      (items ?? []).forEach((it: any) => { map[it.category] = (map[it.category] ?? 0) + (Number(it.amount) || 0); });
      return map;
    },
  });
}

/* ---- Expenses (project) ---- */
export function useProjectExpenses(projectId?: string) {
  return useQuery({
    queryKey: ['project_expenses', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses').select('id, project_id, category, vendor, amount, note, spent_at, is_unplanned')
        .eq('project_id', projectId!).order('spent_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectExpense[];
    },
  });
}

export function useSaveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: { id?: string; project_id: string; category: string; vendor: string | null; amount: number; note: string | null; spent_at: string; is_unplanned: boolean }) => {
      const { data: u } = await supabase.auth.getUser();
      if (e.id) {
        const { id, ...rest } = e;
        const { error } = await supabase.from('expenses').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('expenses').insert({ ...e, scope: 'project', spent_by: u.user?.id });
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => inval(qc, v.project_id),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => inval(qc, v.projectId),
  });
}

/* ---- Payments (project) ---- */
export function useProjectPayments(projectId?: string) {
  return useQuery({
    queryKey: ['project_payments', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments').select('id, project_id, amount, payment_date, method, notes')
        .eq('project_id', projectId!).order('payment_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectPayment[];
    },
  });
}

export function useCreateProjectPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { project_id: string; amount: number; payment_date: string; method: string | null; notes: string | null }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from('payments').insert({ ...p, created_by: u.user?.id });
      if (error) throw error;
    },
    onSuccess: (_d, v) => inval(qc, v.project_id),
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => inval(qc, v.projectId),
  });
}

// Past vendors for the vendor typeahead.
export function useVendorNames() {
  return useQuery({
    queryKey: ['vendor_names'],
    queryFn: async () => {
      const { data } = await supabase.from('expenses').select('vendor').not('vendor', 'is', null);
      const set = new Set<string>();
      (data ?? []).forEach((r: any) => { if (r.vendor) set.add(r.vendor); });
      return Array.from(set).sort();
    },
  });
}
