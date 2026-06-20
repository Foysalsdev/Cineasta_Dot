import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-5 py-5">{children}</main>
      </div>
    </div>
  );
}
