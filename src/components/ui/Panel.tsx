import { ReactNode } from 'react';

export function Panel({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {title && (
        <div className="px-3.5 py-2.5 border-b text-sm font-medium flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--table-head)' }}>
          <span>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
