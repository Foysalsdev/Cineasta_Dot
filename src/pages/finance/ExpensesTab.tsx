import { useState } from 'react';
import { Plus, Loader2, Receipt, Check, X } from 'lucide-react';
import { useExpenses, useCreateExpense, useSetExpenseApproval } from '../../hooks/useFinance';
import { useProjects } from '../../hooks/useProjects';
import { Modal } from '../../components/ui/Modal';
import { formatBDT, formatDate } from '../../lib/format';
import { EXPENSE_CATEGORIES, approvalMeta } from '../../lib/financeMeta';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

function NewExpenseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: projects } = useProjects();
  const create = useCreateExpense();
  const [form, setForm] = useState<{ scope: 'project' | 'agency'; projectId: string; category: string; amount: string; note: string; date: string }>({
    scope: 'project', projectId: '', category: EXPENSE_CATEGORIES[0], amount: '', note: '', date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleCreate() {
    if (form.scope === 'project' && !form.projectId) return setError('Choose a project (or switch to Agency).');
    if ((Number(form.amount) || 0) <= 0) return setError('Enter an amount.');
    setError(null);
    try {
      await create.mutateAsync({ scope: form.scope, projectId: form.projectId || null, category: form.category, amount: Number(form.amount), note: form.note, date: form.date });
      onClose();
    } catch (e: any) { setError(e?.message ?? 'Could not add expense.'); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Expense"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={create.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>
            {create.isPending && <Loader2 size={14} className="animate-spin" />} Add
          </button>
        </>
      }>
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Scope</label>
            <select value={form.scope} onChange={(e) => set('scope', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>
              <option value="project">Project</option>
              <option value="agency">Agency</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Project {form.scope === 'project' ? '*' : ''}</label>
            <select value={form.projectId} disabled={form.scope === 'agency'} onChange={(e) => set('projectId', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={{ ...inputStyle, opacity: form.scope === 'agency' ? 0.5 : 1 }}>
              <option value="">Select…</option>
              {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.code} — {p.title}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (৳) *</label>
            <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} placeholder="0" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Note</label>
            <input value={form.note} onChange={(e) => set('note', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Optional" />
          </div>
        </div>
        {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
      </div>
    </Modal>
  );
}

export default function ExpensesTab({ canEdit, canApprove }: { canEdit: boolean; canApprove: boolean }) {
  const { data: expenses, isLoading } = useExpenses();
  const approve = useSetExpenseApproval();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canEdit && (
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}>
            <Plus size={14} /> Add Expense
          </button>
        )}
      </div>

      <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Date</th>
              <th className="text-left font-medium px-3.5 py-2.5">Category / Project</th>
              <th className="text-right font-medium px-3.5 py-2.5">Amount</th>
              <th className="text-left font-medium px-3.5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-3.5 py-12 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></td></tr>
            ) : (expenses?.length ?? 0) === 0 ? (
              <tr><td colSpan={4} className="px-3.5 py-14 text-center">
                <Receipt size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No expenses recorded yet.</p>
              </td></tr>
            ) : (
              expenses!.map((ex) => {
                const meta = approvalMeta(ex.approval_status);
                return (
                  <tr key={ex.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-3.5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(ex.spent_at)}</td>
                    <td className="px-3.5 py-3">
                      <div className="font-medium">{ex.category}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{ex.scope === 'agency' ? 'Agency' : (ex.project?.title ?? 'Project')}{ex.note ? ` · ${ex.note}` : ''}</div>
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-medium">{formatBDT(ex.amount)}</td>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
                        {canApprove && ex.approval_status === 'pending' && (
                          <>
                            <button onClick={() => approve.mutate({ id: ex.id, status: 'approved' })} className="w-6 h-6 flex items-center justify-center rounded" style={{ background: 'var(--brand-soft)', color: '#2ECC71' }} title="Approve"><Check size={13} /></button>
                            <button onClick={() => approve.mutate({ id: ex.id, status: 'rejected' })} className="w-6 h-6 flex items-center justify-center rounded" style={{ background: 'var(--input-bg)', color: '#EF4444' }} title="Reject"><X size={13} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <NewExpenseModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
