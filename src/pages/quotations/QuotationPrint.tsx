import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { useQuotation } from '../../hooks/useQuotations';
import { formatBDT, formatDate } from '../../lib/format';
import { Logo } from '../../components/ui/Logo';

export default function QuotationPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuotation(id);

  if (isLoading) {
    return <div className="py-20 text-center"><Loader2 size={20} className="mx-auto animate-spin opacity-50" /></div>;
  }
  if (!data) {
    return <div className="py-20 text-center text-sm">Quotation not found.</div>;
  }

  const { quotation: q, items, terms } = data;
  const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

  const detailRow = (label: string, value?: string | number | null) => (
    <div className="flex text-[12px] py-0.5">
      <span className="w-40 shrink-0" style={{ color: '#555' }}>{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  );

  return (
    <div style={{ background: '#f3f3f3', minHeight: '100vh' }}>
      <div className="no-print flex items-center justify-between px-5 py-3" style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0 }}>
        <button onClick={() => navigate(`/quotations/${q.id}`)} className="flex items-center gap-1.5 text-sm" style={{ color: '#555' }}>
          <ArrowLeft size={15} /> Back to editor
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-md text-white font-medium" style={{ background: '#1A5C38' }}>
          <Printer size={14} /> Print / Save as PDF
        </button>
      </div>

      <div className="quote-sheet" style={{ maxWidth: 794, margin: '20px auto', background: '#fff', color: '#111', padding: 40, boxShadow: '0 1px 8px rgba(0,0,0,0.12)' }}>
        <div className="flex items-start justify-between" style={{ borderBottom: '2px solid #1A5C38', paddingBottom: 12, marginBottom: 16 }}>
          <div className="flex items-center" style={{ gap: 12 }}>
            <Logo size={48} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1A5C38', letterSpacing: '0.5px' }}>Cineasta Dot</div>
              <div style={{ fontSize: 11, color: '#777' }}>Production House</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>QUOTATION</div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#555' }}>{q.quotation_number}</div>
            <div style={{ fontSize: 11, color: '#777' }}>Date: {formatDate(q.quotation_date)}</div>
            {q.valid_until && <div style={{ fontSize: 11, color: '#777' }}>Valid until: {formatDate(q.valid_until)}</div>}
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Production Detail</div>
        <div className="grid grid-cols-2 gap-x-8" style={{ marginBottom: 18 }}>
          <div>
            {detailRow('Brand Title', q.brand_title)}
            {detailRow('Agency', q.agency_name)}
            {detailRow('Client', q.project?.client?.company || q.project?.client?.name)}
            {detailRow('Product', q.product_name)}
            {detailRow('Film Title', q.film_title)}
          </div>
          <div>
            {detailRow('Film Format', q.film_format)}
            {detailRow('Master Film Duration', q.master_film_duration)}
            {detailRow('Shooting Days', q.shooting_days)}
            {detailRow('No. of Shifts', q.number_of_shifts)}
            {detailRow('Shooting City', q.shooting_city)}
            {detailRow('Language', q.language)}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#1A5C38', color: '#fff' }}>
              <th style={{ textAlign: 'left', padding: '7px 10px', width: 36 }}>#</th>
              <th style={{ textAlign: 'left', padding: '7px 10px' }}>Items / Job Description</th>
              <th style={{ textAlign: 'right', padding: '7px 10px', width: 150 }}>Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 10px', color: '#888', fontFamily: 'monospace' }}>{i + 1}</td>
                <td style={{ padding: '6px 10px' }}>{it.category}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{formatBDT(it.amount)}</td>
              </tr>
            ))}
            <tr style={{ background: '#f4faf6', borderTop: '2px solid #1A5C38' }}>
              <td />
              <td style={{ padding: '9px 10px', fontWeight: 700 }}>Total</td>
              <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#1A5C38' }}>{formatBDT(total)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 10, color: '#888', textAlign: 'right', marginTop: 4 }}>EXCLUDING TAX &amp; VAT</div>

        {terms && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Terms &amp; Conditions</div>
            <pre style={{ fontSize: 9.5, lineHeight: 1.5, color: '#333', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{terms}</pre>
          </div>
        )}

        <div style={{ marginTop: 22, fontSize: 10, color: '#888', borderTop: '1px solid #eee', paddingTop: 8 }}>
          By proceeding with the project, all terms and conditions stated herein are considered agreed upon and accepted.
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .quote-sheet { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; padding: 0 !important; }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>
    </div>
  );
}
