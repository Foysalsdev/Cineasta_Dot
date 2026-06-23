import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Invoice {
  id: string; invoice_number: string; invoice_date: string; due_date: string | null;
  subtotal: number; vat_pct: number; vat_amount: number; total_amount: number; status: string;
}
export interface ProjectDoc { id: string; name: string; file_url: string | null; doc_type: string; created_at: string; }
export interface Communication { id: string; comm_date: string; source: string; details: string | null; created_at: string; }

/* ---- Invoices ---- */
export function useProjectInvoices(projectId?: string) {
  return useQuery({
    queryKey: ['project_invoices', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('invoices')
        .select('id, invoice_number, invoice_date, due_date, subtotal, vat_pct, vat_amount, total_amount, status')
        .eq('project_id', projectId!).order('invoice_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Invoice[];
    },
  });
}
export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (i: { project_id: string; invoice_date: string; due_date: string | null; subtotal: number; vat_pct: number }) => {
      const vat_amount = Math.round((i.subtotal * i.vat_pct) / 100);
      const total_amount = i.subtotal + vat_amount;
      const { error } = await supabase.from('invoices').insert({
        project_id: i.project_id, invoice_date: i.invoice_date, due_date: i.due_date,
        subtotal: i.subtotal, vat_pct: i.vat_pct, vat_amount, total_amount, status: 'sent',
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['project_invoices', v.project_id] }); qc.invalidateQueries({ queryKey: ['project_financials'] }); },
  });
}
export function useSetInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string; projectId: string }) => {
      const { error } = await supabase.from('invoices').update({ status }).eq('id', id); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['project_invoices', v.projectId] }),
  });
}
export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      await supabase.from('invoice_items').delete().eq('invoice_id', id);
      const { error } = await supabase.from('invoices').delete().eq('id', id); if (error) throw error;
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['project_invoices', v.projectId] }); qc.invalidateQueries({ queryKey: ['project_financials'] }); },
  });
}

/* ---- Documents ---- */
export function useProjectDocs(projectId?: string) {
  return useQuery({
    queryKey: ['project_docs', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('documents').select('id, name, file_url, doc_type, created_at')
        .eq('project_id', projectId!).order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectDoc[];
    },
  });
}
export function useSaveDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: { project_id: string; name: string; file_url: string | null; doc_type: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from('documents').insert({ ...d, uploaded_by: u.user?.id }); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['project_docs', v.project_id] }),
  });
}
export function useDeleteDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('documents').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['project_docs', v.projectId] }),
  });
}

/* ---- Communications / Notes ---- */
export function useCommunications(projectId?: string) {
  return useQuery({
    queryKey: ['communications', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('communications').select('id, comm_date, source, details, created_at')
        .eq('project_id', projectId!).order('comm_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Communication[];
    },
  });
}
export function useSaveCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: { project_id: string; comm_date: string; source: string; details: string | null }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from('communications').insert({ ...c, created_by: u.user?.id }); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['communications', v.project_id] }),
  });
}
export function useDeleteCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('communications').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['communications', v.projectId] }),
  });
}
