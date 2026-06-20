import { useState } from 'react';
import { Plus, Loader2, Check, FileText } from 'lucide-react';
import { usePurchaseOrders, useCreatePO, useTogglePOReceipt, PurchaseOrder } from '../../hooks/useFinance';
import { useProjects } from '../../hooks/useProjects';
import { Modal } from '../../components/ui/Modal';
import { formatBDT, formatDate } from '../../lib/format';
import { poStatusMeta } from '../../lib/financeMeta';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

function NewPOModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: projects } = useProjects();
  const create = useCreatePO();
  const [projectId, setProjectId] = useState('');
  const [total, setTotal] = useState('');
  const [advancePct, setAdvancePct] = useState('75');
  const [error, setError] = useState<string | null>(null);

  const totalN = Number(total) || 0;
  const pctN = Number(advancePct) || 0;
  const advance = Math.round((totalN * pctN) / 100);

  async function handleCreate() {
    if (!projectId) return setError('Choose a project.');
    if (totalN <= 0) return setError('Enter the PO total.');
    setError(null);
    try {
      await create.mutateAsync({ projectId, total: totalN, advancePct: pctN });
      onClose();
    } catch (e: any) { setError(e?.message ?? 'Could not create PO.'); }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Purchase Order"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={create.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>
            {create.isPending && <Loader2 size={14} className="animate-spin" />} Create PO
          </button>
        </>
      }>
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Project *</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>
            <option value="">Select a project…</option>
            {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.code} — {p.title}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>PO Total (৳) *</label>
            <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} placeholder="0" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Advance %</label>
            <input type="number" value={advancePct} onChange={(e) => setAdvancePct(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} />
          </div>
        </div>
        <div className="rounded-md border px-3 py-2.5 text-sm flex justify-between" style={{ borderColor: 'var(--border)', background: 'var(--table-head)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Advance ({pctN}%): <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{formatBDT(advance)}</span></span>
          <span style={{ color: 'var(--text-secondary)' }}>Final: <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{formatBDT(totalN - advance)}</span></span>
        </div>
        {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
      </div>
    </Modal>
  );
}

function ReceiptCell({ po, part, canEdit }: { po: PurchaseOrder; part: 'advance' | 'final'; canEdit: boolean }) {
  const toggle = useTogglePOReceipt();
  const received = part === 'advance' ? po.advance_received : po.final_received;
  const amount = part === 'advance' ? po.advance_amount : po.final_amount;
  const date = part === 'advance' ? po.advance_received_date : po.final_received_date;
  return (
    <div className="flex items-center gap-2">
      <button
        disabled={!canEdit || toggle.isPending}
        onClick={() => toggle.mutate({ id: po.id, part, value: !received })}
        className="w-4 h-4 rounded flex items-center justify-center shrink-0"
        style={{ background: received ? 'var(--brand)' : 'transparent', border: `1px solid ${received ? 'var(--brand)' : 'var(--border)'}` }}
        title={received ? 'Received' : 'Mark received'}
      >
        {received && <Check size={11} color="#fff" />}
      </button>
      <div className="leading-tight">
        <div className="font-mono text-sm">{formatBDT(amount)}</div>
        {received && date && <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatDate(date)}</div>}
      </div>
    </div>
  );
}

export default function PurchaseOrdersTab({ canEdit }: { canEdit: boolean }) {
  const { data: pos, isLoading } = usePurchaseOrders();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canEdit && (
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}>
            <Plus size={14} /> New PO
          </button>
        )}
      </div>

      <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">PO / Project</th>
              <th className="text-right font-medium px-3.5 py-2.5">Total</th>
              <th className="text-left font-medium px-3.5 py-2.5">Advance (75%)</th>
              <th className="text-left font-medium px-3.5 py-2.5">Final (25%)</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden md:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-3.5 py-12 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></td></tr>
            ) : (pos?.length ?? 0) === 0 ? (
              <tr><td colSpan={5} className="px-3.5 py-14 text-center">
                <FileText size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No purchase orders yet.</p>
              </td></tr>
            ) : (
              pos!.map((po) => {
                const meta = poStatusMeta(po.status);
                return (
                  <tr key={po.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-3.5 py-3">
                      <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{po.po_number}</div>
                      <div className="font-medium">{po.project?.title ?? '—'}</div>
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-medium">{formatBDT(po.total_amount)}</td>
                    <td className="px-3.5 py-3"><ReceiptCell po={po} part="advance" canEdit={canEdit} /></td>
                    <td className="px-3.5 py-3"><ReceiptCell po={po} part="final" canEdit={canEdit} /></td>
                    <td className="px-3.5 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <NewPOModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
