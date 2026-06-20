import { useState } from 'react';
import { Plus, Loader2, Radio, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useBroadcastRights, useSaveBroadcastRight, useRenewRight, useDeleteRight } from '../../hooks/usePostProd';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function BroadcastRightsTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: rights, isLoading } = useBroadcastRights(projectId);
  const save = useSaveBroadcastRight();
  const renew = useRenewRight();
  const del = useDeleteRight();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ delivery_date: '', renewal_fee_pct: '15', is_ovc_used_for_tv: false });

  async function handleSave() {
    if (!form.delivery_date) return;
    await save.mutateAsync({ project_id: projectId, delivery_date: form.delivery_date, renewal_fee_pct: Number(form.renewal_fee_pct) || 15, is_ovc_used_for_tv: form.is_ovc_used_for_tv });
    setForm({ delivery_date: '', renewal_fee_pct: '15', is_ovc_used_for_tv: false });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add Rights</button></div>}

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (rights?.length ?? 0) === 0 ? (
        <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <Radio size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No broadcast rights tracked yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rights!.map((r) => {
            const days = daysUntil(r.expiry_date);
            const expiringSoon = days != null && days <= 60;
            const expired = days != null && days < 0;
            return (
              <div key={r.id} className="rounded-md border px-3.5 py-3" style={{ borderColor: expired ? '#EF4444' : 'var(--border)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2">
                      Delivered {formatDate(r.delivery_date)}
                      {r.is_ovc_used_for_tv && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>OVC→TV</span>}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Expires {formatDate(r.expiry_date)} · Renewal fee {r.renewal_fee_pct}%
                      {r.last_renewed_date ? ` · Last renewed ${formatDate(r.last_renewed_date)}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {expired ? (
                      <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: '#EF444422', color: '#EF4444' }}><AlertTriangle size={11} /> Expired</span>
                    ) : expiringSoon ? (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F59E0B22', color: '#F59E0B' }}>{days}d left</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#2ECC7122', color: '#2ECC71' }}>Active</span>
                    )}
                    {canEdit && <button onClick={() => renew.mutate({ id: r.id, projectId })} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><RefreshCw size={11} /> Renew</button>}
                    {canEdit && <button onClick={() => del.mutate({ id: r.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Broadcast Rights"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Add</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Delivery date *</label><input type="date" value={form.delivery_date} onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Renewal fee %</label><input type="number" value={form.renewal_fee_pct} onChange={(e) => setForm((f) => ({ ...f, renewal_fee_pct: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.is_ovc_used_for_tv} onChange={(e) => setForm((f) => ({ ...f, is_ovc_used_for_tv: e.target.checked }))} style={{ accentColor: 'var(--brand)', width: 15, height: 15 }} />
            OVC used for TV (extra charge applies)
          </label>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Rights expire 2 years from delivery (auto). You'll see a warning 60 days before expiry.</p>
        </div>
      </Modal>
    </div>
  );
}
