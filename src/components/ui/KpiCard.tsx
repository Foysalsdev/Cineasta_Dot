export function KpiCard({ label, value, tone, sub }: { label: string; value: string; tone?: string; sub?: string }) {
  return (
    <div className="rounded-lg border p-3.5 shadow-card elevate" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="mt-1.5 text-xl font-semibold font-mono" style={{ color: tone ?? 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}
