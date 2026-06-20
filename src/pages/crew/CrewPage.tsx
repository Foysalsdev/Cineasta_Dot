import { useMemo, useState } from 'react';
import { Plus, Search, Loader2, Users2, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useCrew, useSaveCrew, useDeleteCrew, useSetAvailability,
  CrewMember, AVAILABILITY, availabilityMeta,
} from '../../hooks/useCrew';
import { Modal } from '../../components/ui/Modal';
import { formatBDT, initials } from '../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

function CrewModal({ open, member, onClose }: { open: boolean; member: CrewMember | null; onClose: () => void }) {
  const save = useSaveCrew();
  const [form, setForm] = useState({
    name: member?.name ?? '', role_title: member?.role_title ?? '', phone: member?.phone ?? '',
    email: member?.email ?? '', day_rate: member?.day_rate != null ? String(member.day_rate) : '',
    availability: member?.availability ?? 'available', notes: member?.notes ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name.trim()) return setError('Name is required.');
    if (!form.role_title.trim()) return setError('Role is required.');
    setError(null);
    try {
      await save.mutateAsync({
        id: member?.id, name: form.name.trim(), role_title: form.role_title.trim(),
        phone: form.phone.trim() || null, email: form.email.trim() || null,
        day_rate: form.day_rate ? Number(form.day_rate) : null,
        availability: form.availability, notes: form.notes.trim() || null,
      });
      onClose();
    } catch (e: any) { setError(e?.message ?? 'Could not save.'); }
  }

  return (
    <Modal open={open} onClose={onClose} title={member ? 'Edit Crew Member' : 'New Crew Member'}
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>
            {save.isPending && <Loader2 size={14} className="animate-spin" />} {member ? 'Save' : 'Add'}
          </button>
        </>
      }>
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
            <input autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Full name" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Role *</label>
            <input value={form.role_title} onChange={(e) => set('role_title', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="e.g. Gaffer, DOP" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Phone</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="+8801…" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="name@email.com" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Day Rate (৳)</label>
            <input type="number" value={form.day_rate} onChange={(e) => set('day_rate', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} placeholder="0" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Availability</label>
            <select value={form.availability} onChange={(e) => set('availability', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>
              {AVAILABILITY.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
          <input value={form.notes} onChange={(e) => set('notes', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Optional" />
        </div>
        {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
      </div>
    </Modal>
  );
}

export default function CrewPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('crew', 'can_create');
  const canEdit = hasPermission('crew', 'can_edit');
  const canDelete = hasPermission('crew', 'can_delete');

  const { data: crew, isLoading } = useCrew();
  const setAvail = useSetAvailability();
  const del = useDeleteCrew();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState<{ open: boolean; member: CrewMember | null }>({ open: false, member: null });
  const [confirm, setConfirm] = useState<CrewMember | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (crew ?? []).filter((c) => {
      if (filter !== 'all' && c.availability !== filter) return false;
      if (!q) return true;
      return [c.name, c.role_title, c.phone, c.email].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [crew, search, filter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Crew</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{crew?.length ?? 0} crew members</p>
        </div>
        {canCreate && (
          <button onClick={() => setModal({ open: true, member: null })} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white shrink-0" style={{ background: 'var(--brand)' }}>
            <Plus size={14} /> New Crew
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm flex-1 max-w-sm" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, role…" className="bg-transparent outline-none flex-1" style={{ color: 'var(--text-primary)' }} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>
          <option value="all">All availability</option>
          {AVAILABILITY.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
      </div>

      <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Name / Role</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden sm:table-cell">Contact</th>
              <th className="text-right font-medium px-3.5 py-2.5">Day Rate</th>
              <th className="text-left font-medium px-3.5 py-2.5">Availability</th>
              <th className="px-3.5 py-2.5 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-3.5 py-12 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-3.5 py-14 text-center">
                <Users2 size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{search || filter !== 'all' ? 'No crew match.' : 'No crew members yet.'}</p>
              </td></tr>
            ) : filtered.map((c) => {
              const meta = availabilityMeta(c.availability);
              return (
                <tr key={c.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>{initials(c.name)}</div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.role_title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 hidden sm:table-cell text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {c.phone && <div className="flex items-center gap-1"><Phone size={11} /> {c.phone}</div>}
                    {c.email && <div className="flex items-center gap-1"><Mail size={11} /> {c.email}</div>}
                    {!c.phone && !c.email && '—'}
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono">{c.day_rate != null ? formatBDT(c.day_rate) : '—'}</td>
                  <td className="px-3.5 py-3">
                    {canEdit ? (
                      <select value={c.availability} onChange={(e) => setAvail.mutate({ id: c.id, availability: e.target.value })} className="text-xs rounded-full px-2 py-0.5 outline-none" style={{ background: `${meta.color}22`, color: meta.color, border: 'none' }}>
                        {AVAILABILITY.map((a) => <option key={a.key} value={a.key} style={{ color: 'var(--text-primary)', background: 'var(--card)' }}>{a.label}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {canEdit && <button onClick={() => setModal({ open: true, member: c })} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--text-secondary)' }}><Pencil size={13} /></button>}
                      {canDelete && <button onClick={() => setConfirm(c)} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal.open && <CrewModal open={modal.open} member={modal.member} onClose={() => setModal({ open: false, member: null })} />}

      <Modal open={Boolean(confirm)} title="Remove crew member?" onClose={() => setConfirm(null)} width={400}
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={async () => { if (confirm) await del.mutateAsync(confirm.id); setConfirm(null); }} disabled={del.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: '#EF4444' }}>
              {del.isPending && <Loader2 size={14} className="animate-spin" />} Remove
            </button>
          </>
        }>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{confirm?.name}</span> will be removed from the crew database.
        </p>
      </Modal>
    </div>
  );
}
