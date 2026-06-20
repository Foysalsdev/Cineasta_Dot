import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const PROJ = 'project:projects(title, code, client:clients(name, company))';

export interface PurchaseOrder {
  id: string;
  po_number: string;
  project_id: string;
  quotation_id: string | null;
  total_amount: number;
  advance_amount: number;
  advance_received: boolean;
  advance_received_date: string | null;
  final_amount: number;
  final_received: boolean;
  final_received_date: string | null;
  status: string;
  created_at: string;
  project?: { title: string; code: string; client: { name: string; company: string | null } | null } | null;
}

export interface Payment {
  id: string;
  project_id: string;
  invoice_id: string | null;
  amount: number;
  payment_date: string;
  method: string | null;
  notes: string | null;
  created_at: string;
  project?: { title: string; code: string } | null;
}

export interface Expense {
  id: string;
  project_id: string | null;
  scope: string;
  category: string;
  amount: number;
  note: string | null;
  spent_at: string;
  approval_status: string;
  created_at: string;
  project?: { title: string; code: string } | null;
}

const today = () => new Date().toISOString().slice(0, 10);

/* ---------------- Purchase Orders ---------------- */
export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchase_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders').select(`*, ${PROJ}`).order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PurchaseOrder[];
    },
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, total, advancePct }: { projectId: string; total: number; advancePct: number }) => {
      const advance = Math.round((total * advancePct) / 100);
      const final = total - advance;
      const { error } = await supabase.from('purchase_orders').insert({
        project_id: projectId, total_amount: total, advance_amount: advance, final_amount: final,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase_orders'] }),
  });
}

export function useTogglePOReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, part, value }: { id: string; part: 'advance' | 'final'; value: boolean }) => {
      const patch: Record<string, any> =
        part === 'advance'
          ? { advance_received: value, advance_received_date: value ? today() : null }
          : { final_received: value, final_received_date: value ? today() : null };
      const { error } = await supabase.from('purchase_orders').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase_orders'] }),
  });
}

export function useSetPOStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase_orders'] }),
  });
}

/* ---------------- Payments ---------------- */
export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments').select('*, project:projects(title, code)').order('payment_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Payment[];
    },
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { projectId: string; amount: number; date: string; method: string; notes: string }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase.from('payments').insert({
        project_id: p.projectId, amount: p.amount, payment_date: p.date || today(),
        method: p.method || null, notes: p.notes || null, created_by: userRes.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });
}

/* ---------------- Expenses ---------------- */
export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses').select('*, project:projects(title, code)').order('spent_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Expense[];
    },
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: { scope: 'project' | 'agency'; projectId: string | null; category: string; amount: number; note: string; date: string }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase.from('expenses').insert({
        scope: e.scope, project_id: e.scope === 'project' ? e.projectId : null,
        category: e.category, amount: e.amount, note: e.note || null,
        spent_at: e.date || today(), spent_by: userRes.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useSetExpenseApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('expenses').update({ approval_status: status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
