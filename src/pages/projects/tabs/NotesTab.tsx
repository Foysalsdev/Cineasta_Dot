import { useState } from 'react';
import { Plus, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { useCommunications, useSaveCommunication, useDeleteCommunication } from '../../../hooks/useProjectExtras';
import { Modal } from '../../../components/ui/Modal';
import { Combobox } from '../../../components/ui/Combobox';
import { formatDate } from '../../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const SOURCES = ['Phone', 'WhatsApp', 'Email', 'Meeting', 'Facebook', 'Messenger', 'Website', 'Referral'];

export default function NotesTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: notes, isLoading } = useCommunications(projectId);
  const save = useSaveCommunication();
  const del = useDeleteCommunication();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ comm_date: new Date().toISOString().slice(0, 10), source: 'Phone', details: '' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.details.trim()) return;
    await save.mutateAsync({ project_id: projectId, comm_date: form.comm_date, source: form.source, details: form.details.trim() });
    setForm({ comm_date: new Date().toISOString().slice(0, 10), source: 'Phone', details: '' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{canEdit && <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add Note</button>}</div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (notes?.length ?? 0) === 0 ? (
        <div className="rounded-lg border px-4 py-12 text-center shadow-card" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <MessageSquare size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notes or communication logged yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes!.map((n) => (
            <div key={n.id} className="rounded-lg border px-3.5 py-3 flex items-start justify-between gap-3 shadow-card" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>{n.source}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(n.comm_date)}</span>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{n.details}</p>
              </div>
              {canEdit && <button onClick={() => del.mutate({ id: n.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded shrink-0" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Note / Communication"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Save</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label><input type="date" value={form.comm_date} onChange={(e) => set('comm_date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Source</label><Combobox value={form.source} onChange={(v) => set('source', v)} options={SOURCES} placeholder="Phone, WhatsApp…" /></div>
          </div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Details</label><textarea autoFocus value={form.details} onChange={(e) => set('details', e.target.value)} rows={4} className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none" style={inputStyle} placeholder="What was discussed…" /></div>
        </div>
      </Modal>
    </div>
  );
}
