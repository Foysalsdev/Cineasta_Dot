import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, Clapperboard, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects, useUpdateProjectStatus } from '../../hooks/useProjects';
import { ProjectWithClient, ProjectStatus } from '../../types';
import { PIPELINE } from '../../lib/projectStatus';
import ProjectForm from './ProjectForm';

function Card({
  p,
  onOpen,
  onDragStart,
  canEdit,
}: {
  p: ProjectWithClient;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent) => void;
  canEdit: boolean;
}) {
  return (
    <div
      draggable={canEdit}
      onDragStart={onDragStart}
      onClick={onOpen}
      className="rounded-md border p-2.5 cursor-pointer transition-shadow hover:shadow-md"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
          {p.code}
        </span>
        {p.project_type && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
          >
            {p.project_type}
          </span>
        )}
      </div>
      <div className="text-sm font-medium leading-snug mb-1.5">{p.title}</div>
      <div className="flex items-center gap-1 text-xs truncate" style={{ color: 'var(--text-muted)' }}>
        <Building2 size={11} />
        <span className="truncate">{p.client?.company || p.client?.name || 'No client'}</span>
      </div>
    </div>
  );
}

export default function ProjectsList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('projects', 'can_create');
  const canEdit = hasPermission('projects', 'can_edit');

  const { data: projects, isLoading } = useProjects();
  const updateStatus = useUpdateProjectStatus();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [dragOver, setDragOver] = useState<ProjectStatus | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects ?? [];
    return (projects ?? []).filter((p) =>
      [p.title, p.code, p.client?.name, p.client?.company, p.project_type]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [projects, search]);

  const byStatus = (s: ProjectStatus) => filtered.filter((p) => p.status === s);

  function onDrop(e: React.DragEvent, status: ProjectStatus) {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      const current = (projects ?? []).find((p) => p.id === id);
      if (current && current.status !== status) updateStatus.mutate({ id, status });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {projects?.length ?? 0} project{(projects?.length ?? 0) === 1 ? '' : 's'} ·
            {canEdit ? ' drag a card to move its stage' : ' pipeline view'}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white shrink-0"
            style={{ background: 'var(--brand)' }}
          >
            <Plus size={14} /> New Project
          </button>
        )}
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm max-w-sm"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
      >
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, code, client…"
          className="bg-transparent outline-none flex-1"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 size={18} className="mx-auto animate-spin opacity-50" />
        </div>
      ) : (projects?.length ?? 0) === 0 ? (
        <div className="rounded-md border px-4 py-14 text-center" style={{ borderColor: 'var(--border)' }}>
          <Clapperboard size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No projects yet.</p>
          {canCreate && (
            <button
              onClick={() => setFormOpen(true)}
              className="mt-3 text-sm px-3 py-1.5 rounded-md"
              style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
            >
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {PIPELINE.map((col) => {
            const items = byStatus(col.key);
            const active = dragOver === col.key;
            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  if (canEdit) {
                    e.preventDefault();
                    setDragOver(col.key);
                  }
                }}
                onDragLeave={() => setDragOver((s) => (s === col.key ? null : s))}
                onDrop={(e) => onDrop(e, col.key)}
                className="w-60 shrink-0 rounded-md border flex flex-col"
                style={{
                  borderColor: active ? col.color : 'var(--border)',
                  background: active ? 'var(--brand-soft)' : 'var(--table-head)',
                }}
              >
                <div
                  className="flex items-center justify-between px-3 py-2.5 border-b"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-xs font-semibold">{col.label}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {items.length}
                  </span>
                </div>
                <div className="p-2 space-y-2 flex-1 min-h-[80px]">
                  {items.map((p) => (
                    <Card
                      key={p.id}
                      p={p}
                      canEdit={canEdit}
                      onOpen={() => navigate(`/projects/${p.id}`)}
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', p.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProjectForm open={formOpen} project={null} onClose={() => setFormOpen(false)} />
    </div>
  );
}
