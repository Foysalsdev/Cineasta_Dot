import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { usePurchaseOrders, usePayments, useExpenses } from '../../hooks/useFinance';
import { formatBDT } from '../../lib/format';

const TABS = ['Project Profitability', 'Client Summary'] as const;
type Tab = (typeof TABS)[number];

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md p-3.5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="mt-1 text-xl font-semibold font-mono" style={{ color: tone ?? 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function Margin({ profit, base }: { profit: number; base: number }) {
  const pct = base > 0 ? Math.round((profit / base) * 100) : 0;
  const color = profit > 0 ? '#2ECC71' : profit < 0 ? '#EF4444' : 'var(--text-muted)';
  return <span className="font-mono" style={{ color }}>{base > 0 ? `${pct}%` : '—'}</span>;
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const { data: projects } = useProjects();
  const { data: pos } = usePurchaseOrders();
  const { data: payments } = usePayments();
  const { data: expenses } = useExpenses();
  const [tab, setTab] = useState<Tab>('Project Profitability');

  const byProject = useMemo(() => {
    const m: Record<string, { contracted: number; received: number; expenses: number }> = {};
    const ensure = (id: string) => (m[id] ??= { contracted: 0, received: 0, expenses: 0 });
    (pos ?? []).forEach((p) => { if (p.status !== 'cancelled') ensure(p.project_id).contracted += Number(p.total_amount) || 0; });
    (payments ?? []).forEach((p) => { ensure(p.project_id).received += Number(p.amount) || 0; });
    (expenses ?? []).forEach((e) => { if (e.project_id) ensure(e.project_id).expenses += Number(e.amount) || 0; });
    return m;
  }, [pos, payments, expenses]);

  const projectRows = useMemo(() =>
    (projects ?? []).map((pr) => {
      const f = byProject[pr.id] ?? { contracted: 0, received: 0, expenses: 0 };
      return { ...pr, ...f, profit: f.received - f.expenses };
    }).sort((a, b) => b.contracted - a.contracted),
  [projects, byProject]);

  const clientRows = useMemo(() => {
    const m: Record<string, { name: string; projects: number; contracted: number; received: number; expenses: number }> = {};
    (projects ?? []).forEach((pr) => {
      const key = pr.client_id || 'none';
      const label = pr.client?.company || pr.client?.name || 'Unassigned';
      const c = (m[key] ??= { name: label, projects: 0, contracted: 0, received: 0, expenses: 0 });
      const f = byProject[pr.id] ?? { contracted: 0, received: 0, expenses: 0 };
      c.projects += 1; c.contracted += f.contracted; c.received += f.received; c.expenses += f.expenses;
    });
    return Object.values(m).sort((a, b) => b.contracted - a.contracted);
  }, [projects, byProject]);

  const totalContracted = (pos ?? []).filter((p) => p.status !== 'cancelled').reduce((s, p) => s + (Number(p.total_amount) || 0), 0);
  const totalReceived = (payments ?? []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netProfit = totalReceived - totalExpenses;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold">Reports &amp; P&amp;L</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total contracted" value={formatBDT(totalContracted)} />
        <Kpi label="Revenue received" value={formatBDT(totalReceived)} tone="#2ECC71" />
        <Kpi label="Total expenses" value={formatBDT(totalExpenses)} tone="#EF4444" />
        <Kpi label="Net profit" value={formatBDT(netProfit)} tone={netProfit >= 0 ? '#2ECC71' : '#EF4444'} />
      </div>

      <div className="border-b flex gap-1" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2 text-sm -mb-px border-b-2"
            style={{ borderColor: tab === t ? 'var(--brand)' : 'transparent', color: tab === t ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: tab === t ? 600 : 400 }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Project Profitability' && (
        <div className="rounded-md border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
                <th className="text-left font-medium px-3.5 py-2.5">Project</th>
                <th className="text-right font-medium px-3.5 py-2.5">Contracted</th>
                <th className="text-right font-medium px-3.5 py-2.5">Received</th>
                <th className="text-right font-medium px-3.5 py-2.5">Expenses</th>
                <th className="text-right font-medium px-3.5 py-2.5">Profit</th>
                <th className="text-right font-medium px-3.5 py-2.5 hidden sm:table-cell">Margin</th>
              </tr>
            </thead>
            <tbody>
              {projectRows.length === 0 ? (
                <tr><td colSpan={6} className="px-3.5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No project data yet.</td></tr>
              ) : projectRows.map((r) => (
                <tr key={r.id} onClick={() => navigate(`/projects/${r.id}`)} className="border-t cursor-pointer hover:bg-[var(--brand-soft)]" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3.5 py-2.5">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{r.code}</div>
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono">{formatBDT(r.contracted)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono" style={{ color: '#2ECC71' }}>{formatBDT(r.received)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono" style={{ color: '#EF4444' }}>{formatBDT(r.expenses)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-medium" style={{ color: r.profit >= 0 ? '#2ECC71' : '#EF4444' }}>{formatBDT(r.profit)}</td>
                  <td className="px-3.5 py-2.5 text-right hidden sm:table-cell"><Margin profit={r.profit} base={r.received} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Client Summary' && (
        <div className="rounded-md border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
                <th className="text-left font-medium px-3.5 py-2.5">Client</th>
                <th className="text-right font-medium px-3.5 py-2.5">Projects</th>
                <th className="text-right font-medium px-3.5 py-2.5">Contracted</th>
                <th className="text-right font-medium px-3.5 py-2.5">Received</th>
                <th className="text-right font-medium px-3.5 py-2.5">Profit</th>
              </tr>
            </thead>
            <tbody>
              {clientRows.length === 0 ? (
                <tr><td colSpan={5} className="px-3.5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No client data yet.</td></tr>
              ) : clientRows.map((c) => (
                <tr key={c.name} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3.5 py-2.5 font-medium">{c.name}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono">{c.projects}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono">{formatBDT(c.contracted)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono" style={{ color: '#2ECC71' }}>{formatBDT(c.received)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-medium" style={{ color: (c.received - c.expenses) >= 0 ? '#2ECC71' : '#EF4444' }}>{formatBDT(c.received - c.expenses)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Profit = Payments received − Expenses. Contracted = active PO totals. Margin = Profit ÷ Received.
      </p>
    </div>
  );
}
