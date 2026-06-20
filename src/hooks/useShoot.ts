import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { LocationRow } from './usePreProd';

export interface ShootSchedule { id: string; project_id: string; day_number: number; shoot_date: string; location_id: string | null; call_time: string | null; wrap_time: string | null; status: string; location?: { name: string } | null; }
export interface DailyReport { id: string; project_id: string; shoot_schedule_id: string | null; scenes_completed: number | null; shots_done: number | null; call_time: string | null; wrap_time: string | null; issues: string | null; tomorrow_prep: string | null; submitted_at: string; }

/* ---- Schedule ---- */
export function useSchedules(projectId?: string) {
  return useQuery({
    queryKey: ['shoot_schedules', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('shoot_schedules').select('*, location:locations(name)').eq('project_id', projectId!).order('shoot_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ShootSchedule[];
    },
  });
}
export function useSaveSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: { id?: string; project_id: string; day_number: number; shoot_date: string; location_id: string | null; call_time: string | null; wrap_time: string | null; status: string }) => {
      if (s.id) { const { id, ...rest } = s; const { error } = await supabase.from('shoot_schedules').update(rest).eq('id', id); if (error) throw error; }
      else { const { error } = await supabase.from('shoot_schedules').insert(s); if (error) throw error; }
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['shoot_schedules', v.project_id] }),
  });
}
export function useSetScheduleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string; projectId: string }) => { const { error } = await supabase.from('shoot_schedules').update({ status }).eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['shoot_schedules', v.projectId] }),
  });
}
export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('shoot_schedules').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['shoot_schedules', v.projectId] }),
  });
}

/* ---- Daily reports ---- */
export function useDailyReports(projectId?: string) {
  return useQuery({
    queryKey: ['daily_reports', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase.from('daily_reports').select('*').eq('project_id', projectId!).order('submitted_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DailyReport[];
    },
  });
}
export function useSaveDailyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: { project_id: string; scenes_completed: number | null; shots_done: number | null; call_time: string | null; wrap_time: string | null; issues: string | null; tomorrow_prep: string | null }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase.from('daily_reports').insert({ ...r, submitted_by: userRes.user?.id });
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['daily_reports', v.project_id] }),
  });
}
export function useDeleteDailyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => { const { error } = await supabase.from('daily_reports').delete().eq('id', id); if (error) throw error; },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['daily_reports', v.projectId] }),
  });
}

/* ---- Location manager (full CRUD) ---- */
export function useSaveLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (l: Partial<LocationRow> & { id?: string; name: string }) => {
      if (l.id) { const { id, ...rest } = l; const { error } = await supabase.from('locations').update(rest).eq('id', id); if (error) throw error; }
      else { const { error } = await supabase.from('locations').insert(l); if (error) throw error; }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations'] }),
  });
}
export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('locations').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations'] }),
  });
}
