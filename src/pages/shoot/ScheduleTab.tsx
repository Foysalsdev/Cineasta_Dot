import { useState } from 'react';
import { Plus, Loader2, Camera, Trash2, Clock } from 'lucide-react';
import { useSchedules, useSaveSchedule, useDeleteSchedule, useSetScheduleStatus } from '../../hooks/useShoot';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/format';
import { LocationSelect } from '../preprod/LocationSelect';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const STATUS = ['scheduled', 'completed', 'cancelled'];
const COLOR: Record<string, string> = { scheduled: '#3B82F6', completed: '#2ECC71', cancelled: '#EF4444' };

export default function ScheduleTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: rows, isLoading } = useSchedules(projectId);
  const save = useSaveSchedule();
  const del = useDeleteSchedule();
  const setStatus = useSetScheduleStatus();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ day_number: '1', shoot_date: '', location_id: '', call_time: '', wrap_time: '', status: 'scheduled' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.shoot_date) return;
    await save.mutateAsync({ project_id: projectId, day_number: Number(form.day_number) || 1, shoot_date: form.shoot_date, location_id: form.location_id || null, call_time: form.call_time || null, wrap_time: form.wrap_time || null, status: form.status });
    setForm({ day_number: '1', shoot_date: '', location_id: '', call_time: '', wrap_time: '', status: 'scheduled' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add Shoot Day</button></div>}

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (rows?.length ?? 0) === 0 ? (
        <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <Camera size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No shoot days scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows!.map((s) => (
            <div key={s.id} className="rounded-md border px-3.5 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
              <div className="min-w-0">
                <div className="text-sm font-medium">Day {s.day_number} · {formatDate(s.shoot_date)}</div>
                <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  <span>{s.location?.name ?? 'No location'}</span>
                  {(s.call_time || s.wrap_time) && <span className="flex items-center gap-1"><Clock size={11} /> {s.call_time ?? '—'}{s.wrap_time ? ` → ${s.wrap_time}` : ''}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canEdit ? (
                  <select value={s.status} onChange={(e) => setStatus.mutate({ id: s.id, status: e.target.value, projectId })} className="text-xs rounded-full px-2 py-0.5 outline-none" style={{ background: `${COLOR[s.status] ?? '#6B7280'}22`, color: COLOR[s.status] ?? '#6B7280', border: 'none' }}>
                    {STATUS.map((st) => <option key={st} value={st} style={{ color: 'var(--text-primary)', background: 'var(--card)' }}>{st}</option>)}
                  </select>
                ) : <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${COLOR[s.status] ?? '#6B7280'}22`, color: COLOR[s.status] ?? '#6B7280' }}>{s.status}</span>}
                {canEdit && <button onClick={() => del.mutate({ id: s.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Shoot Day"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Add</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Shoot date *</label><input type="date" value={form.shoot_date} onChange={(e) => set('shoot_date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Day #</label><input type="number" value={form.day_number} onChange={(e) => set('day_number', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></div>
          </div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Location</label><LocationSelect value={form.location_id} onChange={(id) => set('location_id', id)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Call time</label><input type="time" value={form.call_time} onChange={(e) => set('call_time', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Wrap time</label><input type="time" value={form.wrap_time} onChange={(e) => set('wrap_time', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
