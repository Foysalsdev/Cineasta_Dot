export type ProjectStatus =
  | 'quoted' | 'ppm_prep' | 'shoot' | 'post_production'
  | 'invoiced' | 'paid' | 'cancelled'
  | 'draft' | 'active' | 'completed' | 'on_hold';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export interface ModulePermission {
  module_key: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
}

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  advance_payment_pct: number;
  final_payment_pct: number;
  final_payment_days: number;
  vat_pct: number;
  created_at: string;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  client_id: string;
  status: ProjectStatus;
  project_type: string | null;
  description: string | null;
  start_date: string | null;
  delivery_date: string | null;
  presentation_date: string | null;
  manager_id: string | null;
  created_at: string;
}

export interface ProjectWithClient extends Project {
  client: { name: string; company: string | null } | null;
}
