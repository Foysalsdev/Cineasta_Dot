import { Search, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  return (
    <header className="glass sticky top-0 z-10 flex items-center justify-between gap-4 px-5 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm flex-1 max-w-xs" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
        <Search size={14} />
        <span>Search...</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className="relative w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#EF4444' }} />
        </button>
        <button onClick={signOut} className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }} title="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
