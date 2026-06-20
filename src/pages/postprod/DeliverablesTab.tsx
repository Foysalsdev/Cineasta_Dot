import { useState } from 'react';
import { Plus, Loader2, Film, Trash2, ExternalLink } from 'lucide-react';
import {
  useDeliverables, useSaveDeliverable, useSetDeliverableStatus, useDeleteDeliverable,
  DELIVERABLE_TYPES, DELIVERABLE_STATUS, delivMeta,
} from '../../hooks/usePostProd';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

export default function DeliverablesTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: items, isLoading } = useDeliverables(projectId);
  const save = useSaveDeliverable();
  const setStatus = useSetDeliverableStatus();
  const del = useDeleteDeliverable();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ deliverable_type: 'Master', version_label: '', file_url: '', status: 'pending' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    await save.mutateAsync({ project_id: projectId, deliverable_type: form.deliverable_type, version_label: form.version_label.trim() || null, file_url: form.file_url.trim() || null, status: form.status, delivered_date: null });
    setForm({ deliverable_type: 'Master', version_label: '', file_url: '', status: 'pending' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add Deliverable</button></div>}

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (items?.length ?? 0) === 0 ? (
        <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <Film size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No deliverables yet.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
                <th className="text-left font-medium px-3.5 py-2.5">Deliverable</th>
                <th className="text-left font-medium px-3.5 py-2.5 hidden sm:table-cell">Delivered</th>
                <th className="text-left font-medium px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items!.map((d) => {
                const meta = delivMeta(d.status);
                return (
                  <tr key={d.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-3.5 py-2.5">
                      <div className="font-medium flex items-center gap-1.5">
                        {d.deliverable_type}{d.version_label ? <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({d.version_label})</span> : null}
                        {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}><ExternalLink size={12} /></a>}
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 hidden sm:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>{d.delivered_date ? formatDate(d.delivered_date) : '—'}</td>
                    <td className="px-3.5 py-2.5">
                      {canEdit ? (
                        <select value={d.status} onChange={(e) => setStatus.mutate({ id: d.id, status: e.target.value, projectId })} className="text-xs rounded-full px-2 py-0.5 outline-none" style={{ background: `${meta.color}22`, color: meta.color, border: 'none' }}>
                          {DELIVERABLE_STATUS.map((s) => <option key={s.key} value={s.key} style={{ color: 'var(--text-primary)', background: 'var(--card)' }}>{s.label}</option>)}
                        </select>
                      ) : <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>}
                    </td>
                    <td className="px-3.5 py-2.5">{canEdit && <button onClick={() => del.mutate({ id: d.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Deliverable"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Add</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label><select value={form.deliverable_type} onChange={(e) => set('deliverable_type', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>{DELIVERABLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Version label</label><input value={form.version_label} onChange={(e) => set('version_label', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="e.g. 30s, v2" /></div>
          </div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>File / footage link</label><input value={form.file_url} onChange={(e) => set('file_url', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="https://drive…" /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label><select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>{DELIVERABLE_STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
        </div>
      </Modal>
    </div>
  );
}
