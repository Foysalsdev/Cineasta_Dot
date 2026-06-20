import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { QUOTATION_CATEGORIES } from '../lib/quotationCategories';

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

export interface QuotationRow extends Quotation {
  project: {
    title: string;
    code: string;
    client: { name: string; company: string | null } | null;
  } | null;
}

const LIST_SELECT =
  '*, project:projects(title, code, client:clients(name, company))';

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
        .from('quotations')
        .select(LIST_SELECT)
        .eq('id', id!)
        .single();
      if (e1) throw e1;

      const { data: items, error: e2 } = await supabase
        .from('quotation_line_items')
        .select('*')
        .eq('quotation_id', id!)
        .order('sort_order', { ascending: true });
      if (e2) throw e2;

      let terms = '';
      if ((quotation as any).terms_template_id) {
        const { data: t } = await supabase
          .from('terms_templates')
          .select('content')
          .eq('id', (quotation as any).terms_template_id)
          .single();
        terms = t?.content ?? '';
      }

      return {
        quotation: quotation as unknown as QuotationRow,
        items: (items ?? []) as QuotationLineItem[],
        terms,
      };
    },
  });
}

// Create a quotation for a project and seed the 14 fixed category rows.
export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, brandTitle }: { projectId: string; brandTitle: string }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { data: terms } = await supabase
        .from('terms_templates')
        .select('id')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: q, error } = await supabase
        .from('quotations')
        .insert({
          project_id: projectId,
          brand_title: brandTitle,
          terms_template_id: terms?.id ?? null,
          created_by: userRes.user?.id,
        })
        .select('id')
        .single();
      if (error) throw error;

      const rows = QUOTATION_CATEGORIES.map((category, i) => ({
        quotation_id: q.id,
        category,
        amount: 0,
        sort_order: i,
      }));
      const { error: e2 } = await supabase.from('quotation_line_items').insert(rows);
      if (e2) throw e2;

      return q.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

// Save header fields + line-item amounts + recomputed total in one go.
export function useSaveQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      header,
      amounts,
    }: {
      id: string;
      header: Partial<Quotation>;
      amounts: { id: string; amount: number }[];
    }) => {
      const total = amounts.reduce((s, a) => s + (Number(a.amount) || 0), 0);

      const { error } = await supabase
        .from('quotations')
        .update({ ...header, total_amount: total, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      for (const a of amounts) {
        const { error: e } = await supabase
          .from('quotation_line_items')
          .update({ amount: Number(a.amount) || 0 })
          .eq('id', a.id);
        if (e) throw e;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      qc.invalidateQueries({ queryKey: ['quotation', vars.id] });
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
