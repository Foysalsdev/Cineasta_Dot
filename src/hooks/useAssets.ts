import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface DocItem { id: string; project_id: string | null; name: string; file_url: string | null; doc_type: string; created_at: string; }
export interface PropItem { id: string; project_id: string | null; item_name: string; category: string; quantity: number; status: string; notes: string | null; }
export interface EquipItem { id: string; project_id: string | null; equipment_name: string; quantity: number; checked_out_date: string | null; checked_in_date: string | null; status: string; notes: string | null; }

export const DOC_TYPES = ['script', 'storyboard', 'footage', 'reference', 'contract', 'other'];
export const PROP_CATEGORIES = ['prop', 'wardrobe', 'ornament', 'set', 'other'];
export const PROP_STATUS = [
  { key: 'in_stock', label: 'In Stock', color: '#6B7280' },
  { key: 'on_set', label: 'On Set', color: '#3B82F6' },
  { key: 'returned', label: 'Returned', color: '#2ECC71' },
  { key: 'lost', label: 'Lost/Damaged', color: '#EF4444' },
];
export const propMeta = (s: string) => PROP_STATUS.find((x) => x.key === s) ?? PROP_STATUS[0];

/* ---- Documents ---- */
export function useDocuments(projectId?: string) {
  return useQuery({
    queryKey: ['documents', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('documents').select('*').eq('project_id', projectId!).order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DocItem[];
    },
  });
}
export function useSaveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: { project_id: string; name: string; file_url: string | null; doc_type: string }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase.from('documents').insert({ ...d, uploaded_by: userRes.user?.id }); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['documents', v.project_id] }),
  });
}
export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('documents').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['documents', v.projectId] }),
  });
}

/* ---- Props & Wardrobe ---- */
export function useProps(projectId?: string) {
  return useQuery({
    queryKey: ['props', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('props_wardrobe').select('*').eq('project_id', projectId!).order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as PropItem[];
    },
  });
}
export function useSaveProp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { project_id: string; item_name: string; category: string; quantity: number; status: string; notes: string | null }) => {
      const { error } = await supabase.from('props_wardrobe').insert(p); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['props', v.project_id] }),
  });
}
export function useSetPropStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string; projectId: string }) => { const { error } = await supabase.from('props_wardrobe').update({ status }).eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['props', v.projectId] }),
  });
}
export function useDeleteProp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('props_wardrobe').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['props', v.projectId] }),
  });
}

/* ---- Equipment ---- */
export function useEquipment(projectId?: string) {
  return useQuery({
    queryKey: ['equipment', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment_log').select('*').eq('project_id', projectId!).order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as EquipItem[];
    },
  });
}
export function useSaveEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: { project_id: string; equipment_name: string; quantity: number; checked_out_date: string | null; notes: string | null }) => {
      const { error } = await supabase.from('equipment_log').insert({ ...e, status: 'checked_out' }); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['equipment', v.project_id] }),
  });
}
export function useCheckInEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('equipment_log').update({ status: 'checked_in', checked_in_date: new Date().toISOString().slice(0, 10) }).eq('id', id); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['equipment', v.projectId] }),
  });
}
export function useDeleteEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('equipment_log').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['equipment', v.projectId] }),
  });
}
