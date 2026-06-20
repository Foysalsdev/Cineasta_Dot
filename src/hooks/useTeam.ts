import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { RECCE_TEAM, SHOOTING_TEAM } from '../lib/budgetTemplate';

export interface ProjectCrew {
  id: string;
  project_id: string;
  team_type: 'recce' | 'shooting';
  role_title: string;
  quantity: number;
}

export function useProjectCrew(projectId?: string) {
  return useQuery({
    queryKey: ['project-crew', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_crew')
        .select('id, project_id, team_type, role_title, quantity')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProjectCrew[];
    },
  });
}

// Seed the standard Recce + Shooting teams for a project that has none yet.
export function useSeedTeamIfEmpty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { count } = await supabase
        .from('project_crew').select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);
      if (count) return;
      const rows = [
        ...RECCE_TEAM.map((r) => ({ project_id: projectId, team_type: 'recce', role_title: r.role_title, quantity: r.quantity })),
        ...SHOOTING_TEAM.map((r) => ({ project_id: projectId, team_type: 'shooting', role_title: r.role_title, quantity: r.quantity })),
      ];
      const { error } = await supabase.from('project_crew').insert(rows);
      if (error) throw error;
    },
    onSuccess: (_d, projectId) => qc.invalidateQueries({ queryKey: ['project-crew', projectId] }),
  });
}

export function useUpdateCrewQty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase.from('project_crew').update({ quantity }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, _v, _c) => qc.invalidateQueries({ queryKey: ['project-crew'] }),
  });
}

export function useAddCrewRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, teamType, roleTitle, quantity }: { projectId: string; teamType: 'recce' | 'shooting'; roleTitle: string; quantity: number }) => {
      const { error } = await supabase
        .from('project_crew')
        .insert({ project_id: projectId, team_type: teamType, role_title: roleTitle, quantity });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['project-crew', vars.projectId] }),
  });
}

export function useRemoveCrewRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('project_crew').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['project-crew', vars.projectId] }),
  });
}
