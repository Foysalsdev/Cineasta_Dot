import { useState } from 'react';
import { Plus, Loader2, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useLocations, LocationRow } from '../../hooks/usePreProd';
import { useSaveLocation, useDeleteLocation } from '../../hooks/useShoot';
import { Modal } from '../../components/ui/Modal';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };

function LocationModal({ open, loc, onClose }: { open: boolean; loc: LocationRow | null; onClose: () => void }) {
  const save = useSaveLocation();
  const [f, setF] = useState({
    name: loc?.name ?? '', city: loc?.city ?? '', location_type: loc?.location_type ?? '', address: loc?.address ?? '',
    contact_name: loc?.contact_name ?? '', contact_phone: loc?.contact_phone ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function handleSave() {
    if (!f.name.trim()) return setError('Name is required.');
    setError(null);
    await save.mutateAsync({ id: loc?.id, name: f.name.trim(), city: f.city.trim() || null, location_type: f.location_type.trim() || null, address: f.address.trim() || null, contact_name: f.contact_name.trim() || null, contact_phone: f.contact_phone.trim() || null });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={loc ? 'Edit Location' : 'New Location'}
      footer={<>
        <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button>
        <button onClick={handleSave} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} {loc ? 'Save' : 'Add'}</button>
      </>}>
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label><input autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>City</label><input value={f.city} onChange={(e) => set('city', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label><input value={f.location_type} onChange={(e) => set('location_type', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Studio / Outdoor…" /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Contact name</label><input value={f.contact_name} onChange={(e) => set('contact_name', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Contact phone</label><input value={f.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
        </div>
        <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Address</label><input value={f.address} onChange={(e) => set('address', e.target.value)} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
        {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
      </div>
    </Modal>
  );
}

export default function LocationsTab({ canEdit }: { canEdit: boolean }) {
  const { data: locations, isLoading } = useLocations();
  const del = useDeleteLocation();
  const [modal, setModal] = useState<{ open: boolean; loc: LocationRow | null }>({ open: false, loc: null });

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setModal({ open: true, loc: null })} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> New Location</button></div>}

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
      ) : (locations?.length ?? 0) === 0 ? (
        <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <MapPin size={22} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No locations yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {locations!.map((l) => (
            <div key={l.id} className="rounded-md border px-3.5 py-3 flex items-start justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
              <div className="min-w-0">
                <div className="text-sm font-medium flex items-center gap-1.5"><MapPin size={13} style={{ color: 'var(--brand)' }} /> {l.name}{l.location_type ? <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>{l.location_type}</span> : null}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{[l.city, l.address].filter(Boolean).join(' · ') || '—'}</div>
                {(l.contact_name || l.contact_phone) && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{[l.contact_name, l.contact_phone].filter(Boolean).join(' · ')}</div>}
              </div>
              {canEdit && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setModal({ open: true, loc: l })} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--text-secondary)' }}><Pencil size={13} /></button>
                  <button onClick={() => del.mutate(l.id)} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal.open && <LocationModal open={modal.open} loc={modal.loc} onClose={() => setModal({ open: false, loc: null })} />}
    </div>
  );
}
