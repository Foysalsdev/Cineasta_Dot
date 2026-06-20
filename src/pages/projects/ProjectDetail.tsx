import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Loader2, Calendar, Building2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject, useDeleteProject, useSaveProject } from '../../hooks/useProjects';
import { useProjectFinancial } from '../../hooks/useProjectFinance';
import { Panel } from '../../components/ui/Panel';
import { Modal } from '../../components/ui/Modal';
import { PROJECT_STATES, stateMeta } from '../../lib/projectStatus';
import { formatBDT, formatDate } from '../../lib/format';
import ProjectForm from './ProjectForm';

const TABS = ['Overview', 'Quotation', 'Expenses', 'Payments', 'Invoices', 'Documents', 'Notes'] as const;
type Tab = (typeof TABS)[number];

function Money({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg p-3.5 border shadow-card elevate" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="mt-1 text-lg font-semibold font-mono" style={{ color: tone ?? 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('projects', 'can_edit');
  const canDelete = hasPermission('projects', 'can_delete');

  const { data: project, isLoading } = useProject(id);
  const { data: fin } = useProjectFinancial(id);
  const del = useDeleteProject();
  const save = useSaveProject();

  const initialTab = (params.get('tab') as Tab) || 'Overview';
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab) ? initialTab : 'Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <div className="py-20 text-center"><Loader2 size={20} className="mx-auto animate-spin opacity-50" /></div>;
  if (!project) {
    return (
      <div className="py-20 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Project not found.
        <button onClick={() => navigate('/projects')} className="block mx-auto mt-3" style={{ color: 'var(--brand)' }}>&larr; Back to projects</button>
      </div>
    );
  }

  const meta = stateMeta(project.status);
  const profit = fin?.gross_profit ?? 0;
  const variance = fin?.budget_variance ?? 0;

  async function handleDelete() { await del.mutateAsync(project!.id); navigate('/projects'); }
  const changeStatus = (status: string) => save.mutate({ id: project!.id, status: status as any });

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={15} /> Projects
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{project.code}</span>
            {canEdit ? (
              <select value={project.status} onChange={(e) => changeStatus(e.target.value)} className="text-[11px] rounded-full px-2 py-0.5 outline-none font-medium" style={{ background: `${meta.color}22`, color: meta.color, border: 'none' }}>
                {PROJECT_STATES.map((s) => <option key={s.key} value={s.key} style={{ color: 'var(--text-primary)', background: 'var(--card)' }}>{s.label}</option>)}
              </select>
            ) : <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>}
          </div>
          <h1 className="text-lg font-semibold truncate">{project.title}</h1>
          <button onClick={() => project.client_id && navigate(`/clients/${project.client_id}`)} className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Building2 size={13} /> {project.client?.company || project.client?.name || 'No client'}
          </button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && <button onClick={() => setEditOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}><Pencil size={14} /> Edit</button>}
          {canDelete && <button onClick={() => setConfirmOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md" style={{ background: 'var(--input-bg)', color: '#EF4444' }}><Trash2 size={14} /> Delete</button>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap rounded-md border px-3 py-2.5" style={{ borderColor: 'var(--border)', background: 'var(--table-head)' }}>
        {([
          ['Quotation', 'Quotation'], ['Add Expense', 'Expenses'], ['Add Payment', 'Payments'],
          ['Invoice', 'Invoices'], ['Document', 'Documents'], ['Note', 'Notes'],
        ] as [string, Tab][]).map(([label, t]) => (
          <button key={t} onClick={() => setTab(t)} className="text-sm px-3 py-1.5 rounded-md"
            style={{ background: tab === t ? 'var(--brand)' : 'var(--input-bg)', color: tab === t ? '#fff' : 'var(--text-secondary)' }}>
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={() => window.print()} className="text-sm px-3 py-1.5 rounded-md" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Print Summary</button>
      </div>

      <div className="border-b flex gap-1 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3 py-2 text-sm -mb-px border-b-2 whitespace-nowrap"
            style={{ borderColor: tab === t ? 'var(--brand)' : 'transparent', color: tab === t ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: tab === t ? 600 : 400 }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Money label="Revenue" value={formatBDT(fin?.revenue ?? 0)} />
            <Money label="Project Expense" value={formatBDT(fin?.expense_total ?? 0)} tone="#EF4444" />
            <Money label="Gross Profit" value={formatBDT(profit)} tone={profit >= 0 ? '#2ECC71' : '#EF4444'} />
            <Money label="Budget (quotation)" value={formatBDT(fin?.budget ?? 0)} />
            <Money label="Collected" value={formatBDT(fin?.collected ?? 0)} tone="#2ECC71" />
            <Money label="Outstanding" value={formatBDT(fin?.outstanding ?? 0)} tone="#F59E0B" />
            <Money label="Budget Variance" value={formatBDT(variance)} tone={variance >= 0 ? '#2ECC71' : '#EF4444'} />
            <Money label="Last Payment" value={fin?.last_payment_date ? formatDate(fin.last_payment_date) : '—'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Panel title="Brief">
                <p className="px-3.5 py-3 text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{project.description || 'No description added yet.'}</p>
              </Panel>
            </div>
            <Panel title="Key Dates">
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {[{ label: 'Start', value: project.start_date }, { label: 'Delivery', value: project.delivery_date }, { label: 'Presentation', value: project.presentation_date }].map((d) => (
                  <div key={d.label} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                    <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><Calendar size={13} /> {d.label}</span>
                    <span>{formatDate(d.value)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <Lock size={22} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>The <span className="font-medium">{tab}</span> tab is being built next.</p>
        </div>
      )}

      <ProjectForm open={editOpen} project={project} onClose={() => setEditOpen(false)} />

      <Modal open={confirmOpen} title="Delete project?" onClose={() => setConfirmOpen(false)} width={420}
        footer={<>
          <button onClick={() => setConfirmOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleDelete} disabled={del.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: '#EF4444' }}>{del.isPending && <Loader2 size={14} className="animate-spin" />} Delete</button>
        </>}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{project.title}</span> will be removed. This is a soft delete.
        </p>
      </Modal>
    </div>
  );
}
