import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { useLocations, useCreateLocation } from '../../hooks/usePreProd';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

export function LocationSelect({ value, onChange, disabled }: { value: string; onChange: (id: string) => void; disabled?: boolean }) {
  const { data: locations } = useLocations();
  const create = useCreateLocation();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  async function add() {
    if (!name.trim()) return;
    const id = await create.mutateAsync({ name: name.trim(), city: city.trim() });
    onChange(id);
    setAdding(false); setName(''); setCity('');
  }

  if (adding) {
    return (
      <div className="flex items-center gap-1.5">
        <input autoFocus placeholder="Location name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 rounded-md px-2.5 py-1.5 text-sm outline-none" style={inputStyle} />
        <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="w-24 rounded-md px-2.5 py-1.5 text-sm outline-none" style={inputStyle} />
        <button onClick={add} disabled={create.isPending} className="px-2 py-1.5 rounded-md text-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>{create.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Add'}</button>
        <button onClick={() => setAdding(false)} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="flex-1 rounded-md px-2.5 py-1.5 text-sm outline-none" style={inputStyle}>
        <option value="">No location</option>
        {(locations ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}{l.city ? ` — ${l.city}` : ''}</option>)}
      </select>
      {!disabled && <button onClick={() => setAdding(true)} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm whitespace-nowrap" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><Plus size={13} /> New</button>}
    </div>
  );
}
