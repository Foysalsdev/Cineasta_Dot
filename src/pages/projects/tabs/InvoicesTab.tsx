import { useState } from 'react';
import { Plus, Loader2, FileText, Trash2 } from 'lucide-react';
import { useProjectInvoices, useCreateInvoice, useSetInvoiceStatus, useDeleteInvoice } from '../../../hooks/useProjectExtras';
import { Modal } from '../../../components/ui/Modal';
import { formatBDT, formatDate } from '../../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const STATUS: Record<string, string> = { draft: '#6B7280', sent: '#3B82F6', paid: '#2ECC71', overdue: '#EF4444', cancelled: '#6B7280' };
const STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

export default function InvoicesTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: invoices, isLoading } = useProjectInvoices(projectId);
  const create = useCreateInvoice();
  const setStatus = useSetInvoiceStatus();
  const del = useDeleteInvoice();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ invoice_date: new Date().toISOString().slice(0, 10), due_date: '', subtotal: '', vat_pct: '0' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const sub = Number(form.subtotal) || 0;
  const vat = Math.round((sub * (Number(form.vat_pct) || 0)) / 100);

  async function handleCreate() {
    if (sub <= 0) return;
    await create.mutateAsync({ project_id: projectId, invoice_date: form.invoice_date, due_date: form.due_date || null, subtotal: sub, vat_pct: Number(form.vat_pct) || 0 });
    setForm({ invoice_date: new Date().toISOString().slice(0, 10), due_date: '', subtotal: '', vat_pct: '0' });
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{canEdit && <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Generate Invoice</button>}</div>

      <div className="rounded-lg border overflow-hidden shadow-card" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Invoice</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden sm:table-cell">Due</th>
              <th className="text-right font-medium px-3.5 py-2.5">Total</th>
              <th className="text-left font-medium px-3.5 py-2.5">Status</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-3.5 py-10 text-center"><Loader2 size={16} className="mx-auto animate-spin opacity-50" /></td></tr>
            ) : (invoices?.length ?? 0) === 0 ? (
              <tr><td colSpan={5} className="px-3.5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}><FileText size={20} className="mx-auto mb-2 opacity-40" /> No invoices yet.</td></tr>
            ) : invoices!.map((inv) => (
              <tr key={inv.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-3.5 py-2.5">
                  <div className="font-mono text-xs">{inv.invoice_number}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(inv.invoice_date)} · VAT {inv.vat_pct}%</div>
                </td>
                <td className="px-3.5 py-2.5 hidden sm:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>{inv.due_date ? formatDate(inv.due_date) : '—'}</td>
                <td className="px-3.5 py-2.5 text-right font-mono font-medium">{formatBDT(inv.total_amount)}</td>
                <td className="px-3.5 py-2.5">
                  {canEdit ? (
                    <select value={inv.status} onChange={(e) => setStatus.mutate({ id: inv.id, status: e.target.value, projectId })} className="text-xs rounded-full px-2 py-0.5 outline-none" style={{ background: `${STATUS[inv.status]}22`, color: STATUS[inv.status], border: 'none' }}>
                      {STATUSES.map((s) => <option key={s} value={s} style={{ color: 'var(--text-primary)', background: 'var(--card)' }}>{s}</option>)}
                    </select>
                  ) : <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${STATUS[inv.status]}22`, color: STATUS[inv.status] }}>{inv.status}</span>}
                </td>
                <td className="px-3.5 py-2.5">{canEdit && <button onClick={() => del.mutate({ id: inv.id, projectId })} className="w-6 h-6 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={12} /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Generate Invoice"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={create.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{create.isPending && <Loader2 size={14} className="animate-spin" />} Create</button>
        </>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Invoice date</label><input type="date" value={form.invoice_date} onChange={(e) => set('invoice_date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Due date</label><input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (subtotal) *</label><input type="number" value={form.subtotal} onChange={(e) => set('subtotal', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>VAT %</label><input type="number" value={form.vat_pct} onChange={(e) => set('vat_pct', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></div>
          </div>
          <div className="rounded-md border px-3 py-2 text-sm flex justify-between" style={{ borderColor: 'var(--border)', background: 'var(--table-head)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>VAT: <span className="font-mono">{formatBDT(vat)}</span></span>
            <span style={{ color: 'var(--text-secondary)' }}>Total: <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{formatBDT(sub + vat)}</span></span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
