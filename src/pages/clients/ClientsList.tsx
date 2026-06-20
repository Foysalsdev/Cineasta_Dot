import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClients } from '../../hooks/useClients';
import { Client } from '../../types';
import { formatDate, initials } from '../../lib/format';
import ClientForm from './ClientForm';

export default function ClientsList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('clients', 'can_create');

  const { data: clients, isLoading } = useClients();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients ?? [];
    return (clients ?? []).filter((c) =>
      [c.name, c.company, c.email, c.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [clients, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Clients</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {clients?.length ?? 0} client{(clients?.length ?? 0) === 1 ? '' : 's'} on record
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white shrink-0"
            style={{ background: 'var(--brand)' }}
          >
            <Plus size={14} /> New Client
          </button>
        )}
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm max-w-sm"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
      >
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, company, email…"
          className="bg-transparent outline-none flex-1"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}>
              <th className="text-left font-medium px-3.5 py-2.5">Client</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden sm:table-cell">Contact</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden md:table-cell">Terms</th>
              <th className="text-left font-medium px-3.5 py-2.5 hidden lg:table-cell">Added</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-3.5 py-12 text-center">
                  <Loader2 size={18} className="mx-auto animate-spin opacity-50" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3.5 py-14 text-center">
                  <Users size={24} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {search ? 'No clients match your search.' : 'No clients yet.'}
                  </p>
                  {!search && canCreate && (
                    <button
                      onClick={() => setFormOpen(true)}
                      className="mt-3 text-sm px-3 py-1.5 rounded-md"
                      style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
                    >
                      Add your first client
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((c: Client) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="border-t cursor-pointer transition-colors hover:bg-[var(--brand-soft)]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
                      >
                        {initials(c.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.name}</div>
                        {c.company && (
                          <div
                            className="text-xs truncate flex items-center gap-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Building2 size={11} /> {c.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    <div className="truncate">{c.email ?? '—'}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {c.phone ?? ''}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 hidden md:table-cell font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {c.advance_payment_pct}% / {c.final_payment_pct}%
                  </td>
                  <td className="px-3.5 py-3 hidden lg:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(c.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ClientForm open={formOpen} client={null} onClose={() => setFormOpen(false)} />
    </div>
  );
}
