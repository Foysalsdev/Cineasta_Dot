import { useState } from 'react';
import { Plus, Loader2, Clapperboard, Trash2, Clock, X } from 'lucide-react';
import {
  useCallSheets, useSaveCallSheet, useDeleteCallSheet,
  useCallSheetItems, useAddCallSheetItem, useDeleteCallSheetItem, CallSheet,
} from '../../hooks/usePreProd';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/format';
import { LocationSelect } from './LocationSelect';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

function CallSheetCard({ cs, canEdit, onDelete }: { cs: CallSheet; canEdit: boolean; onDelete: () => void }) {
  const { data: items } = useCallSheetItems(cs.id);
  const addItem = useAddCallSheetItem();
  const delItem = useDeleteCallSheetItem();
  const [role, setRole] = useState('');
  const [time, setTime] = useState('');

  function add() {
    if (!role.trim()) return;
    addItem.mutate({ call_sheet_id: cs.id, role_or_name: role.trim(), call_time: time || null, sort_order: items?.length ?? 0 });
    setRole(''); setTime('');
  }

  return (
    <div className="rounded-md border" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--table-head)' }}>
        <div>
          <div className="text-sm font-medium">Day {cs.day_number} · {formatDate(cs.shoot_date)}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{cs.location?.name ?? 'No location'}{cs.general_call_time ? ` · General call ${cs.general_call_time}` : ''}</div>
        </div>
        {canEdit && <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {(items ?? []).map((it) => (
          <div key={it.id} className="flex items-center justify-between px-3.5 py-1.5 text-sm">
            <span>{it.role_or_name}</span>
            <div className="flex items-center gap-2">
              {it.call_time && <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock size={11} /> {it.call_time}</span>}
              {canEdit && <button onClick={() => delItem.mutate({ id: it.id, callSheetId: cs.id })} className="w-5 h-5 flex items-center justify-center rounded" style={{ color: 'var(--text-muted)' }}><X size={12} /></button>}
            </div>
          </div>
        ))}
        {(items?.length ?? 0) === 0 && <div className="px-3.5 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>No call times added.</div>}
      </div>
      {canEdit && (
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-t" style={{ borderColor: 'var(--border)' }}>
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role / name" className="flex-1 rounded-md px-2.5 py-1.5 text-sm outline-none" style={inputStyle} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-md px-2.5 py-1.5 text-sm outline-none" style={inputStyle} />
          <button onClick={add} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><Plus size={13} /> Add</button>
        </div>
      )}
    </div>
  );
}

export default function CallSheetsTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: sheets, isLoading } = useCallSheets(projectId);
  const save = useSaveCallSheet();
  const del = useDeleteCallSheet();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ shoot_date: '', day_number: '1', location_id: '', general_call_time: '', notes: '' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.shoot_date) return;
    await save.mutateAsync({ project_id: projectId, shoot_date: form.shoot_date, day_number: Number(form.day_number) || 1, location_id: form.location_id || null, general_call_time: form.general_call_time || null, notes: form.notes.trim() || null });
    setForm({ shoot_date: '', day_number: '1', location_id: '', general_call_time: '', notes: '' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> New Call Sheet</button></div>}

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (sheets?.length ?? 0) === 0 ? (
        <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <Clapperboard size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No call sheets yet.</p>
        </div>
      ) : (
        <div className="space-y-3">{sheets!.map((cs) => <CallSheetCard key={cs.id} cs={cs} canEdit={canEdit} onDelete={() => del.mutate({ id: cs.id, projectId })} />)}</div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Call Sheet"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Create</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Shoot date *</label><input type="date" value={form.shoot_date} onChange={(e) => set('shoot_date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Day #</label><input type="number" value={form.day_number} onChange={(e) => set('day_number', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></div>
          </div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Location</label><LocationSelect value={form.location_id} onChange={(id) => set('location_id', id)} /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>General call time</label><input type="time" value={form.general_call_time} onChange={(e) => set('general_call_time', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label><input value={form.notes} onChange={(e) => set('notes', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Optional" /></div>
        </div>
      </Modal>
    </div>
  );
}
