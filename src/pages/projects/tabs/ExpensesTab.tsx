import { useMemo, useState } from 'react';
import { Plus, Loader2, Receipt, Trash2 } from 'lucide-react';
import {
  useProjectExpenses, useSaveExpense, useDeleteExpense,
  useExpenseCategoryNames, useVendorNames, useCurrentQuotationBudget,
} from '../../../hooks/useProjectMoney';
import { Modal } from '../../../components/ui/Modal';
import { Combobox } from '../../../components/ui/Combobox';
import { Panel } from '../../../components/ui/Panel';
import { formatBDT, formatDate } from '../../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

export default function ExpensesTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: expenses, isLoading } = useProjectExpenses(projectId);
  const { data: categories } = useExpenseCategoryNames();
  const { data: vendors } = useVendorNames();
  const { data: budget } = useCurrentQuotationBudget(projectId);
  const save = useSaveExpense();
  const del = useDeleteExpense();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: '', vendor: '', amount: '', spent_at: new Date().toISOString().slice(0, 10), note: '' });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const budgetMap = budget ?? {};

  async function handleSave() {
    if (!form.category.trim()) return setError('Pick a category.');
    if ((Number(form.amount) || 0) <= 0) return setError('Enter an amount.');
    setError(null);
    const isUnplanned = !(form.category.trim() in budgetMap);
    await save.mutateAsync({
      project_id: projectId, category: form.category.trim(), vendor: form.vendor.trim() || null,
      amount: Number(form.amount), note: form.note.trim() || null, spent_at: form.spent_at, is_unplanned: isUnplanned,
    });
    setForm({ category: '', vendor: '', amount: '', spent_at: new Date().toISOString().slice(0, 10), note: '' });
    setOpen(false);
  }

  // Budget vs Actual
  const actualByCat = useMemo(() => {
    const m: Record<string, number> = {};
    (expenses ?? []).forEach((e) => { m[e.category] = (m[e.category] ?? 0) + (Number(e.amount) || 0); });
    return m;
  }, [expenses]);

  const variance = useMemo(() => {
    const cats = new Set([...Object.keys(budgetMap), ...Object.keys(actualByCat)]);
    return Array.from(cats).map((c) => {
      const b = budgetMap[c] ?? 0; const a = actualByCat[c] ?? 0;
      return { category: c, budget: b, actual: a, variance: b - a, unplanned: !(c in budgetMap) };
    }).sort((x, y) => y.actual - x.actual);
  }, [budgetMap, actualByCat]);

  const totalExpense = (expenses ?? []).reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total expense: <span className="font-mono font-semibold" style={{ color: '#EF4444' }}>{formatBDT(totalExpense)}</span></p>
        {canEdit && <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add Expense</button>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense list */}
        <Panel title="Expenses">
          {isLoading ? (
            <div className="py-8 text-center"><Loader2 size={16} className="mx-auto animate-spin opacity-50" /></div>
          ) : (expenses?.length ?? 0) === 0 ? (
            <div className="px-3.5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              <Receipt size={20} className="mx-auto mb-2 opacity-40" /> No expenses yet.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {expenses!.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-3.5 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-1.5">
                      {e.category}{e.is_unplanned && <span title="not in quotation" className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#F59E0B22', color: '#F59E0B' }}>unplanned</span>}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(e.spent_at)}{e.vendor ? ` · ${e.vendor}` : ''}{e.note ? ` · ${e.note}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm">{formatBDT(e.amount)}</span>
                    {canEdit && <button onClick={() => del.mutate({ id: e.id, projectId })} className="w-6 h-6 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={12} /></button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Budget vs Actual */}
        <Panel title="Budget vs Actual">
          {variance.length === 0 ? (
            <div className="px-3.5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Create a quotation to compare against budget.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left font-medium px-3.5 py-2 text-xs">Category</th>
                  <th className="text-right font-medium px-2 py-2 text-xs">Budget</th>
                  <th className="text-right font-medium px-2 py-2 text-xs">Actual</th>
                  <th className="text-right font-medium px-3.5 py-2 text-xs">Variance</th>
                </tr>
              </thead>
              <tbody>
                {variance.map((v) => (
                  <tr key={v.category} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-3.5 py-1.5">{v.category}{v.unplanned && <span className="ml-1 text-[10px]" style={{ color: '#F59E0B' }}>🚩</span>}</td>
                    <td className="px-2 py-1.5 text-right font-mono" style={{ color: 'var(--text-muted)' }}>{formatBDT(v.budget)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{formatBDT(v.actual)}</td>
                    <td className="px-3.5 py-1.5 text-right font-mono" style={{ color: v.variance >= 0 ? '#2ECC71' : '#EF4444' }}>{formatBDT(v.variance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Expense"
        footer={<>
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Save</button>
        </>}>
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Category *</label>
            <Combobox value={form.category} onChange={(v) => set('category', v)} options={categories ?? []} placeholder="Type to search or add…" />
            {form.category.trim() && !(form.category.trim() in budgetMap) && <p className="text-[11px] mt-1" style={{ color: '#F59E0B' }}>Not in quotation → will be tagged Unplanned.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Vendor</label>
              <Combobox value={form.vendor} onChange={(v) => set('vendor', v)} options={vendors ?? []} placeholder="Vendor name" />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (৳) *</label>
              <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
              <input type="date" value={form.spent_at} onChange={(e) => set('spent_at', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Note</label>
              <input value={form.note} onChange={(e) => set('note', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} />
            </div>
          </div>
          {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
