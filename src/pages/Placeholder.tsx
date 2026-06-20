import { Construction } from 'lucide-react';

export default function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">{title}</h1>
      <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
        <Construction size={26} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This module is coming next.</p>
      </div>
    </div>
  );
}
