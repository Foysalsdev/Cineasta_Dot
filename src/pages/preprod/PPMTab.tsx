import { useState } from 'react';
import { Plus, Loader2, Users, Trash2 } from 'lucide-react';
import { usePPM, useSavePPM, useDeletePPM } from '../../hooks/usePreProd';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const STATUS: Record<string, string> = { scheduled: '#3B82F6', done: '#2ECC71', cancelled: '#EF4444' };

export default function PPMTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: ppms, isLoading } = usePPM(projectId);
  const save = useSavePPM();
  const del = useDeletePPM();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ meeting_date: '', attendees: '', notes: '', status: 'scheduled' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    await save.mutateAsync({ project_id: projectId, meeting_date: form.meeting_date || null, attendees: form.attendees.trim() || null, notes: form.notes.trim() || null, status: form.status });
    setForm({ meeting_date: '', attendees: '', notes: '', status: 'scheduled' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add PPM</button></div>}

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (ppms?.length ?? 0) === 0 ? (
        <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <Users size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pre-production meetings yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ppms!.map((m) => (
            <div key={m.id} className="rounded-md border px-3.5 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatDate(m.meeting_date)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${STATUS[m.status] ?? '#6B7280'}22`, color: STATUS[m.status] ?? '#6B7280' }}>{m.status}</span>
                </div>
                {m.attendees && <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{m.attendees}</div>}
                {m.notes && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.notes}</div>}
              </div>
              {canEdit && <button onClick={() => del.mutate({ id: m.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded shrink-0" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add PPM Meeting"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Add</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Meeting date</label><input type="date" value={form.meeting_date} onChange={(e) => set('meeting_date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label><select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}><option value="scheduled">Scheduled</option><option value="done">Done</option><option value="cancelled">Cancelled</option></select></div>
          </div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Attendees</label><input value={form.attendees} onChange={(e) => set('attendees', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Director, Producer, Client…" /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Notes / decisions</label><textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none" style={inputStyle} /></div>
        </div>
      </Modal>
    </div>
  );
}
