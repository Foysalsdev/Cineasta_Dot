import { useEffect, useState } from 'react';
import { Film } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import RecceTab from './RecceTab';
import PPMTab from './PPMTab';
import CallSheetsTab from './CallSheetsTab';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const TABS = ['Recce', 'PPM', 'Call Sheets'] as const;
type Tab = (typeof TABS)[number];

export default function PreProductionPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('pre_production', 'can_edit');
  const { data: projects } = useProjects();
  const [projectId, setProjectId] = useState('');
  const [tab, setTab] = useState<Tab>('Recce');

  useEffect(() => { if (!projectId && projects?.[0]) setProjectId(projects[0].id); }, [projects, projectId]);

  const active = projectId || projects?.[0]?.id || '';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-lg font-semibold">Pre-Production</h1>
        <select value={active} onChange={(e) => setProjectId(e.target.value)} className="rounded-md px-3 py-2 text-sm outline-none min-w-[220px]" style={inputStyle}>
          <option value="">Select a project…</option>
          {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.code} — {p.title}</option>)}
        </select>
      </div>

      {!active ? (
        <div className="rounded-md border px-4 py-14 text-center" style={{ borderColor: 'var(--border)' }}>
          <Film size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create a project first, then plan its pre-production here.</p>
        </div>
      ) : (
        <>
          <div className="border-b flex gap-1" style={{ borderColor: 'var(--border)' }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2 text-sm -mb-px border-b-2"
                style={{ borderColor: tab === t ? 'var(--brand)' : 'transparent', color: tab === t ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: tab === t ? 600 : 400 }}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'Recce' && <RecceTab projectId={active} canEdit={canEdit} />}
          {tab === 'PPM' && <PPMTab projectId={active} canEdit={canEdit} />}
          {tab === 'Call Sheets' && <CallSheetsTab projectId={active} canEdit={canEdit} />}
        </>
      )}
    </div>
  );
}
