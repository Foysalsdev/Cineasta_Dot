import { useEffect, useState } from 'react';
import { FolderOpen, Plus, Loader2, Trash2, ExternalLink, FileText, Shirt, Package, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/format';
import {
  useDocuments, useSaveDocument, useDeleteDocument, DOC_TYPES,
  useProps, useSaveProp, useSetPropStatus, useDeleteProp, PROP_CATEGORIES, PROP_STATUS, propMeta,
  useEquipment, useSaveEquipment, useCheckInEquipment, useDeleteEquipment,
} from '../../hooks/useAssets';

const inputStyle = { background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
const TABS = ['Files', 'Props & Wardrobe', 'Equipment'] as const;
type Tab = (typeof TABS)[number];

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rounded-md border px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto mb-2 opacity-40" style={{ color: 'var(--text-muted)' }}>{icon}</div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
  );
}

function FilesTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: docs, isLoading } = useDocuments(projectId);
  const save = useSaveDocument();
  const del = useDeleteDocument();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', doc_type: 'script', file_url: '' });

  async function add() {
    if (!f.name.trim()) return;
    await save.mutateAsync({ project_id: projectId, name: f.name.trim(), doc_type: f.doc_type, file_url: f.file_url.trim() || null });
    setF({ name: '', doc_type: 'script', file_url: '' }); setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add File</button></div>}
      {isLoading ? <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
        : (docs?.length ?? 0) === 0 ? <Empty icon={<FileText size={22} className="mx-auto" />} text="No files or links yet." />
        : (
          <div className="space-y-2">
            {docs!.map((d) => (
              <div key={d.id} className="rounded-md border px-3.5 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-1.5">{d.name}{d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}><ExternalLink size={12} /></a>}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{d.doc_type} · {formatDate(d.created_at)}</div>
                </div>
                {canEdit && <button onClick={() => del.mutate({ id: d.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded shrink-0" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
              </div>
            ))}
          </div>
        )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add File / Link"
        footer={<><button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button><button onClick={add} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Add</button></>}>
        <div className="space-y-3.5">
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label><input autoFocus value={f.name} onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="Script v2, Storyboard…" /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label><select value={f.doc_type} onChange={(e) => setF((s) => ({ ...s, doc_type: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>{DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Link (Drive, footage…)</label><input value={f.file_url} onChange={(e) => setF((s) => ({ ...s, file_url: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="https://" /></div>
        </div>
      </Modal>
    </div>
  );
}

function PropsTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: props, isLoading } = useProps(projectId);
  const save = useSaveProp();
  const setStatus = useSetPropStatus();
  const del = useDeleteProp();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ item_name: '', category: 'prop', quantity: '1', status: 'in_stock', notes: '' });

  async function add() {
    if (!f.item_name.trim()) return;
    await save.mutateAsync({ project_id: projectId, item_name: f.item_name.trim(), category: f.category, quantity: Number(f.quantity) || 1, status: f.status, notes: f.notes.trim() || null });
    setF({ item_name: '', category: 'prop', quantity: '1', status: 'in_stock', notes: '' }); setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Add Item</button></div>}
      {isLoading ? <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
        : (props?.length ?? 0) === 0 ? <Empty icon={<Shirt size={22} className="mx-auto" />} text="No props or wardrobe yet." />
        : (
          <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead><tr style={{ background: 'var(--table-head)', color: 'var(--text-secondary)' }}><th className="text-left font-medium px-3.5 py-2.5">Item</th><th className="text-left font-medium px-3.5 py-2.5 hidden sm:table-cell">Category</th><th className="text-right font-medium px-3.5 py-2.5">Qty</th><th className="text-left font-medium px-3.5 py-2.5">Status</th><th className="w-10"></th></tr></thead>
              <tbody>
                {props!.map((p) => {
                  const meta = propMeta(p.status);
                  return (
                    <tr key={p.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-3.5 py-2.5 font-medium">{p.item_name}{p.notes && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.notes}</div>}</td>
                      <td className="px-3.5 py-2.5 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{p.category}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono">{p.quantity}</td>
                      <td className="px-3.5 py-2.5">{canEdit ? (
                        <select value={p.status} onChange={(e) => setStatus.mutate({ id: p.id, status: e.target.value, projectId })} className="text-xs rounded-full px-2 py-0.5 outline-none" style={{ background: `${meta.color}22`, color: meta.color, border: 'none' }}>{PROP_STATUS.map((s) => <option key={s.key} value={s.key} style={{ color: 'var(--text-primary)', background: 'var(--card)' }}>{s.label}</option>)}</select>
                      ) : <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>}</td>
                      <td className="px-3.5 py-2.5">{canEdit && <button onClick={() => del.mutate({ id: p.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Prop / Wardrobe"
        footer={<><button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button><button onClick={add} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Add</button></>}>
        <div className="space-y-3.5">
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Item name *</label><input autoFocus value={f.item_name} onChange={(e) => setF((s) => ({ ...s, item_name: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label><select value={f.category} onChange={(e) => setF((s) => ({ ...s, category: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>{PROP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Qty</label><input type="number" value={f.quantity} onChange={(e) => setF((s) => ({ ...s, quantity: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label><select value={f.status} onChange={(e) => setF((s) => ({ ...s, status: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle}>{PROP_STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
          </div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label><input value={f.notes} onChange={(e) => setF((s) => ({ ...s, notes: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
        </div>
      </Modal>
    </div>
  );
}

function EquipmentTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: eq, isLoading } = useEquipment(projectId);
  const save = useSaveEquipment();
  const checkIn = useCheckInEquipment();
  const del = useDeleteEquipment();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ equipment_name: '', quantity: '1', checked_out_date: new Date().toISOString().slice(0, 10), notes: '' });

  async function add() {
    if (!f.equipment_name.trim()) return;
    await save.mutateAsync({ project_id: projectId, equipment_name: f.equipment_name.trim(), quantity: Number(f.quantity) || 1, checked_out_date: f.checked_out_date || null, notes: f.notes.trim() || null });
    setF({ equipment_name: '', quantity: '1', checked_out_date: new Date().toISOString().slice(0, 10), notes: '' }); setOpen(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && <div className="flex justify-end"><button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--brand)' }}><Plus size={14} /> Check Out Equipment</button></div>}
      {isLoading ? <div className="py-10 text-center"><Loader2 size={18} className="mx-auto animate-spin opacity-50" /></div>
        : (eq?.length ?? 0) === 0 ? <Empty icon={<Package size={22} className="mx-auto" />} text="No equipment logged yet." />
        : (
          <div className="space-y-2">
            {eq!.map((e) => {
              const inHand = e.status === 'checked_out';
              return (
                <div key={e.id} className="rounded-md border px-3.5 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{e.equipment_name} <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>×{e.quantity}</span></div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Out {formatDate(e.checked_out_date)}{e.checked_in_date ? ` · In ${formatDate(e.checked_in_date)}` : ''}{e.notes ? ` · ${e.notes}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: inHand ? '#F59E0B22' : '#2ECC7122', color: inHand ? '#F59E0B' : '#2ECC71' }}>{inHand ? 'Checked Out' : 'Returned'}</span>
                    {canEdit && inHand && <button onClick={() => checkIn.mutate({ id: e.id, projectId })} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><LogIn size={11} /> Check In</button>}
                    {canEdit && <button onClick={() => del.mutate({ id: e.id, projectId })} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      <Modal open={open} onClose={() => setOpen(false)} title="Check Out Equipment"
        footer={<><button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>Cancel</button><button onClick={add} disabled={save.isPending} className="px-3.5 py-1.5 rounded-md text-sm text-white font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)' }}>{save.isPending && <Loader2 size={14} className="animate-spin" />} Add</button></>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Equipment *</label><input autoFocus value={f.equipment_name} onChange={(e) => setF((s) => ({ ...s, equipment_name: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} placeholder="RED camera, Aputure 600d…" /></div>
            <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Qty</label><input type="number" value={f.quantity} onChange={(e) => setF((s) => ({ ...s, quantity: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none font-mono" style={inputStyle} /></div>
          </div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Checked out date</label><input type="date" value={f.checked_out_date} onChange={(e) => setF((s) => ({ ...s, checked_out_date: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
          <div><label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label><input value={f.notes} onChange={(e) => setF((s) => ({ ...s, notes: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={inputStyle} /></div>
        </div>
      </Modal>
    </div>
  );
}

export default function AssetsPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('assets', 'can_edit');
  const { data: projects } = useProjects();
  const [projectId, setProjectId] = useState('');
  const [tab, setTab] = useState<Tab>('Files');

  useEffect(() => { if (!projectId && projects?.[0]) setProjectId(projects[0].id); }, [projects, projectId]);
  const active = projectId || projects?.[0]?.id || '';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-lg font-semibold">Asset Management</h1>
        <select value={active} onChange={(e) => setProjectId(e.target.value)} className="rounded-md px-3 py-2 text-sm outline-none min-w-[220px]" style={inputStyle}>
          <option value="">Select a project…</option>
          {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.code} — {p.title}</option>)}
        </select>
      </div>

      {!active ? (
        <Empty icon={<FolderOpen size={24} className="mx-auto" />} text="Select a project to manage its files, props, and equipment." />
      ) : (
        <>
          <div className="border-b flex gap-1" style={{ borderColor: 'var(--border)' }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2 text-sm -mb-px border-b-2"
                style={{ borderColor: tab === t ? 'var(--brand)' : 'transparent', color: tab === t ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: tab === t ? 600 : 400 }}>
                {t}
              </button>
            ))}
          </div>
          {tab === 'Files' && <FilesTab projectId={active} canEdit={canEdit} />}
          {tab === 'Props & Wardrobe' && <PropsTab projectId={active} canEdit={canEdit} />}
          {tab === 'Equipment' && <EquipmentTab projectId={active} canEdit={canEdit} />}
        </>
      )}
    </div>
  );
}
