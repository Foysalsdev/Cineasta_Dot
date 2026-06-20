import { useState } from 'react';
import { Plus, Loader2, FileText, Trash2 } from 'lucide-react';
import { useDailyReports, useSaveDailyReport, useDeleteDailyReport } from '../../hooks/useShoot';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

export default function DailyReportsTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: reports, isLoading } = useDailyReports(projectId);
  const save = useSaveDailyReport();
  const del = useDeleteDailyReport();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ scenes_completed: '', shots_done: '', call_time: '', wrap_time: '', issues: '', tomorrow_prep: '' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    await save.mutateAsync({
      project_id: projectId,
      scenes_completed: form.scenes_completed ? Number(form.scenes_completed) : null,
      shots_done: form.shots_done ? Number(form.shots_done) : null,
      call_time: form.call_time || null, wrap_time: form.wrap_time || null,
      issues: form.issues.trim() || null, tomorrow_prep: form.tomorrow_prep.trim() || null,
    });
    setForm({ scenes_completed: '', shots_done: '', call_time: '', wrap_time: '', issues: '', tomorrow_prep: '' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Submit Report</button></div>}

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (reports?.length ?? 0) === 0 ? (
        <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <FileText size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No daily reports yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports!.map((r) => (
            <div key={r.id} className="rounded-md border px-3.5 py-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{formatDate(r.submitted_at)}</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{r.scenes_completed ?? 0} scenes · {r.shots_done ?? 0} shots</span>
                  {canEdit && <button onClick={() => del.mutate({ id: r.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
                </div>
              </div>
              {(r.call_time || r.wrap_time) && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Call {r.call_time ?? '—'} → Wrap {r.wrap_time ?? '—'}</div>}
              {r.issues && <div className="text-xs mt-1"><span style={{ color: '#EF4444' }}>Issues:</span> <span style={{ color: 'var(--text-secondary)' }}>{r.issues}</span></div>}
              {r.tomorrow_prep && <div className="text-xs mt-0.5"><span style={{ color: 'var(--brand)' }}>Tomorrow:</span> <span style={{ color: 'var(--text-secondary)' }}>{r.tomorrow_prep}</span></div>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Daily Shoot Report"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Submit</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Scenes completed</label><input type="number" value={form.scenes_completed} onChange={(e) => set('scenes_completed', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Shots done</label><input type="number" value={form.shots_done} onChange={(e) => set('shots_done', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Call time</label><input type="time" value={form.call_time} onChange={(e) => set('call_time', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Wrap time</label><input type="time" value={form.wrap_time} onChange={(e) => set('wrap_time', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
          </div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Issues</label><textarea value={form.issues} onChange={(e) => set('issues', e.target.value)} rows={2} className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none" style={inputStyle} /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Tomorrow's prep</label><textarea value={form.tomorrow_prep} onChange={(e) => set('tomorrow_prep', e.target.value)} rows={2} className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none" style={inputStyle} /></div>
        </div>
      </Modal>
    </div>
  );
}
