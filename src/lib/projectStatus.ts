import { ProjectStatus } from '../types';

export interface StatusMeta { key: ProjectStatus; label: string; color: string; }

export const PIPELINE: StatusMeta[] = [
  { key: 'quoted', label: 'Quoted', color: '#6B7280' },
  { key: 'ppm_prep', label: 'PPM / Prep', color: '#3B82F6' },
  { key: 'shoot', label: 'Shoot', color: '#F59E0B' },
  { key: 'post_production', label: 'Post', color: '#6366F1' },
  { key: 'invoiced', label: 'Invoiced', color: '#0EA5E9' },
  { key: 'paid', label: 'Paid', color: '#2ECC71' },
];

export const CANCELLED: StatusMeta = { key: 'cancelled', label: 'Cancelled', color: '#EF4444' };
export const ALL_STATUSES: StatusMeta[] = [...PIPELINE, CANCELLED];
export const statusMeta = (s: ProjectStatus): StatusMeta => ALL_STATUSES.find((m) => m.key === s) ?? CANCELLED;

export const PROJECT_TYPES = ['TVC', 'OVC', 'AV', 'Digital', 'Photoshoot', 'Documentary', 'Other'];

export const PROJECT_STATES = [
  { key: 'draft', label: 'Draft', color: '#6B7280' },
  { key: 'active', label: 'Active', color: '#3B82F6' },
  { key: 'completed', label: 'Completed', color: '#2ECC71' },
  { key: 'on_hold', label: 'On Hold', color: '#F59E0B' },
  { key: 'cancelled', label: 'Cancelled', color: '#EF4444' },
] as const;

export const stateMeta = (s: string) => PROJECT_STATES.find((x) => x.key === s) ?? PROJECT_STATES[0];
