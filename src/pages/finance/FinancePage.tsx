import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePurchaseOrders, usePayments, useExpenses } from '../../hooks/useFinance';
import { formatBDT } from '../../lib/format';
import PurchaseOrdersTab from './PurchaseOrdersTab';
import PaymentsTab from './PaymentsTab';
import ExpensesTab from './ExpensesTab';

const TABS = ['Overview', 'Purchase Orders', 'Payments', 'Expenses'] as const;
type Tab = (typeof TABS)[number];

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-md p-3.5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="mt-1 text-xl font-semibold font-mono" style={{ color: tone ?? 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

export default function FinancePage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('finance', 'can_edit');
  const canApprove = hasPermission('finance', 'can_approve');

  const { data: pos } = usePurchaseOrders();
  const { data: payments } = usePayments();
  const { data: expenses } = useExpenses();
  const [tab, setTab] = useState<Tab>('Overview');

  const activePOs = (pos ?? []).filter((p) => p.status !== 'cancelled');
  const contracted = activePOs.reduce((s, p) => s + (Number(p.total_amount) || 0), 0);
  const advanceCollected = activePOs.filter((p) => p.advance_received).reduce((s, p) => s + (Number(p.advance_amount) || 0), 0);
  const finalPending = activePOs.filter((p) => !p.final_received).reduce((s, p) => s + (Number(p.final_amount) || 0), 0);
  const totalReceived = (payments ?? []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const outstanding = activePOs.reduce(
    (s, p) => s + (p.advance_received ? 0 : Number(p.advance_amount) || 0) + (p.final_received ? 0 : Number(p.final_amount) || 0),
    0,
  );

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold">Finance &amp; Payments</h1>

      <div className="border-b flex gap-1 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2 text-sm -mb-px border-b-2 whitespace-nowrap"
            style={{ borderColor: tab === t ? 'var(--brand)' : 'transparent', color: tab === t ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: tab === t ? 600 : 400 }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Kpi label="Contracted (active POs)" value={formatBDT(contracted)} />
            <Kpi label="Advance collected" value={formatBDT(advanceCollected)} tone="#2ECC71" />
            <Kpi label="Outstanding (PO)" value={formatBDT(outstanding)} tone="#F59E0B" />
            <Kpi label="Final payment pending" value={formatBDT(finalPending)} tone="#F59E0B" />
            <Kpi label="Total payments received" value={formatBDT(totalReceived)} tone="#2ECC71" />
            <Kpi label="Total expenses" value={formatBDT(totalExpenses)} tone="#EF4444" />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Net (payments received − expenses): <span className="font-mono font-medium" style={{ color: totalReceived - totalExpenses >= 0 ? '#2ECC71' : '#EF4444' }}>{formatBDT(totalReceived - totalExpenses)}</span>
          </p>
        </div>
      )}

      {tab === 'Purchase Orders' && <PurchaseOrdersTab canEdit={canEdit} />}
      {tab === 'Payments' && <PaymentsTab canEdit={canEdit} />}
      {tab === 'Expenses' && <ExpensesTab canEdit={canEdit} canApprove={canApprove} />}
    </div>
  );
}
