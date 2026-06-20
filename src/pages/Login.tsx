import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-7">
          <Logo size={36} />
          <span className="text-lg font-semibold">Cineasta Dot Insight</span>
        </div>

        <div className="rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <h1 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Sign in to continue</h1>

          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full rounded-md px-3 py-2 text-sm mb-3 outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            placeholder="you@cineastadot.com"
            autoFocus
          />

          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full rounded-md px-3 py-2 text-sm mb-4 outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            placeholder="Password"
          />

          {error && <p className="text-xs mb-3" style={{ color: '#EF4444' }}>{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full rounded-md py-2 text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--brand)' }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Sign in
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          Cineasta Dot — internal use only
        </p>
      </div>
    </div>
  );
}
