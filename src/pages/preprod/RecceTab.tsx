import { useState } from 'react';
import { Plus, Loader2, MapPin, Trash2 } from 'lucide-react';
import { useRecce, useSaveRecce, useDeleteRecce } from '../../hooks/usePreProd';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/format';
import { LocationSelect } from './LocationSelect';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const STATUS: Record<string, string> = { planned: '#3B82F6', done: '#2ECC71', cancelled: '#EF4444' };

export default function RecceTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: recces, isLoading } = useRecce(projectId);
  const save = useSaveRecce();
  const del = useDeleteRecce();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ recce_date: '', location_id: '', status: 'planned', notes: '' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    await save.mutateAsync({ project_id: projectId, recce_date: form.recce_date || null, location_id: form.location_id || null, status: form.status, notes: form.notes.trim() || null });
    setForm({ recce_date: '', location_id: '', status: 'planned', notes: '' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add Recce</button></div>}

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (recces?.length ?? 0) === 0 ? (
        <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <MapPin size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No recce planned yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recces!.map((r) => (
            <div key={r.id} className="rounded-md border px-3.5 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatDate(r.recce_date)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${STATUS[r.status] ?? '#6B7280'}22`, color: STATUS[r.status] ?? '#6B7280' }}>{r.status}</span>
                </div>
                <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}><MapPin size={11} /> {r.location?.name ?? 'No location'}{r.notes ? ` · ${r.notes}` : ''}</div>
              </div>
              {canEdit && <button onClick={() => del.mutate({ id: r.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded shrink-0" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Recce"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Add</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Recce date</label><input type="date" value={form.recce_date} onChange={(e) => set('recce_date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label><select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}><option value="planned">Planned</option><option value="done">Done</option><option value="cancelled">Cancelled</option></select></div>
          </div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Location</label><LocationSelect value={form.location_id} onChange={(id) => set('location_id', id)} /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label><input value={form.notes} onChange={(e) => set('notes', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Optional" /></div>
        </div>
      </Modal>
    </div>
  );
}
