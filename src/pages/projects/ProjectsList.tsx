import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, Clapperboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { useProjectFinancials } from '../../hooks/useProjectFinance';
import { stateMeta } from '../../lib/projectStatus';
import { formatBDT, formatDate } from '../../lib/format';
import ProjectForm from './ProjectForm';

export default function ProjectsList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('projects', 'can_create');

  const { data: projects, isLoading } = useProjects();
  const { data: fin } = useProjectFinancials();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects ?? [];
    return (projects ?? []).filter((p) =>
      [p.title, p.code, p.client?.name, p.client?.company].filter(Boolean).some((v) => v!.toLowerCase().includes(q)),
    );
  }, [projects, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{projects?.length ?? 0} projects · revenue, cost & profit at a glance</p>
        </div>
        {canCreate && (
          <button onClick={() => setFormOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white shrink-0" style={{ background: 'var(--brand)' }}>
            <Plus size={14} /> New Project
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm max-w-sm" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search project, code, client…" className="bg-transparent outline-none flex-1" style={{ color: 'var(--text-primary)' }} />
      </div>

      <div className="rounded-md border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm" style={{ minWidth: 940 }}>
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Project</th>
              <th className="text-left font-medium px-3 py-2.5">Status</th>
              <th className="text-right font-medium px-3 py-2.5">Revenue</th>
              <th className="text-right font-medium px-3 py-2.5">Cost</th>
              <th className="text-right font-medium px-3 py-2.5">Gross Profit</th>
              <th className="text-right font-medium px-3 py-2.5">Collected</th>
              <th className="text-right font-medium px-3 py-2.5">Outstanding</th>
              <th className="text-left font-medium px-3 py-2.5">Last Pmt</th>
              <th className="text-left font-medium px-3 py-2.5">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="px-3.5 py-12 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-3.5 py-14 text-center">
                <Clapperboard size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{search ? 'No projects match.' : 'No projects yet.'}</p>
                {!search && canCreate && <button onClick={() => setFormOpen(true)} className="mt-3 text-sm px-3 py-1.5 rounded-md" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>Create your first project</button>}
              </td></tr>
            ) : filtered.map((p) => {
              const f = fin?.[p.id];
              const meta = stateMeta(p.status);
              const profit = f?.gross_profit ?? 0;
              return (
                <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="border-t cursor-pointer hover:bg-[var(--brand-soft)]" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3.5 py-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.code} · {p.client?.company || p.client?.name || 'No client'}</div>
                  </td>
                  <td className="px-3 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span></td>
                  <td className="px-3 py-3 text-right font-mono">{formatBDT(f?.revenue ?? 0)}</td>
                  <td className="px-3 py-3 text-right font-mono" style={{ color: '#EF4444' }}>{formatBDT(f?.expense_total ?? 0)}</td>
                  <td className="px-3 py-3 text-right font-mono font-medium" style={{ color: profit >= 0 ? '#2ECC71' : '#EF4444' }}>{formatBDT(profit)}</td>
                  <td className="px-3 py-3 text-right font-mono" style={{ color: '#2ECC71' }}>{formatBDT(f?.collected ?? 0)}</td>
                  <td className="px-3 py-3 text-right font-mono" style={{ color: '#F59E0B' }}>{formatBDT(f?.outstanding ?? 0)}</td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{f?.last_payment_date ? formatDate(f.last_payment_date) : '—'}</td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(p.delivery_date)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProjectForm open={formOpen} project={null} onClose={() => setFormOpen(false)} />
    </div>
  );
}
