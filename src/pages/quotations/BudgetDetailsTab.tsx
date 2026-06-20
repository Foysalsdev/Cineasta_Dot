import { useMemo, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { BudgetDetail, useSaveBudgetDetails } from '../../hooks/useQuotations';
import { QUOTATION_CATEGORIES } from '../../lib/quotationCategories';
import { formatBDT } from '../../lib/format';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

interface RowState { day: string; unit_cost: string; amount: number; }

export default function BudgetDetailsTab({
  quotationId, details, canEdit,
}: {
  quotationId: string;
  details: BudgetDetail[];
  canEdit: boolean;
}) {
  const save = useSaveBudgetDetails();
  const [saved, setSaved] = useState(false);
  const [rows, setRows] = useState<Record<string, RowState>>(() => {
    const init: Record<string, RowState> = {};
    details.forEach((d) => {
      init[d.id] = {
        day: d.day != null ? String(d.day) : '',
        unit_cost: d.unit_cost != null ? String(d.unit_cost) : '',
        amount: Number(d.amount) || 0,
      };
    });
    return init;
  });

  const setField = (id: string, field: keyof RowState, value: string) => {
    setSaved(false);
    setRows((prev) => {
      const r = { ...prev[id] };
      if (field === 'amount') {
        r.amount = Number(value) || 0;
      } else {
        (r as any)[field] = value;
        const day = Number(field === 'day' ? value : r.day);
        const unit = Number(field === 'unit_cost' ? value : r.unit_cost);
        if (day > 0 && unit > 0) r.amount = day * unit; // auto day × unit
      }
      return { ...prev, [id]: r };
    });
  };

  const grouped = useMemo(
    () => QUOTATION_CATEGORIES.map((cat) => ({ cat, items: details.filter((d) => d.category === cat) })),
    [details],
  );

  const subtotal = (items: BudgetDetail[]) => items.reduce((s, it) => s + (rows[it.id]?.amount ?? 0), 0);
  const grandTotal = details.reduce((s, it) => s + (rows[it.id]?.amount ?? 0), 0);

  async function handleSave() {
    await save.mutateAsync({
      quotationId,
      rows: details.map((d) => ({
        id: d.id,
        category: d.category,
        day: rows[d.id]?.day ? Number(rows[d.id].day) : null,
        unit_cost: rows[d.id]?.unit_cost ? Number(rows[d.id].unit_cost) : null,
        amount: rows[d.id]?.amount ?? 0,
      })),
    });
    setSaved(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Enter Day × Unit cost (Amount auto-fills) or type the Amount directly. Category subtotals update the Budget Summary.
        </p>
        {canEdit && (
          <button onClick={handleSave} disabled={save.isPending} className="flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-md text-white font-medium disabled:opacity-50" style={{ background: 'var(--brand)' }}>
            {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? 'Saved' : 'Save details'}
          </button>
        )}
      </div>

      <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2">Job Description</th>
              <th className="text-right font-medium px-2 py-2 w-24">Day</th>
              <th className="text-right font-medium px-2 py-2 w-32">Unit Cost</th>
              <th className="text-right font-medium px-3.5 py-2 w-40">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ cat, items }) => (
              <ItemGroup key={cat} cat={cat} items={items} rows={rows} setField={setField} canEdit={canEdit} subtotal={subtotal(items)} />
            ))}
            <tr style={{ background: 'var(--table-head)', borderTop: '2px solid var(--brand)' }}>
              <td className="px-3.5 py-2.5 font-semibold" colSpan={3}>Grand Total</td>
              <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-base" style={{ color: 'var(--brand)' }}>{formatBDT(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemGroup({
  cat, items, rows, setField, canEdit, subtotal,
}: {
  cat: string;
  items: BudgetDetail[];
  rows: Record<string, RowState>;
  setField: (id: string, field: keyof RowState, value: string) => void;
  canEdit: boolean;
  subtotal: number;
}) {
  return (
    <>
      <tr style={{ background: 'var(--brand-soft)' }}>
        <td className="px-3.5 py-1.5 font-semibold" style={{ color: 'var(--brand)' }} colSpan={3}>{cat}</td>
        <td className="px-3.5 py-1.5 text-right font-mono font-semibold" style={{ color: 'var(--brand)' }}>{formatBDT(subtotal)}</td>
      </tr>
      {items.map((it) => {
        const r = rows[it.id];
        return (
          <tr key={it.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
            <td className="px-3.5 py-1.5 pl-6" style={{ color: 'var(--text-secondary)' }}>{it.job_description}</td>
            <td className="px-2 py-1">
              <input type="number" readOnly={!canEdit} value={r?.day ?? ''} onChange={(e) => setField(it.id, 'day', e.target.value)} className="w-20 rounded px-2 py-1 text-sm text-right outline-none font-mono" style={inputStyle} />
            </td>
            <td className="px-2 py-1">
              <input type="number" readOnly={!canEdit} value={r?.unit_cost ?? ''} onChange={(e) => setField(it.id, 'unit_cost', e.target.value)} className="w-28 rounded px-2 py-1 text-sm text-right outline-none font-mono" style={inputStyle} />
            </td>
            <td className="px-3.5 py-1 text-right">
              <input type="number" readOnly={!canEdit} value={r?.amount ?? 0} onChange={(e) => setField(it.id, 'amount', e.target.value)} className="w-36 rounded px-2 py-1 text-sm text-right outline-none font-mono" style={inputStyle} />
            </td>
          </tr>
        );
      })}
    </>
  );
}
