import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Client } from '../types';

const TABLE = 'clients';

// Payload for create/update. id present => update, absent => insert.
export type ClientInput = Partial<Client> & { id?: string };

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });
}

export function useClient(id?: string) {
  return useQuery({
    queryKey: ['client', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE).select('*').eq('id', id!).single();
      if (error) throw error;
      return data as Client;
    },
  });
}

export function useSaveClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClientInput) => {
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
      qc.invalidateQueries({ queryKey: ['clients'] });
      qc.invalidateQueries({ queryKey: ['client', id] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(TABLE)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}
