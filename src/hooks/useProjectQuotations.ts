import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface ProjectQuotation {
  id: string;
  quotation_number: string;
  version: number;
  is_current: boolean;
  status: string;
  total_amount: number;
  brand_title: string;
  created_at: string;
}

export function useProjectQuotations(projectId?: string) {
  return useQuery({
    queryKey: ['project_quotations', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('id, quotation_number, version, is_current, status, total_amount, brand_title, created_at')
        .eq('project_id', projectId!)
        .order('version', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectQuotation[];
    },
  });
}

// Duplicate the current quotation into a new version (history preserved).
export function useReviseQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ currentId, projectId }: { currentId: string; projectId: string }) => {
      const { data: cur, error: e0 } = await supabase.from('quotations').select('*').eq('id', currentId).single();
      if (e0) throw e0;
      const { data: items } = await supabase.from('quotation_line_items').select('category, job_description, amount, sort_order').eq('quotation_id', currentId);
      const { data: details } = await supabase.from('budget_details').select('category, job_description, day, unit_cost, amount, sort_order').eq('quotation_id', currentId);

      const { data: u } = await supabase.auth.getUser();
      // mark all existing not current
      await supabase.from('quotations').update({ is_current: false }).eq('project_id', projectId);

      const { data: q, error } = await supabase.from('quotations').insert({
        project_id: projectId,
        brand_title: cur.brand_title,
        film_format: cur.film_format,
        shooting_days: cur.shooting_days,
        quotation_date: new Date().toISOString().slice(0, 10),
        agency_name: cur.agency_name,
        product_name: cur.product_name,
        film_title: cur.film_title,
        master_film_duration: cur.master_film_duration,
        shooting_city: cur.shooting_city,
        number_of_shifts: cur.number_of_shifts,
        language: cur.language,
        vat_applicable: cur.vat_applicable,
        terms_template_id: cur.terms_template_id,
        total_amount: cur.total_amount,
        version: (cur.version ?? 1) + 1,
        is_current: true,
        revised_from: currentId,
        status: 'draft',
        created_by: u.user?.id,
      }).select('id').single();
      if (error) throw error;

      if (items?.length) await supabase.from('quotation_line_items').insert(items.map((i: any) => ({ ...i, quotation_id: q.id })));
      if (details?.length) await supabase.from('budget_details').insert(details.map((d: any) => ({ ...d, quotation_id: q.id })));

      return q.id as string;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['project_quotations', v.projectId] });
      qc.invalidateQueries({ queryKey: ['project_financials'] });
    },
  });
}
