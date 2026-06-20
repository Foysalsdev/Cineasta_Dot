import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface LocationRow { id: string; name: string; city: string | null; location_type: string | null; address: string | null; contact_name: string | null; contact_phone: string | null; }
export interface ReccePlan { id: string; project_id: string; location_id: string | null; recce_date: string | null; notes: string | null; status: string; location?: { name: string } | null; }
export interface PPMMeeting { id: string; project_id: string; meeting_date: string | null; attendees: string | null; notes: string | null; status: string; }
export interface CallSheet { id: string; project_id: string; shoot_date: string; day_number: number; location_id: string | null; general_call_time: string | null; notes: string | null; location?: { name: string } | null; }
export interface CallSheetItem { id: string; call_sheet_id: string; role_or_name: string; call_time: string | null; sort_order: number; }

/* ---- Locations (shared) ---- */
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*').order('name');
      if (error) throw error;
      return (data ?? []) as LocationRow[];
    },
  });
}
export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (l: { name: string; city: string }) => {
      const { data, error } = await supabase.from('locations').insert({ name: l.name, city: l.city || null }).select('id').single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations'] }),
  });
}

/* ---- Recce ---- */
export function useRecce(projectId?: string) {
  return useQuery({
    queryKey: ['recce', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('recce_plans').select('*, location:locations(name)').eq('project_id', projectId!).order('recce_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ReccePlan[];
    },
  });
}
export function useSaveRecce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: { id?: string; project_id: string; location_id: string | null; recce_date: string | null; status: string; notes: string | null }) => {
      if (r.id) { const { id, ...rest } = r; const { error } = await supabase.from('recce_plans').update(rest).eq('id', id); if (error) throw error; }
      else { const { error } = await supabase.from('recce_plans').insert(r); if (error) throw error; }
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['recce', v.project_id] }),
  });
}
export function useDeleteRecce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('recce_plans').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['recce', v.projectId] }),
  });
}

/* ---- PPM ---- */
export function usePPM(projectId?: string) {
  return useQuery({
    queryKey: ['ppm', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('ppm_meetings').select('*').eq('project_id', projectId!).order('meeting_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as PPMMeeting[];
    },
  });
}
export function useSavePPM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: { id?: string; project_id: string; meeting_date: string | null; attendees: string | null; notes: string | null; status: string }) => {
      if (m.id) { const { id, ...rest } = m; const { error } = await supabase.from('ppm_meetings').update(rest).eq('id', id); if (error) throw error; }
      else { const { error } = await supabase.from('ppm_meetings').insert(m); if (error) throw error; }
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['ppm', v.project_id] }),
  });
}
export function useDeletePPM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('ppm_meetings').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['ppm', v.projectId] }),
  });
}

/* ---- Call sheets ---- */
export function useCallSheets(projectId?: string) {
  return useQuery({
    queryKey: ['call_sheets', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('call_sheets').select('*, location:locations(name)').eq('project_id', projectId!).order('shoot_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CallSheet[];
    },
  });
}
export function useSaveCallSheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: { id?: string; project_id: string; shoot_date: string; day_number: number; location_id: string | null; general_call_time: string | null; notes: string | null }) => {
      if (c.id) { const { id, ...rest } = c; const { error } = await supabase.from('call_sheets').update(rest).eq('id', id); if (error) throw error; }
      else { const { error } = await supabase.from('call_sheets').insert(c); if (error) throw error; }
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['call_sheets', v.project_id] }),
  });
}
export function useDeleteCallSheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      await supabase.from('call_sheet_items').delete().eq('call_sheet_id', id);
      const { error } = await supabase.from('call_sheets').delete().eq('id', id); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['call_sheets', v.projectId] }),
  });
}

export function useCallSheetItems(callSheetId?: string) {
  return useQuery({
    queryKey: ['call_sheet_items', callSheetId],
    enabled: Boolean(callSheetId),
    queryFn: async () => {
      const { data, error } = await supabase.from('call_sheet_items').select('*').eq('call_sheet_id', callSheetId!).order('sort_order');
      if (error) throw error;
      return (data ?? []) as CallSheetItem[];
    },
  });
}
export function useAddCallSheetItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (i: { call_sheet_id: string; role_or_name: string; call_time: string | null; sort_order: number }) => {
      const { error } = await supabase.from('call_sheet_items').insert(i); if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['call_sheet_items', v.call_sheet_id] }),
  });
}
export function useDeleteCallSheetItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; callSheetId: string }) => { const { error } = await supabase.from('call_sheet_items').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['call_sheet_items', v.callSheetId] }),
  });
}
