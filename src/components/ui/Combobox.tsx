import { useEffect, useRef, useState } from 'react';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

// Typeahead field: type to filter suggestions from the database, pick one, or add a new value.
// Replaces traditional dropdowns.
export function Combobox({
  value, onChange, options, placeholder, allowCreate = true,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  allowCreate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setQ(value), [value]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const needle = q.trim().toLowerCase();
  const filtered = options.filter((o) => o.toLowerCase().includes(needle)).slice(0, 10);
  const exact = options.some((o) => o.toLowerCase() === needle);

  return (
    <div className="relative" ref={ref}>
      <input
        value={q}
        placeholder={placeholder}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-md px-3 py-2 text-sm outline-none"
        style={inputStyle}
      />
      {open && (filtered.length > 0 || (allowCreate && needle && !exact)) && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-md border shadow-lg max-h-56 overflow-auto" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {filtered.map((o) => (
            <button key={o} type="button" onClick={() => { onChange(o); setQ(o); setOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--brand-soft)]" style={{ color: 'var(--text-secondary)' }}>
              {o}
            </button>
          ))}
          {allowCreate && needle && !exact && (
            <button type="button" onClick={() => { onChange(q.trim()); setQ(q.trim()); setOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm font-medium" style={{ color: 'var(--brand)' }}>
              + Add “{q.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
