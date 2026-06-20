import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, Loader2, Calendar, Building2, Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useProject, useDeleteProject, useUpdateProjectStatus,
} from '../../hooks/useProjects';
import { Panel } from '../../components/ui/Panel';
import { Modal } from '../../components/ui/Modal';
import { PIPELINE, CANCELLED, statusMeta } from '../../lib/projectStatus';
import { formatDate } from '../../lib/format';
import ProjectForm from './ProjectForm';

const TABS = ['Overview', 'Quotation', 'Team', 'Schedule', 'Finance', 'Files'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('projects', 'can_edit');
  const canDelete = hasPermission('projects', 'can_delete');

  const { data: project, isLoading } = useProject(id);
  const del = useDeleteProject();
  const updateStatus = useUpdateProjectStatus();

  const [tab, setTab] = useState('Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 size={20} className="mx-auto animate-spin opacity-50" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Project not found.
        <button onClick={() => navigate('/projects')} className="block mx-auto mt-3" style={{ color: 'var(--brand)' }}>
          ← Back to projects
        </button>
      </div>
    );
  }

  const meta = statusMeta(project.status);

  async function handleDelete() {
    await del.mutateAsync(project!.id);
    navigate('/projects');
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={15} /> Projects
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{project.code}</span>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${meta.color}22`, color: meta.color }}
            >
              {meta.label}
            </span>
          </div>
          <h1 className="text-lg font-semibold truncate">{project.title}</h1>
          <button
            onClick={() => project.client_id && navigate(`/clients/${project.client_id}`)}
            className="text-sm mt-0.5 flex items-center gap-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Building2 size={13} />
            {project.client?.company || project.client?.name || 'No client'}
          </button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              <Pencil size={14} /> Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md"
              style={{ background: 'var(--input-bg)', color: '#EF4444' }}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {PIPELINE.map((s) => {
          const isCurrent = s.key === project.status;
          return (
            <button
              key={s.key}
              disabled={!canEdit || updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: project.id, status: s.key })}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors disabled:cursor-default"
              style={{
                background: isCurrent ? s.color : 'var(--input-bg)',
                color: isCurrent ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {s.label}
            </button>
          );
        })}
        {project.status === CANCELLED.key && (
          <span
            className="px-2.5 py-1.5 rounded-md text-xs font-medium"
            style={{ background: CANCELLED.color, color: '#fff' }}
          >
            Cancelled
          </span>
        )}
      </div>

      <div className="border-b flex gap-1" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-2 text-sm -mb-px border-b-2"
            style={{
              borderColor: tab === t ? 'var(--brand)' : 'transparent',
              color: tab === t ? 'var(--brand)' : 'var(--text-secondary)',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Panel title="Brief">
              <p className="px-3.5 py-3 text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {project.description || 'No description added yet.'}
              </p>
            </Panel>
          </div>
          <div className="space-y-4">
            <Panel title="Key Dates">
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {[
                  { label: 'Start', value: project.start_date },
                  { label: 'Delivery', value: project.delivery_date },
                  { label: 'Presentation', value: project.presentation_date },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                    <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={13} /> {d.label}
                    </span>
                    <span>{formatDate(d.value)}</span>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Type">
              <p className="px-3.5 py-3 text-sm">{project.project_type || '—'}</p>
            </Panel>
          </div>
        </div>
      ) : (
        <div
          className="rounded-md border px-4 py-12 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <Lock size={22} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            The <span className="font-medium">{tab}</span> tab arrives with its module — coming next.
          </p>
        </div>
      )}

      <ProjectForm open={editOpen} project={project} onClose={() => setEditOpen(false)} />

      <Modal
        open={confirmOpen}
        title="Delete project?"
        onClose={() => setConfirmOpen(false)}
        width={420}
        footer={
          <>
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-3 py-1.5 rounded-md text-sm"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={del.isPending}
              className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50"
              style={{ background: '#EF4444' }}
            >
              {del.isPending && <Loader2 size={14} className="animate-spin" />}
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{project.title}</span> will be
          removed from the pipeline. This is a soft delete and can be restored later if needed.
        </p>
      </Modal>
    </div>
  );
}
