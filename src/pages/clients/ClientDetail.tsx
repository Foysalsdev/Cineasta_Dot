import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Pencil, Trash2, Mail, Phone, MapPin, Loader2, Clapperboard,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useClient, useDeleteClient } from '../../hooks/useClients';
import { Panel } from '../../components/ui/Panel';
import { Modal } from '../../components/ui/Modal';
import { Project } from '../../types';
import { formatDate, initials } from '../../lib/format';
import ClientForm from './ClientForm';

const STATUS_LABELS: Record<string, string> = {
  quoted: 'Quoted', ppm_prep: 'PPM / Prep', shoot: 'Shoot',
  post_production: 'Post', invoiced: 'Invoiced', paid: 'Paid', cancelled: 'Cancelled',
};

function useClientProjects(clientId?: string) {
  return useQuery({
    queryKey: ['client-projects', clientId],
    enabled: Boolean(clientId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, code, title, status, project_type, created_at, client_id')
        .eq('client_id', clientId!)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: string | null }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      <span>{value || '—'}</span>
    </div>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('clients', 'can_edit');
  const canDelete = hasPermission('clients', 'can_delete');

  const { data: client, isLoading } = useClient(id);
  const { data: projects } = useClientProjects(id);
  const del = useDeleteClient();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 size={20} className="mx-auto animate-spin opacity-50" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-20 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Client not found.
        <button onClick={() => navigate('/clients')} className="block mx-auto mt-3" style={{ color: 'var(--brand)' }}>
          ← Back to clients
        </button>
      </div>
    );
  }

  async function handleDelete() {
    await del.mutateAsync(client!.id);
    navigate('/clients');
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/clients')}
        className="flex items-center gap-1.5 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={15} /> Clients
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold shrink-0"
            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
          >
            {initials(client.name)}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">{client.name}</h1>
            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
              {client.company || 'No company'} · Added {formatDate(client.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              <Pencil size={14} /> Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md"
              style={{ background: 'var(--input-bg)', color: '#EF4444' }}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-1">
          <Panel title="Contact">
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              <InfoRow icon={<Mail size={14} />} value={client.email} />
              <InfoRow icon={<Phone size={14} />} value={client.phone} />
              <InfoRow icon={<MapPin size={14} />} value={client.address} />
            </div>
          </Panel>

          <Panel title="Payment Terms">
            <div className="grid grid-cols-2 gap-px" style={{ background: 'var(--border)' }}>
              {[
                { label: 'Advance', value: `${client.advance_payment_pct}%` },
                { label: 'Final', value: `${client.final_payment_pct}%` },
                { label: 'Final due', value: `${client.final_payment_days} days` },
                { label: 'VAT', value: `${client.vat_pct}%` },
              ].map((t) => (
                <div key={t.label} className="px-3.5 py-3" style={{ background: 'var(--card)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.label}</p>
                  <p className="text-base font-semibold font-mono mt-0.5">{t.value}</p>
                </div>
              ))}
            </div>
          </Panel>

          {client.notes && (
            <Panel title="Notes">
              <p className="px-3.5 py-3 text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {client.notes}
              </p>
            </Panel>
          )}
        </div>

        <div className="lg:col-span-2">
          <Panel title={`Projects (${projects?.length ?? 0})`}>
            {(projects?.length ?? 0) === 0 ? (
              <div className="px-3.5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                <Clapperboard size={22} className="mx-auto mb-2 opacity-40" />
                No projects for this client yet.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {projects!.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="flex items-center justify-between px-3.5 py-3 cursor-pointer hover:bg-[var(--brand-soft)]"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{p.title}</div>
                      <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {p.code}{p.project_type ? ` · ${p.project_type}` : ''}
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
                    >
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      <ClientForm open={editOpen} client={client} onClose={() => setEditOpen(false)} />

      <Modal
        open={confirmOpen}
        title="Delete client?"
        onClose={() => setConfirmOpen(false)}
        width={420}
        footer={
          <>
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-3 py-1.5 rounded-md text-sm"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={del.isPending}
              className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50"
              style={{ background: '#EF4444' }}
            >
              {del.isPending && <Loader2 size={14} className="animate-spin" />}
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{client.name}</span> will be
          removed from your client list. This is a soft delete — existing projects keep their link.
        </p>
      </Modal>
    </div>
  );
}
