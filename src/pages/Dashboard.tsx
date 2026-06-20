import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Panel } from '../components/ui/Panel';
import { Plus, ChevronRight, MapPin } from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  quoted: 'Quoted', ppm_prep: 'PPM / Prep', shoot: 'Shoot',
  post_production: 'Post', invoiced: 'Invoice', paid: 'Paid',
};
const STAGE_ORDER = ['quoted', 'ppm_prep', 'shoot', 'post_production', 'invoiced', 'paid'];

function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data: projects } = await supabase
        .from('projects').select('id, status').is('deleted_at', null);
      const counts: Record<string, number> = {};
      for (const s of STAGE_ORDER) counts[s] = 0;
      (projects ?? []).forEach((p: any) => { if (counts[p.status] !== undefined) counts[p.status]++; });
      const activeCount = (projects ?? []).filter((p: any) => !['paid', 'cancelled'].includes(p.status)).length;
      return { counts, activeCount };
    },
  });
}

export default function Dashboard() {
  const { data } = useDashboardData();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}>
          <Plus size={14} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Revenue this month', value: '৳0' },
          { label: 'Active Projects', value: String(data?.activeCount ?? 0) },
          { label: 'Overdue Payments', value: '৳0', tone: '#EF4444' },
          { label: 'Pending Quotations', value: '0', tone: '#F59E0B' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-md p-3.5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{kpi.label}</p>
            <p className="mt-1 text-xl font-semibold font-mono" style={{ color: kpi.tone ?? 'var(--text-primary)' }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <Panel title="Project Pipeline">
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x" style={{ borderColor: 'var(--border)' }}>
          {STAGE_ORDER.map((s) => (
            <div key={s} className="px-3.5 py-3" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{STAGE_LABELS[s]}</p>
              <p className="text-lg font-semibold mt-0.5 font-mono">{data?.counts[s] ?? 0}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel title="Upcoming Shoots">
          <div className="px-3.5 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={20} className="mx-auto mb-2 opacity-50" />
            No shoots scheduled yet.
          </div>
        </Panel>
        <Panel title="Payment Alerts">
          <div className="px-3.5 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            No payment alerts.
          </div>
        </Panel>
      </div>

      <Panel title="Recent Activity">
        <div className="px-3.5 py-6 text-sm text-center flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <ChevronRight size={14} /> Activity will appear here as you work.
        </div>
      </Panel>
    </div>
  );
}
