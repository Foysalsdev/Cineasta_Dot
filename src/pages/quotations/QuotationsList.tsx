import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuotations, useCreateQuotation } from '../../hooks/useQuotations';
import { useProjects } from '../../hooks/useProjects';
import { Modal } from '../../components/ui/Modal';
import { formatBDT, formatDate } from '../../lib/format';
import { quotationStatusMeta } from '../../lib/quotationCategories';

const inputStyle = {
  background: 'var(--input-bg)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
};

function NewQuotationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { data: projects } = useProjects();
  const create = useCreateQuotation();
  const [projectId, setProjectId] = useState('');
  const [brand, setBrand] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!projectId) return setError('Choose a project.');
    if (!brand.trim()) return setError('Enter a brand title.');
    setError(null);
    try {
      const id = await create.mutateAsync({ projectId, brandTitle: brand.trim() });
      onClose();
      navigate(`/quotations/${id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Could not create quotation.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Quotation"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={create.isPending}
            className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--brand)' }}
          >
            {create.isPending && <Loader2 size={14} className="animate-spin" />}
            Create &amp; open
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Project *</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>
            <option value="">Select a project…</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Brand title *</label>
          <input autoFocus value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="e.g. Pran Mango Juice" />
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          The 14 standard budget categories and your saved Terms &amp; Conditions are added automatically.
        </p>
        {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
      </div>
    </Modal>
  );
}

export default function QuotationsList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('quotations', 'can_create');

  const { data: quotations, isLoading } = useQuotations();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quotations ?? [];
    return (quotations ?? []).filter((x) =>
      [x.quotation_number, x.brand_title, x.project?.title, x.project?.client?.name]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [quotations, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Quotations</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {quotations?.length ?? 0} quotation{(quotations?.length ?? 0) === 1 ? '' : 's'}
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white shrink-0" style={{ background: 'var(--brand)' }}>
            <Plus size={14} /> New Quotation
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm max-w-sm" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search number, brand, project…" className="bg-transparent outline-none flex-1" style={{ color: 'var(--text-primary)' }} />
      </div>

      <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Quotation</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden sm:table-cell">Project</th>
              <th className="text-right font-medium px-3.5 py-2.5">Total</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden md:table-cell">Status</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-3.5 py-12 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3.5 py-14 text-center">
                  <FileText size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{search ? 'No quotations match your search.' : 'No quotations yet.'}</p>
                  {!search && canCreate && (
                    <button onClick={() => setModalOpen(true)} className="mt-3 text-sm px-3 py-1.5 rounded-md" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                      Create your first quotation
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((x) => {
                const meta = quotationStatusMeta(x.status);
                return (
                  <tr key={x.id} onClick={() => navigate(`/quotations/${x.id}`)} className="border-t cursor-pointer hover:bg-[var(--brand-soft)]" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-3.5 py-3">
                      <div className="font-medium">{x.brand_title}</div>
                      <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{x.quotation_number}</div>
                    </td>
                    <td className="px-3.5 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      <div className="truncate">{x.project?.title ?? '—'}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{x.project?.client?.company || x.project?.client?.name || ''}</div>
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-medium">{formatBDT(x.total_amount)}</td>
                    <td className="px-3.5 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
                    </td>
                    <td className="px-3.5 py-3 hidden lg:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(x.quotation_date)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <NewQuotationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
