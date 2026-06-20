import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface CrewMember {
  id: string;
  name: string;
  role_title: string;
  phone: string | null;
  email: string | null;
  availability: string;
  day_rate: number | null;
  notes: string | null;
  created_at: string;
}

export type CrewInput = Partial<CrewMember> & { id?: string };

export const AVAILABILITY = [
  { key: 'available', label: 'Available', color: '#2ECC71' },
  { key: 'busy', label: 'Busy', color: '#F59E0B' },
  { key: 'unavailable', label: 'Unavailable', color: '#6B7280' },
] as const;

export const availabilityMeta = (s: string) => AVAILABILITY.find((x) => x.key === s) ?? AVAILABILITY[0];

export function useCrew() {
  return useQuery({
    queryKey: ['crew'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members').select('*').is('deleted_at', null)
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as CrewMember[];
    },
  });
}

export function useSaveCrew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CrewInput) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { error } = await supabase.from('crew_members').update(rest).eq('id', id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase.from('crew_members').insert(input).select('id').single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew'] }),
  });
}

export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, availability }: { id: string; availability: string }) => {
      const { error } = await supabase.from('crew_members').update({ availability }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew'] }),
  });
}

export function useDeleteCrew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crew_members').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crew'] }),
  });
}
