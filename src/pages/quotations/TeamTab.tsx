import { useEffect, useState } from 'react';
import { Loader2, Plus, X, Users2 } from 'lucide-react';
import {
  useProjectCrew, useSeedTeamIfEmpty, useUpdateCrewQty, useAddCrewRole, useRemoveCrewRole, ProjectCrew,
} from '../../hooks/useTeam';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

export default function TeamTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: crew, isLoading } = useProjectCrew(projectId);
  const seed = useSeedTeamIfEmpty();

  // Seed the standard teams the first time this project's Team is opened.
  useEffect(() => {
    if (!isLoading && crew && crew.length === 0 && !seed.isPending) {
      seed.mutate(projectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, crew]);

  if (isLoading || seed.isPending) {
    return <div className="py-12 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>;
  }

  const recce = (crew ?? []).filter((c) => c.team_type === 'recce');
  const shooting = (crew ?? []).filter((c) => c.team_type === 'shooting');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TeamColumn title="Recce Team" teamType="recce" projectId={projectId} rows={recce} canEdit={canEdit} />
      <TeamColumn title="Shooting Team" teamType="shooting" projectId={projectId} rows={shooting} canEdit={canEdit} />
    </div>
  );
}

function TeamColumn({
  title, teamType, projectId, rows, canEdit,
}: {
  title: string; teamType: 'recce' | 'shooting'; projectId: string; rows: ProjectCrew[]; canEdit: boolean;
}) {
  const updateQty = useUpdateCrewQty();
  const addRole = useAddCrewRole();
  const removeRole = useRemoveCrewRole();
  const [newRole, setNewRole] = useState('');
  const totalPeople = rows.reduce((s, r) => s + (r.quantity || 0), 0);

  return (
    <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b" style={{ background: 'var(--table-head)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users2 size={14} style={{ color: 'var(--brand)' }} /> {title}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{rows.length} roles · {totalPeople} people</span>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2 px-3.5 py-1.5">
            <span className="text-sm">{r.role_title}</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                readOnly={!canEdit}
                value={r.quantity}
                onChange={(e) => updateQty.mutate({ id: r.id, quantity: Number(e.target.value) || 0 })}
                className="w-14 rounded px-2 py-1 text-sm text-right outline-none font-mono"
                style={inputStyle}
              />
              {canEdit && (
                <button onClick={() => removeRole.mutate({ id: r.id, projectId })} className="w-6 h-6 flex items-center justify-center rounded" style={{ color: 'var(--text-muted)' }} title="Remove">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-t" style={{ borderColor: 'var(--border)' }}>
          <input
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newRole.trim()) {
                addRole.mutate({ projectId, teamType, roleTitle: newRole.trim(), quantity: 1 });
                setNewRole('');
              }
            }}
            placeholder="Add role…"
            className="flex-1 rounded-md px-2.5 py-1.5 text-sm outline-none"
            style={inputStyle}
          />
          <button
            onClick={() => { if (newRole.trim()) { addRole.mutate({ projectId, teamType, roleTitle: newRole.trim(), quantity: 1 }); setNewRole(''); } }}
            className="flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-md"
            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      )}
    </div>
  );
}
