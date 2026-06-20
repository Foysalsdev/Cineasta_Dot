import { useState } from 'react';
import { Plus, Loader2, Wallet, Trash2 } from 'lucide-react';
import { useProjectPayments, useCreateProjectPayment, useDeletePayment } from '../../../hooks/useProjectMoney';
import { useProjectFinancial } from '../../../hooks/useProjectFinance';
import { Modal } from '../../../components/ui/Modal';
import { Combobox } from '../../../components/ui/Combobox';
import { formatBDT, formatDate } from '../../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const METHODS = ['Cheque', 'Bank Transfer', 'Cash', 'bKash', 'Nagad', 'Card'];

export default function PaymentsTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: payments, isLoading } = useProjectPayments(projectId);
  const { data: fin } = useProjectFinancial(projectId);
  const create = useCreateProjectPayment();
  const del = useDeletePayment();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', payment_date: new Date().toISOString().slice(0, 10), method: 'Cheque', notes: '' });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if ((Number(form.amount) || 0) <= 0) return setError('Enter an amount.');
    setError(null);
    await create.mutateAsync({ project_id: projectId, amount: Number(form.amount), payment_date: form.payment_date, method: form.method || null, notes: form.notes.trim() || null });
    setForm({ amount: '', payment_date: new Date().toISOString().slice(0, 10), method: 'Cheque', notes: '' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border p-3.5 shadow-card" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Revenue</p>
          <p className="text-lg font-semibold font-mono mt-1">{formatBDT(fin?.revenue ?? 0)}</p>
        </div>
        <div className="rounded-lg border p-3.5 shadow-card" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Collected</p>
          <p className="text-lg font-semibold font-mono mt-1" style={{ color: '#2ECC71' }}>{formatBDT(fin?.collected ?? 0)}</p>
        </div>
        <div className="rounded-lg border p-3.5 shadow-card" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Outstanding</p>
          <p className="text-lg font-semibold font-mono mt-1" style={{ color: '#F59E0B' }}>{formatBDT(fin?.outstanding ?? 0)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        {canEdit && <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add Payment</button>}
      </div>

      <div className="rounded-lg border overflow-hidden shadow-card" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Date</th>
              <th className="text-left font-medium px-3.5 py-2.5">Method</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden sm:table-cell">Notes</th>
              <th className="text-right font-medium px-3.5 py-2.5">Amount</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-3.5 py-10 text-center"><Loader2 size={16} className="mx-auto animate-spin opacity-50" /></td></tr>
            ) : (payments?.length ?? 0) === 0 ? (
              <tr><td colSpan={5} className="px-3.5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}><Wallet size={20} className="mx-auto mb-2 opacity-40" /> No payments recorded.</td></tr>
            ) : payments!.map((p) => (
              <tr key={p.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-3.5 py-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(p.payment_date)}</td>
                <td className="px-3.5 py-2.5" style={{ color: 'var(--text-secondary)' }}>{p.method ?? '—'}</td>
                <td className="px-3.5 py-2.5 hidden sm:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>{p.notes ?? ''}</td>
                <td className="px-3.5 py-2.5 text-right font-mono font-medium" style={{ color: '#2ECC71' }}>{formatBDT(p.amount)}</td>
                <td className="px-3.5 py-2.5">{canEdit && <button onClick={() => del.mutate({ id: p.id, projectId })} className="w-6 h-6 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={12} /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Record Payment"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={create.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{create.isPending && <Loader2 size={14} className="animate-spin" />} Record</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (৳) *</label>
              <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
              <input type="date" value={form.payment_date} onChange={(e) => set('payment_date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Method</label>
            <Combobox value={form.method} onChange={(v) => set('method', v)} options={METHODS} placeholder="Payment method" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
            <input value={form.notes} onChange={(e) => set('notes', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Cheque no, reference…" />
          </div>
          {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
