import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Printer, Trash2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useQuotation, useSaveQuotationHeader, useDeleteQuotation, Quotation,
} from '../../hooks/useQuotations';
import { Panel } from '../../components/ui/Panel';
import { Modal } from '../../components/ui/Modal';
import { formatBDT } from '../../lib/format';
import { FILM_FORMATS, QUOTATION_STATUSES, quotationStatusMeta } from '../../lib/quotationCategories';
import BudgetDetailsTab from './BudgetDetailsTab';
import TeamTab from './TeamTab';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const TABS = ['Summary', 'Details', 'Team'] as const;
type Tab = (typeof TABS)[number];

function HeaderField({ label, value, onChange, type = 'text', readOnly = false }: {
  label: string; value: string; onChange?: (v: string) => void; type?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input type={type} value={value} readOnly={readOnly} onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-md px-2.5 py-1.5 text-sm outline-none" style={{ ...inputStyle, opacity: readOnly ? 0.7 : 1 }} />
    </div>
  );
}

export default function QuotationBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('quotations', 'can_edit');
  const canDelete = hasPermission('quotations', 'can_delete');

  const { data, isLoading } = useQuotation(id);
  const saveHeader = useSaveQuotationHeader();
  const del = useDeleteQuotation();

  const [header, setHeader] = useState<Partial<Quotation>>({});
  const [tab, setTab] = useState<Tab>('Summary');
  const [termsOpen, setTermsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      const q = data.quotation;
      setHeader({
        brand_title: q.brand_title, film_format: q.film_format ?? '', shooting_days: q.shooting_days,
        quotation_date: q.quotation_date, agency_name: q.agency_name ?? '', product_name: q.product_name ?? '',
        film_title: q.film_title ?? '', master_film_duration: q.master_film_duration ?? '',
        shooting_city: q.shooting_city ?? '', number_of_shifts: q.number_of_shifts,
        language: q.language ?? 'Bangla', status: q.status, vat_applicable: q.vat_applicable,
      });
    }
  }, [data]);

  if (isLoading) return <div className="py-20 text-center"><Loader2 size={20} className="mx-auto animate-spin opacity-50" /></div>;
  if (!data) {
    return (
      <div className="py-20 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Quotation not found.
        <button onClick={() => navigate('/quotations')} className="block mx-auto mt-3" style={{ color: 'var(--brand)' }}>&larr; Back</button>
      </div>
    );
  }

  const { quotation, items } = data;
  const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const meta = quotationStatusMeta(header.status ?? quotation.status);
  const setH = (k: keyof Quotation, v: any) => { setHeader((h) => ({ ...h, [k]: v })); setSaved(false); };

  async function doSaveHeader() {
    await saveHeader.mutateAsync({
      id: quotation.id,
      header: {
        ...header,
        shooting_days: header.shooting_days ? Number(header.shooting_days) : null,
        number_of_shifts: header.number_of_shifts ? Number(header.number_of_shifts) : null,
        film_format: header.film_format || null,
      },
    });
    setSaved(true);
  }

  async function saveThenPrint() {
    if (canEdit) await doSaveHeader();
    navigate(`/quotations/${quotation.id}/print`);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => navigate('/quotations')} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={15} /> Quotations
        </button>
        <div className="flex items-center gap-2">
          <button onClick={saveThenPrint} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>
            <Printer size={14} /> Print / PDF
          </button>
          {canEdit && (
            <button onClick={doSaveHeader} disabled={saveHeader.isPending} className="flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-md text-white font-medium disabled:opacity-50" style={{ background: 'var(--brand)' }}>
              {saveHeader.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saved ? 'Saved' : 'Save details'}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <h1 className="text-lg font-semibold">{quotation.brand_title}</h1>
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{quotation.quotation_number}</span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
        <button onClick={() => navigate(`/projects/${quotation.project_id}`)} className="text-xs" style={{ color: 'var(--brand)' }}>
          {quotation.project?.code} &middot; {quotation.project?.title}
        </button>
      </div>

      <Panel title="Production Detail">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-3.5 py-3.5">
          <HeaderField label="Brand Title" value={String(header.brand_title ?? '')} onChange={(v) => setH('brand_title', v)} readOnly={!canEdit} />
          <div>
            <label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Film Format</label>
            <select disabled={!canEdit} value={header.film_format ?? ''} onChange={(e) => setH('film_format', e.target.value)} className="w-full rounded-md px-2.5 py-1.5 text-sm outline-none" style={inputStyle}>
              <option value="">&mdash;</option>
              {FILM_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <HeaderField label="Shooting Days" type="number" value={String(header.shooting_days ?? '')} onChange={(v) => setH('shooting_days', v)} readOnly={!canEdit} />
          <HeaderField label="Date" type="date" value={String(header.quotation_date ?? '')} onChange={(v) => setH('quotation_date', v)} readOnly={!canEdit} />
          <HeaderField label="Agency" value={String(header.agency_name ?? '')} onChange={(v) => setH('agency_name', v)} readOnly={!canEdit} />
          <HeaderField label="Product" value={String(header.product_name ?? '')} onChange={(v) => setH('product_name', v)} readOnly={!canEdit} />
          <HeaderField label="Film Title" value={String(header.film_title ?? '')} onChange={(v) => setH('film_title', v)} readOnly={!canEdit} />
          <HeaderField label="Master Duration" value={String(header.master_film_duration ?? '')} onChange={(v) => setH('master_film_duration', v)} readOnly={!canEdit} />
          <HeaderField label="Shooting City" value={String(header.shooting_city ?? '')} onChange={(v) => setH('shooting_city', v)} readOnly={!canEdit} />
          <HeaderField label="No. of Shifts" type="number" value={String(header.number_of_shifts ?? '')} onChange={(v) => setH('number_of_shifts', v)} readOnly={!canEdit} />
          <HeaderField label="Language" value={String(header.language ?? '')} onChange={(v) => setH('language', v)} readOnly={!canEdit} />
          <div>
            <label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Status</label>
            <select disabled={!canEdit} value={header.status ?? 'draft'} onChange={(e) => setH('status', e.target.value)} className="w-full rounded-md px-2.5 py-1.5 text-sm outline-none" style={inputStyle}>
              {QUOTATION_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </Panel>

      <div className="border-b flex gap-1" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2 text-sm -mb-px border-b-2"
            style={{ borderColor: tab === t ? 'var(--brand)' : 'transparent', color: tab === t ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: tab === t ? 600 : 400 }}>
            {t === 'Summary' ? 'Budget Summary' : t === 'Details' ? 'Budget Details' : 'Team List'}
          </button>
        ))}
      </div>

      {tab === 'Summary' && (
        <div className="space-y-4">
          <Panel title="Budget Summary — Production Cost">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
                  <th className="text-left font-medium px-3.5 py-2 w-10">#</th>
                  <th className="text-left font-medium px-3.5 py-2">Job Description</th>
                  <th className="text-right font-medium px-3.5 py-2 w-48">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-3.5 py-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td className="px-3.5 py-2">{it.category}</td>
                    <td className="px-3.5 py-2 text-right font-mono">{formatBDT(it.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--table-head)' }}>
                  <td />
                  <td className="px-3.5 py-2.5 font-semibold">Total</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-base" style={{ color: 'var(--brand)' }}>{formatBDT(total)}</td>
                </tr>
              </tbody>
            </table>
            <p className="px-3.5 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              Excluding TAX &amp; VAT. These totals are calculated from the Budget Details tab.
            </p>
          </Panel>

          <div className="rounded-md border" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setTermsOpen((o) => !o)} className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium" style={{ background: 'var(--table-head)' }}>
              <span>Terms &amp; Conditions</span>
              <ChevronDown size={16} style={{ transform: termsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
            </button>
            {termsOpen && <pre className="px-3.5 py-3 text-xs whitespace-pre-wrap font-sans" style={{ color: 'var(--text-secondary)' }}>{data.terms || 'No terms template set.'}</pre>}
          </div>
        </div>
      )}

      {tab === 'Details' && (
        <BudgetDetailsTab quotationId={quotation.id} details={data.details} canEdit={canEdit} />
      )}

      {tab === 'Team' && (
        <TeamTab projectId={quotation.project_id} canEdit={canEdit} />
      )}

      {canDelete && tab === 'Summary' && (
        <div className="pt-2">
          <button onClick={() => setConfirmOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md" style={{ background: 'var(--input-bg)', color: '#EF4444' }}>
            <Trash2 size={14} /> Delete quotation
          </button>
        </div>
      )}

      <Modal open={confirmOpen} title="Delete quotation?" onClose={() => setConfirmOpen(false)} width={420}
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={async () => { await del.mutateAsync(quotation.id); navigate('/quotations'); }} disabled={del.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: '#EF4444' }}>
              {del.isPending && <Loader2 size={14} className="animate-spin" />} Delete
            </button>
          </>
        }>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{quotation.quotation_number}</span> and its budget rows will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}
