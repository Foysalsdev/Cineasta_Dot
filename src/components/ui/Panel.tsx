import { ReactNode } from 'react';

export function Panel({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div
      className="rounded-lg border overflow-hidden shadow-card"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      {title && (
        <div
          className="px-4 py-2.5 border-b text-sm font-medium flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--table-head)' }}
        >
          <span>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
