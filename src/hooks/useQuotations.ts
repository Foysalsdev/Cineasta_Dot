import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { QUOTATION_CATEGORIES } from '../lib/quotationCategories';
import { BUDGET_DETAIL_TEMPLATE } from '../lib/budgetTemplate';

export interface Quotation {
  id: string;
  quotation_number: string;
  project_id: string;
  brand_title: string;
  film_format: string | null;
  shooting_days: number | null;
  quotation_date: string;
  valid_until: string | null;
  agency_name: string | null;
  product_name: string | null;
  film_title: string | null;
  master_film_duration: string | null;
  shooting_city: string | null;
  number_of_shifts: number | null;
  language: string;
  status: string;
  vat_applicable: boolean;
  terms_template_id: string | null;
  total_amount: number;
  created_at: string;
}

export interface QuotationLineItem {
  id: string;
  quotation_id: string;
  category: string;
  job_description: string | null;
  amount: number;
  sort_order: number;
}

export interface BudgetDetail {
  id: string;
  quotation_id: string;
  category: string;
  job_description: string;
  day: number | null;
  unit_cost: number | null;
  amount: number;
  sort_order: number;
}

export interface QuotationRow extends Quotation {
  project: {
    title: string;
    code: string;
    client: { name: string; company: string | null } | null;
  } | null;
}

const LIST_SELECT = '*, project:projects(title, code, client:clients(name, company))';

export function useQuotations() {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select(LIST_SELECT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as QuotationRow[];
    },
  });
}

export function useQuotation(id?: string) {
  return useQuery({
    queryKey: ['quotation', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data: quotation, error: e1 } = await supabase
        .from('quotations').select(LIST_SELECT).eq('id', id!).single();
      if (e1) throw e1;

      const { data: items, error: e2 } = await supabase
        .from('quotation_line_items').select('*').eq('quotation_id', id!)
        .order('sort_order', { ascending: true });
      if (e2) throw e2;

      const { data: details, error: e3 } = await supabase
        .from('budget_details').select('*').eq('quotation_id', id!)
        .order('sort_order', { ascending: true });
      if (e3) throw e3;

      let terms = '';
      if ((quotation as any).terms_template_id) {
        const { data: t } = await supabase
          .from('terms_templates').select('content')
          .eq('id', (quotation as any).terms_template_id).single();
        terms = t?.content ?? '';
      }

      return {
        quotation: quotation as unknown as QuotationRow,
        items: (items ?? []) as QuotationLineItem[],
        details: (details ?? []) as BudgetDetail[],
        terms,
      };
    },
  });
}

async function seedDetailRows(quotationId: string) {
  const rows = BUDGET_DETAIL_TEMPLATE.map((r, i) => ({
    quotation_id: quotationId,
    category: r.category,
    job_description: r.job,
    day: null,
    unit_cost: null,
    amount: 0,
    sort_order: i,
  }));
  await supabase.from('budget_details').insert(rows);
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, brandTitle }: { projectId: string; brandTitle: string }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { data: terms } = await supabase
        .from('terms_templates').select('id').eq('is_active', true)
        .order('version', { ascending: false }).limit(1).maybeSingle();

      const { data: q, error } = await supabase
        .from('quotations')
        .insert({ project_id: projectId, brand_title: brandTitle, terms_template_id: terms?.id ?? null, created_by: userRes.user?.id })
        .select('id').single();
      if (error) throw error;

      const summaryRows = QUOTATION_CATEGORIES.map((category, i) => ({
        quotation_id: q.id, category, amount: 0, sort_order: i,
      }));
      const { error: e2 } = await supabase.from('quotation_line_items').insert(summaryRows);
      if (e2) throw e2;

      await seedDetailRows(q.id);
      return q.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useSeedDetailsIfEmpty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quotationId: string) => {
      const { count } = await supabase
        .from('budget_details').select('id', { count: 'exact', head: true })
        .eq('quotation_id', quotationId);
      if (!count) await seedDetailRows(quotationId);
    },
    onSuccess: (_d, quotationId) => qc.invalidateQueries({ queryKey: ['quotation', quotationId] }),
  });
}

export function useSaveQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, header, amounts,
    }: { id: string; header: Partial<Quotation>; amounts: { id: string; amount: number }[] }) => {
      const total = amounts.reduce((s, a) => s + (Number(a.amount) || 0), 0);
      const { error } = await supabase
        .from('quotations')
        .update({ ...header, total_amount: total, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      for (const a of amounts) {
        const { error: e } = await supabase
          .from('quotation_line_items').update({ amount: Number(a.amount) || 0 }).eq('id', a.id);
        if (e) throw e;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      qc.invalidateQueries({ queryKey: ['quotation', vars.id] });
    },
  });
}

export function useSaveQuotationHeader() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, header }: { id: string; header: Partial<Quotation> }) => {
      const { error } = await supabase
        .from('quotations').update({ ...header, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['quotation', vars.id] }),
  });
}

export function useSaveBudgetDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quotationId, rows,
    }: {
      quotationId: string;
      rows: { id: string; category: string; day: number | null; unit_cost: number | null; amount: number }[];
    }) => {
      for (const r of rows) {
        const { error } = await supabase
          .from('budget_details')
          .update({ day: r.day, unit_cost: r.unit_cost, amount: Number(r.amount) || 0 })
          .eq('id', r.id);
        if (error) throw error;
      }

      const subtotals: Record<string, number> = {};
      for (const c of QUOTATION_CATEGORIES) subtotals[c] = 0;
      for (const r of rows) subtotals[r.category] = (subtotals[r.category] ?? 0) + (Number(r.amount) || 0);

      for (const c of QUOTATION_CATEGORIES) {
        const { error } = await supabase
          .from('quotation_line_items')
          .update({ amount: subtotals[c] ?? 0 })
          .eq('quotation_id', quotationId)
          .eq('category', c);
        if (error) throw error;
      }

      const grand = Object.values(subtotals).reduce((s, v) => s + v, 0);
      const { error: eT } = await supabase
        .from('quotations')
        .update({ total_amount: grand, updated_at: new Date().toISOString() })
        .eq('id', quotationId);
      if (eT) throw eT;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['quotation', vars.quotationId] });
      qc.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}

export function useDeleteQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('budget_details').delete().eq('quotation_id', id);
      await supabase.from('quotation_line_items').delete().eq('quotation_id', id);
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}
