import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Deliverable { id: string; project_id: string; deliverable_type: string; version_label: string | null; file_url: string | null; status: string; delivered_date: string | null; }
export interface BroadcastRight { id: string; project_id: string; delivery_date: string; expiry_date: string | null; renewal_fee_pct: number; is_ovc_used_for_tv: boolean; status: string; last_renewed_date: string | null; }

export const DELIVERABLE_TYPES = ['Master', 'TVC', 'OVC', 'AV', 'Cut-down', 'Teaser', 'BTS', 'Reel', 'Other'];
export const DELIVERABLE_STATUS = [
  { key: 'pending', label: 'Pending', color: '#6B7280' },
  { key: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { key: 'review', label: 'Review', color: '#F59E0B' },
  { key: 'delivered', label: 'Delivered', color: '#2ECC71' },
];
export const delivMeta = (s: string) => DELIVERABLE_STATUS.find((x) => x.key === s) ?? DELIVERABLE_STATUS[0];

/* ---- Deliverables ---- */
export function useDeliverables(projectId?: string) {
  return useQuery({
    queryKey: ['deliverables', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('deliverables').select('*').eq('project_id', projectId!).order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Deliverable[];
    },
  });
}
export function useSaveDeliverable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: { id?: string; project_id: string; deliverable_type: string; version_label: string | null; file_url: string | null; status: string; delivered_date: string | null }) => {
      if (d.id) { const { id, ...rest } = d; const { error } = await supabase.from('deliverables').update(rest).eq('id', id); if (error) throw error; }
      else { const { error } = await supabase.from('deliverables').insert(d); if (error) throw error; }
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['deliverables', v.project_id] }),
  });
}
export function useSetDeliverableStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string; projectId: string }) => {
      const patch: any = { status };
      if (status === 'delivered') patch.delivered_date = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from('deliverables').update(patch).eq('id', id); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['deliverables', v.projectId] }),
  });
}
export function useDeleteDeliverable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('deliverables').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['deliverables', v.projectId] }),
  });
}

/* ---- Broadcast rights ---- */
export function useBroadcastRights(projectId?: string) {
  return useQuery({
    queryKey: ['broadcast_rights', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('broadcast_rights').select('*').eq('project_id', projectId!).order('delivery_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as BroadcastRight[];
    },
  });
}
export function useSaveBroadcastRight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: { project_id: string; delivery_date: string; renewal_fee_pct: number; is_ovc_used_for_tv: boolean }) => {
      const { error } = await supabase.from('broadcast_rights').insert(b); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['broadcast_rights', v.project_id] }),
  });
}
export function useRenewRight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('broadcast_rights').update({ last_renewed_date: new Date().toISOString().slice(0, 10), status: 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['broadcast_rights', v.projectId] }),
  });
}
export function useDeleteRight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('broadcast_rights').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['broadcast_rights', v.projectId] }),
  });
}
