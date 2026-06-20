import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface AppSettings {
  agency_name: string;
  currency: string;
  about: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  default_vat_pct: number;
  default_advance_pct: number;
  default_final_pct: number;
  default_final_days: number;
}

export interface Role { id: string; name: string; description: string | null; is_system_role: boolean; }
export interface Module { id: string; key: string; label: string; }
export interface RolePermission {
  id?: string; role_id: string; module_id: string;
  can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean; can_approve: boolean; can_export: boolean;
}
export type PermField = 'can_view' | 'can_create' | 'can_edit' | 'can_delete' | 'can_approve' | 'can_export';

/* ---- App settings ---- */
export function useAppSettings() {
  return useQuery({
    queryKey: ['app_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*').limit(1).single();
      if (error) throw error;
      return data as AppSettings;
    },
  });
}

export function useSaveAppSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<AppSettings>) => {
      const { error } = await supabase.from('app_settings').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', true);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app_settings'] }),
  });
}

/* ---- Roles & permissions ---- */
export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*').order('name');
      if (error) throw error;
      return (data ?? []) as Role[];
    },
  });
}

export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('modules').select('*');
      if (error) throw error;
      return (data ?? []) as Module[];
    },
  });
}

export function useRolePermissions(roleId?: string) {
  return useQuery({
    queryKey: ['role_permissions', roleId],
    enabled: Boolean(roleId),
    queryFn: async () => {
      const { data, error } = await supabase.from('role_permissions').select('*').eq('role_id', roleId!);
      if (error) throw error;
      return (data ?? []) as RolePermission[];
    },
  });
}

export function useSetPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, moduleId, field, value, existing }: {
      roleId: string; moduleId: string; field: PermField; value: boolean; existing?: RolePermission;
    }) => {
      if (existing?.id) {
        const { error } = await supabase.from('role_permissions').update({ [field]: value }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const base = { role_id: roleId, module_id: moduleId, can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false, can_export: false } as any;
        base[field] = value;
        const { error } = await supabase.from('role_permissions').insert(base);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['role_permissions', vars.roleId] }),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('roles').insert({ name });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

/* ---- Terms ---- */
export function useActiveTerms() {
  return useQuery({
    queryKey: ['active_terms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('terms_templates').select('id, content, version').eq('is_active', true)
        .order('version', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data as { id: string; content: string; version: number } | null;
    },
  });
}

export function useSaveTerms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase.from('terms_templates').update({ content }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['active_terms'] }),
  });
}
