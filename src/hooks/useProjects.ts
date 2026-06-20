import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Project, ProjectWithClient, ProjectStatus } from '../types';

const TABLE = 'projects';
const SELECT = '*, client:clients(name, company)';

export type ProjectInput = Partial<Project> & { id?: string };

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select(SELECT)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ProjectWithClient[];
    },
  });
}

export function useProject(id?: string) {
  return useQuery({
    queryKey: ['project', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE).select(SELECT).eq('id', id!).single();
      if (error) throw error;
      return data as unknown as ProjectWithClient;
    },
  });
}

export function useSaveProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProjectInput) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { error } = await supabase
          .from(TABLE)
          .update({ ...rest, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
        return id;
      }
      const { data: userRes } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from(TABLE)
        .insert({ ...input, created_by: userRes.user?.id })
        .select('id')
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}

export function useUpdateProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      const { error } = await supabase
        .from(TABLE)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    // Optimistic update so the card moves instantly.
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['projects'] });
      const prev = qc.getQueryData<ProjectWithClient[]>(['projects']);
      if (prev) {
        qc.setQueryData<ProjectWithClient[]>(
          ['projects'],
          prev.map((p) => (p.id === id ? { ...p, status } : p)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['projects'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(TABLE)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}
