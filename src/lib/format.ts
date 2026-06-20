// Shared display helpers (BDT currency + dates)

export const formatBDT = (n: number | null | undefined) =>
  `৳${Number(n ?? 0).toLocaleString('en-IN')}`;

export const formatDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
