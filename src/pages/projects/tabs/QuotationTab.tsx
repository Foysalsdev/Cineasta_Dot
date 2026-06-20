import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, FileText, ExternalLink, Printer, RefreshCw } from 'lucide-react';
import { useProjectQuotations, useReviseQuotation } from '../../../hooks/useProjectQuotations';
import { useCreateQuotation } from '../../../hooks/useQuotations';
import { quotationStatusMeta } from '../../../lib/quotationCategories';
import { formatBDT, formatDate } from '../../../lib/format';

export default function QuotationTab({ projectId, projectTitle, canEdit }: { projectId: string; projectTitle: string; canEdit: boolean }) {
  const navigate = useNavigate();
  const { data: quotes, isLoading } = useProjectQuotations(projectId);
  const create = useCreateQuotation();
  const revise = useReviseQuotation();

  const current = quotes?.find((q) => q.is_current) ?? quotes?.[0];

  async function handleCreate() {
    const id = await create.mutateAsync({ projectId, brandTitle: projectTitle });
    navigate(`/quotations/${id}`);
  }
  async function handleRevise() {
    if (!current) return;
    const id = await revise.mutateAsync({ currentId: current.id, projectId });
    navigate(`/quotations/${id}`);
  }

  if (isLoading) return <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>;

  if (!quotes || quotes.length === 0) {
    return (
      <div className="rounded-lg border px-4 py-12 text-center shadow-card" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <FileText size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No quotation yet.</p>
        {canEdit && <button onClick={handleCreate} disabled={create.isPending} className="mt-3 inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-md text-white font-medium disabled:opacity-50" style={{ background: 'var(--brand)' }}>{create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Quotation</button>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end gap-2">
          {current && <button onClick={handleRevise} disabled={revise.isPending} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md disabled:opacity-50" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>{revise.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Revise (new version)</button>}
        </div>
      )}

      <div className="rounded-lg border overflow-hidden shadow-card" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Version</th>
              <th className="text-left font-medium px-3.5 py-2.5">Status</th>
              <th className="text-right font-medium px-3.5 py-2.5">Total</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden sm:table-cell">Date</th>
              <th className="px-3.5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const meta = quotationStatusMeta(q.status);
              return (
                <tr key={q.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3.5 py-3">
                    <span className="font-medium">V{q.version}</span>
                    {q.is_current && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>current</span>}
                    <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{q.quotation_number}</div>
                  </td>
                  <td className="px-3.5 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span></td>
                  <td className="px-3.5 py-3 text-right font-mono font-medium">{formatBDT(q.total_amount)}</td>
                  <td className="px-3.5 py-3 hidden sm:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(q.created_at)}</td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => navigate(`/quotations/${q.id}`)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><ExternalLink size={12} /> Open</button>
                      <button onClick={() => navigate(`/quotations/${q.id}/print`)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}><Printer size={12} /> Print</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>The current version's total is this project's Budget &amp; Revenue. Revising keeps all old versions.</p>
    </div>
  );
}
