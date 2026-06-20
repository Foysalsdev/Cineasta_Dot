import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clapperboard, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);

  async function handlePasswordLogin() {
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({ type: 'error', text: error.message });
    setLoading(false);
  }

  async function handleMagicLink() {
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage({ type: 'error', text: error.message });
    else setMessage({ type: 'info', text: 'Check your email for the login link.' });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-7">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'var(--brand)' }}>
            <Clapperboard size={18} color="#fff" />
          </div>
          <span className="text-lg font-semibold">Cineasta Dot Insight</span>
        </div>

        <div className="rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <h1 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue
          </h1>

          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm mb-3 outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            placeholder="you@cineastadot.com"
          />

          {mode === 'password' && (
            <>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm mb-4 outline-none"
                style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                placeholder="••••••••"
              />
            </>
          )}

          {message && (
            <p className="text-xs mb-3" style={{ color: message.type === 'error' ? '#EF4444' : 'var(--brand)' }}>
              {message.text}
            </p>
          )}

          <button
            onClick={mode === 'password' ? handlePasswordLogin : handleMagicLink}
            disabled={loading}
            className="w-full rounded-md py-2 text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'var(--brand)' }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {mode === 'password' ? 'Sign in' : 'Send login link'}
          </button>

          <button
            onClick={() => { setMode(mode === 'password' ? 'magic' : 'password'); setMessage(null); }}
            className="w-full text-xs mt-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            {mode === 'password' ? 'Sign in with a magic link instead' : 'Sign in with password instead'}
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          Cineasta Dot — internal use only
        </p>
      </div>
    </div>
  );
}
