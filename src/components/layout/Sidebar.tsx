import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clapperboard, FileText, Film, Camera,
  Users2, Wallet, FolderOpen, BarChart3, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { to: '/clients', label: 'Clients', icon: Users, module: 'clients' },
  { to: '/projects', label: 'Projects', icon: Clapperboard, module: 'projects' },
  { to: '/quotations', label: 'Quotations', icon: FileText, module: 'quotations' },
  { to: '/pre-production', label: 'Pre-Production', icon: Film, module: 'pre_production' },
  { to: '/shoot', label: 'Shoot', icon: Camera, module: 'shoot' },
  { to: '/crew', label: 'Crew', icon: Users2, module: 'crew' },
  { to: '/finance', label: 'Finance', icon: Wallet, module: 'finance' },
  { to: '/assets', label: 'Assets', icon: FolderOpen, module: 'assets' },
  { to: '/reports', label: 'Reports', icon: BarChart3, module: 'reports' },
  { to: '/settings', label: 'Settings', icon: Settings, module: 'settings' },
];

export default function Sidebar() {
  const { profile, hasPermission } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r" style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <Logo size={28} />
        <span className="font-semibold text-sm">Cineasta Dot</span>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV.filter((item) => hasPermission(item.module, 'can_view')).map((item) => (
          <NavLink
            key={item.to} to={item.to} end={item.to === '/'}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm"
            style={({ isActive }) => ({
              background: isActive ? 'var(--brand-soft)' : 'transparent',
              color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 400,
            })}
          >
            <item.icon size={15} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
          {profile?.full_name?.slice(0, 2).toUpperCase() ?? '–'}
        </div>
        <div className="text-xs min-w-0">
          <div style={{ fontWeight: 500 }} className="truncate">{profile?.full_name ?? 'User'}</div>
          <div style={{ color: 'var(--text-muted)' }} className="truncate">{profile?.email}</div>
        </div>
      </div>
    </aside>
  );
}
