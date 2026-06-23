import { useState } from 'react';
import { Plus, Loader2, FolderOpen, Trash2, ExternalLink } from 'lucide-react';
import { useProjectDocs, useSaveDoc, useDeleteDoc } from '../../../hooks/useProjectExtras';
import { Modal } from '../../../components/ui/Modal';
import { Combobox } from '../../../components/ui/Combobox';
import { formatDate } from '../../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const DOC_TYPES = ['brief', 'script', 'storyboard', 'quotation', 'invoice', 'contract', 'deliverable', 'footage', 'other'];

export default function DocumentsTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: docs, isLoading } = useProjectDocs(projectId);
  const save = useSaveDoc();
  const del = useDeleteDoc();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', doc_type: 'brief', file_url: '' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name.trim()) return;
    await save.mutateAsync({ project_id: projectId, name: form.name.trim(), doc_type: form.doc_type, file_url: form.file_url.trim() || null });
    setForm({ name: '', doc_type: 'brief', file_url: '' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{canEdit && <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add File / Link</button>}</div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (docs?.length ?? 0) === 0 ? (
        <div className="rounded-lg border px-4 py-12 text-center shadow-card" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <FolderOpen size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No files or links yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {docs!.map((d) => (
            <div key={d.id} className="rounded-lg border px-3.5 py-3 flex items-center justify-between gap-2 shadow-card" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <div className="min-w-0">
                <div className="text-sm font-medium flex items-center gap-1.5">{d.name}{d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}><ExternalLink size={12} /></a>}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.doc_type} · {formatDate(d.created_at)}</div>
              </div>
              {canEdit && <button onClick={() => del.mutate({ id: d.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded shrink-0" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add File / Link"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Add</button>
        </>}>
        <div className="space-y-3.5">
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label><input autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Script v2, Storyboard…" /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label><Combobox value={form.doc_type} onChange={(v) => set('doc_type', v)} options={DOC_TYPES} placeholder="Type" /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Link (Drive, footage…)</label><input value={form.file_url} onChange={(e) => set('file_url', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="https://" /></div>
        </div>
      </Modal>
    </div>
  );
}
