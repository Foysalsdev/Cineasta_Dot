import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useAppSettings, useSaveAppSettings, useRoles, useModules, useRolePermissions,
  useSetPermission, useCreateRole, useActiveTerms, useSaveTerms,
  AppSettings, PermField, RolePermission,
} from '../../hooks/useSettings';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const TABS = ['Company Profile', 'Payment & Tax', 'Roles & Permissions', 'Terms'] as const;
type Tab = (typeof TABS)[number];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  );
}

function SaveBtn({ onClick, pending, saved }: { onClick: () => void; pending: boolean; saved: boolean }) {
  return (
    <button onClick={onClick} disabled={pending} className="flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-md text-white font-medium disabled:opacity-50" style={{ background: 'var(--brand)' }}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saved ? 'Saved' : 'Save'}
    </button>
  );
}

function CompanyTab({ settings, canEdit }: { settings: AppSettings; canEdit: boolean }) {
  const save = useSaveAppSettings();
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    agency_name: settings.agency_name ?? '', about: settings.about ?? '', address: settings.address ?? '',
    phone: settings.phone ?? '', email: settings.email ?? '', website: settings.website ?? '',
  });
  const set = (k: keyof typeof f, v: string) => { setF((s) => ({ ...s, [k]: v })); setSaved(false); };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Agency / Company name"><input value={f.agency_name} readOnly={!canEdit} onChange={(e) => set('agency_name', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></Field>
        <Field label="Website"><input value={f.website} readOnly={!canEdit} onChange={(e) => set('website', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="https://" /></Field>
        <Field label="Phone"><input value={f.phone} readOnly={!canEdit} onChange={(e) => set('phone', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></Field>
        <Field label="Email"><input value={f.email} readOnly={!canEdit} onChange={(e) => set('email', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></Field>
      </div>
      <Field label="Address"><input value={f.address} readOnly={!canEdit} onChange={(e) => set('address', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></Field>
      <Field label="About"><textarea value={f.about} readOnly={!canEdit} onChange={(e) => set('about', e.target.value)} rows={3} className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none" style={inputStyle} placeholder="Short description of the agency" /></Field>
      {canEdit && <SaveBtn onClick={async () => { await save.mutateAsync(f); setSaved(true); }} pending={save.isPending} saved={saved} />}
    </div>
  );
}

function PaymentTab({ settings, canEdit }: { settings: AppSettings; canEdit: boolean }) {
  const save = useSaveAppSettings();
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    default_advance_pct: String(settings.default_advance_pct ?? 75), default_final_pct: String(settings.default_final_pct ?? 25),
    default_final_days: String(settings.default_final_days ?? 45), default_vat_pct: String(settings.default_vat_pct ?? 0), currency: settings.currency ?? 'BDT',
  });
  const set = (k: keyof typeof f, v: string) => { setF((s) => ({ ...s, [k]: v })); setSaved(false); };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Advance %"><input type="number" value={f.default_advance_pct} readOnly={!canEdit} onChange={(e) => set('default_advance_pct', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></Field>
        <Field label="Final %"><input type="number" value={f.default_final_pct} readOnly={!canEdit} onChange={(e) => set('default_final_pct', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></Field>
        <Field label="Final payment due (days)"><input type="number" value={f.default_final_days} readOnly={!canEdit} onChange={(e) => set('default_final_days', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></Field>
        <Field label="VAT %"><input type="number" value={f.default_vat_pct} readOnly={!canEdit} onChange={(e) => set('default_vat_pct', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></Field>
        <Field label="Currency"><input value={f.currency} readOnly={!canEdit} onChange={(e) => set('currency', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></Field>
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>These seed new clients; each client can override their own terms.</p>
      {canEdit && <SaveBtn onClick={async () => {
        await save.mutateAsync({
          default_advance_pct: Number(f.default_advance_pct), default_final_pct: Number(f.default_final_pct),
          default_final_days: Number(f.default_final_days), default_vat_pct: Number(f.default_vat_pct), currency: f.currency,
        });
        setSaved(true);
      }} pending={save.isPending} saved={saved} />}
    </div>
  );
}

const PERM_COLS: { field: PermField; label: string }[] = [
  { field: 'can_view', label: 'View' }, { field: 'can_create', label: 'Create' }, { field: 'can_edit', label: 'Edit' },
  { field: 'can_delete', label: 'Delete' }, { field: 'can_approve', label: 'Approve' }, { field: 'can_export', label: 'Export' },
];

function RolesTab({ canEdit }: { canEdit: boolean }) {
  const { data: roles } = useRoles();
  const { data: modules } = useModules();
  const createRole = useCreateRole();
  const setPerm = useSetPermission();
  const [roleId, setRoleId] = useState('');
  const [newRole, setNewRole] = useState('');
  const { data: perms } = useRolePermissions(roleId || roles?.[0]?.id);

  useEffect(() => { if (!roleId && roles?.[0]) setRoleId(roles[0].id); }, [roles, roleId]);

  const permMap = useMemo(() => {
    const m: Record<string, RolePermission> = {};
    (perms ?? []).forEach((p) => { m[p.module_id] = p; });
    return m;
  }, [perms]);

  const activeRoleId = roleId || roles?.[0]?.id || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <select value={activeRoleId} onChange={(e) => setRoleId(e.target.value)} className="rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>
          {(roles ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        {canEdit && (
          <div className="flex items-center gap-1.5">
            <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="New role name" className="rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} />
            <button onClick={() => { if (newRole.trim()) { createRole.mutate(newRole.trim()); setNewRole(''); } }} className="flex items-center gap-1 text-sm px-2.5 py-2 rounded-md" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><Plus size={13} /> Add role</button>
          </div>
        )}
      </div>

      <div className="rounded-md border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Module</th>
              {PERM_COLS.map((c) => <th key={c.field} className="font-medium px-2 py-2.5 text-center">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {(modules ?? []).map((mod) => {
              const existing = permMap[mod.id];
              return (
                <tr key={mod.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3.5 py-2 font-medium">{mod.label}</td>
                  {PERM_COLS.map((c) => {
                    const checked = Boolean(existing?.[c.field]);
                    return (
                      <td key={c.field} className="px-2 py-2 text-center">
                        <input type="checkbox" checked={checked} disabled={!canEdit}
                          onChange={(e) => setPerm.mutate({ roleId: activeRoleId, moduleId: mod.id, field: c.field, value: e.target.checked, existing })}
                          style={{ accentColor: 'var(--brand)', width: 15, height: 15 }} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Changes apply on the user's next sign-in / refresh.</p>
    </div>
  );
}

function TermsTab({ canEdit }: { canEdit: boolean }) {
  const { data: terms, isLoading } = useActiveTerms();
  const save = useSaveTerms();
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (terms) setContent(terms.content); }, [terms]);

  if (isLoading) return <div className="py-12 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>;
  if (!terms) return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No terms template found.</p>;

  return (
    <div className="space-y-3 max-w-3xl">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>These terms appear on every quotation (version {terms.version}).</p>
      <textarea value={content} readOnly={!canEdit} onChange={(e) => { setContent(e.target.value); setSaved(false); }} rows={18} className="w-full rounded-md px-3 py-2 text-xs outline-none font-mono" style={inputStyle} />
      {canEdit && <SaveBtn onClick={async () => { await save.mutateAsync({ id: terms.id, content }); setSaved(true); }} pending={save.isPending} saved={saved} />}
    </div>
  );
}

export default function SettingsPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('settings', 'can_edit');
  const { data: settings, isLoading } = useAppSettings();
  const [tab, setTab] = useState<Tab>('Company Profile');

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold">Settings</h1>

      <div className="border-b flex gap-1 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2 text-sm -mb-px border-b-2 whitespace-nowrap"
            style={{ borderColor: tab === t ? 'var(--brand)' : 'transparent', color: tab === t ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: tab === t ? 600 : 400 }}>
            {t}
          </button>
        ))}
      </div>

      {isLoading || !settings ? (
        <div className="py-12 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (
        <>
          {tab === 'Company Profile' && <CompanyTab settings={settings} canEdit={canEdit} />}
          {tab === 'Payment & Tax' && <PaymentTab settings={settings} canEdit={canEdit} />}
          {tab === 'Roles & Permissions' && <RolesTab canEdit={canEdit} />}
          {tab === 'Terms' && <TermsTab canEdit={canEdit} />}
        </>
      )}
    </div>
  );
}
