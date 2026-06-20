import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ProjectWithClient } from '../../types';
import { useSaveProject } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';
import { PIPELINE, CANCELLED, PROJECT_TYPES } from '../../lib/projectStatus';

interface Props {
  open: boolean;
  project: ProjectWithClient | null; // null => create
  defaultClientId?: string;
  onClose: () => void;
  onSaved?: (id: string) => void;
}

const inputStyle = {
  background: 'var(--input-bg)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProjectForm({ open, project, defaultClientId, onClose, onSaved }: Props) {
  const isEdit = Boolean(project);
  const save = useSaveProject();
  const { data: clients } = useClients();

  const [form, setForm] = useState({
    title: project?.title ?? '',
    client_id: project?.client_id ?? defaultClientId ?? '',
    project_type: project?.project_type ?? '',
    status: project?.status ?? 'quoted',
    start_date: project?.start_date ?? '',
    delivery_date: project?.delivery_date ?? '',
    presentation_date: project?.presentation_date ?? '',
    description: project?.description ?? '',
  });
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.title.trim()) return setError('Project title is required.');
    if (!form.client_id) return setError('Please choose a client.');
    setError(null);
    try {
      const id = await save.mutateAsync({
        id: project?.id,
        title: form.title.trim(),
        client_id: form.client_id,
        project_type: form.project_type || null,
        status: form.status as any,
        start_date: form.start_date || null,
        delivery_date: form.delivery_date || null,
        presentation_date: form.presentation_date || null,
        description: form.description.trim() || null,
      });
      onSaved?.(id);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Could not save project.');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'New Project'}
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
            {isEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Field label="Project title *">
          <input
            autoFocus
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
            placeholder="e.g. Pran Mango Juice TVC 2026"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Client *">
            <select
              value={form.client_id}
              onChange={(e) => set('client_id', e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            >
              <option value="">Select a client…</option>
              {(clients ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` — ${c.company}` : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select
              value={form.project_type}
              onChange={(e) => set('project_type', e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            >
              <option value="">—</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Stage">
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          >
            {[...PIPELINE, CANCELLED].map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Start date">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </Field>
          <Field label="Delivery date">
            <input
              type="date"
              value={form.delivery_date}
              onChange={(e) => set('delivery_date', e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </Field>
          <Field label="Presentation">
            <input
              type="date"
              value={form.presentation_date}
              onChange={(e) => set('presentation_date', e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
            style={inputStyle}
            placeholder="Short brief of the project…"
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
