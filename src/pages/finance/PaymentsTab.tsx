import { useState } from 'react';
import { Plus, Loader2, Wallet } from 'lucide-react';
import { usePayments, useCreatePayment } from '../../hooks/useFinance';
import { useProjects } from '../../hooks/useProjects';
import { Modal } from '../../components/ui/Modal';
import { formatBDT, formatDate } from '../../lib/format';
import { PAYMENT_METHODS } from '../../lib/financeMeta';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

function NewPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: projects } = useProjects();
  const create = useCreatePayment();
  const [form, setForm] = useState({ projectId: '', amount: '', date: new Date().toISOString().slice(0, 10), method: 'Cheque', notes: '' });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleCreate() {
    if (!form.projectId) return setError('Choose a project.');
    if ((Number(form.amount) || 0) <= 0) return setError('Enter an amount.');
    setError(null);
    try {
      await create.mutateAsync({ projectId: form.projectId, amount: Number(form.amount), date: form.date, method: form.method, notes: form.notes });
      onClose();
    } catch (e: any) { setError(e?.message ?? 'Could not record payment.'); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Record Payment"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={create.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>
            {create.isPending && <Loader2 size={14} className="animate-spin" />} Record
          </button>
        </>
      }>
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Project *</label>
          <select value={form.projectId} onChange={(e) => set('projectId', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>
            <option value="">Select a project…</option>
            {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.code} — {p.title}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (৳) *</label>
            <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} placeholder="0" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Method</label>
          <select value={form.method} onChange={(e) => set('method', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
          <input value={form.notes} onChange={(e) => set('notes', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Cheque no, reference…" />
        </div>
        {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
      </div>
    </Modal>
  );
}

export default function PaymentsTab({ canEdit }: { canEdit: boolean }) {
  const { data: payments, isLoading } = usePayments();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canEdit && (
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}>
            <Plus size={14} /> Record Payment
          </button>
        )}
      </div>

      <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Date</th>
              <th className="text-left font-medium px-3.5 py-2.5">Project</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden sm:table-cell">Method</th>
              <th className="text-right font-medium px-3.5 py-2.5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-3.5 py-12 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></td></tr>
            ) : (payments?.length ?? 0) === 0 ? (
              <tr><td colSpan={4} className="px-3.5 py-14 text-center">
                <Wallet size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No payments recorded yet.</p>
              </td></tr>
            ) : (
              payments!.map((p) => (
                <tr key={p.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3.5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(p.payment_date)}</td>
                  <td className="px-3.5 py-3">
                    <div className="font-medium">{p.project?.title ?? '—'}</div>
                    {p.notes && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.notes}</div>}
                  </td>
                  <td className="px-3.5 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{p.method ?? '—'}</td>
                  <td className="px-3.5 py-3 text-right font-mono font-medium" style={{ color: 'var(--brand)' }}>{formatBDT(p.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <NewPaymentModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
