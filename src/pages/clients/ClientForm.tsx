import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Client } from '../../types';
import { useSaveClient } from '../../hooks/useClients';

interface Props {
  open: boolean;
  client: Client | null; // null => create new
  onClose: () => void;
  onSaved?: (id: string) => void;
}

const inputStyle = {
  background: 'var(--input-bg)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function ClientForm({ open, client, onClose, onSaved }: Props) {
  const isEdit = Boolean(client);
  const save = useSaveClient();

  const [form, setForm] = useState({
    name: client?.name ?? '',
    company: client?.company ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    address: client?.address ?? '',
    notes: client?.notes ?? '',
    advance_payment_pct: client?.advance_payment_pct ?? 75,
    final_payment_pct: client?.final_payment_pct ?? 25,
    final_payment_days: client?.final_payment_days ?? 45,
    vat_pct: client?.vat_pct ?? 0,
  });
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Client name is required.');
      return;
    }
    setError(null);
    try {
      const id = await save.mutateAsync({
        id: client?.id,
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
        advance_payment_pct: Number(form.advance_payment_pct),
        final_payment_pct: Number(form.final_payment_pct),
        final_payment_days: Number(form.final_payment_days),
        vat_pct: Number(form.vat_pct),
      });
      onSaved?.(id);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Could not save client.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Client' : 'New Client'}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-sm"
            style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={save.isPending}
            className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--brand)' }}
          >
            {save.isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Client'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client / Contact name *">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
              placeholder="e.g. Rafiq Ahmed"
            />
          </Field>
          <Field label="Company / Agency">
            <input
              value={form.company}
              onChange={(e) => set('company', e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
              placeholder="e.g. Pran-RFL Group"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
              placeholder="name@company.com"
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
              placeholder="+8801XXXXXXXXX"
            />
          </Field>
        </div>

        <Field label="Address">
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
            placeholder="Office address"
          />
        </Field>

        <div
          className="rounded-md border px-3 py-3"
          style={{ borderColor: 'var(--border)', background: 'var(--table-head)' }}
        >
          <p className="text-xs font-medium mb-2.5">Payment Terms</p>
          <div className="grid grid-cols-4 gap-3">
            <Field label="Advance %">
              <input
                type="number"
                value={form.advance_payment_pct}
                onChange={(e) => set('advance_payment_pct', e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono"
                style={inputStyle}
              />
            </Field>
            <Field label="Final %">
              <input
                type="number"
                value={form.final_payment_pct}
                onChange={(e) => set('final_payment_pct', e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono"
                style={inputStyle}
              />
            </Field>
            <Field label="Final due (days)">
              <input
                type="number"
                value={form.final_payment_days}
                onChange={(e) => set('final_payment_days', e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono"
                style={inputStyle}
              />
            </Field>
            <Field label="VAT %">
              <input
                type="number"
                value={form.vat_pct}
                onChange={(e) => set('vat_pct', e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono"
                style={inputStyle}
              />
            </Field>
          </div>
        </div>

        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
            style={inputStyle}
            placeholder="Anything worth remembering about this client…"
          />
        </Field>

        {error && (
          <p className="text-xs" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
