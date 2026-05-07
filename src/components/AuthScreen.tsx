import { useState } from 'react';
import { KeyRound, LogIn, UserPlus } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (payload: { username: string; password: string }) => Promise<void>;
  onRegister: (payload: { username: string; password: string }) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function AuthScreen({ onLogin, onRegister, isSubmitting, error }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async () => {
    if (username.trim().length < 3) {
      setLocalError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setLocalError(null);

    if (mode === 'login') {
      await onLogin({ username, password });
      return;
    }

    await onRegister({
      username,
      password,
    });
  };

  const activeError = localError || error;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-b from-stone-900 via-stone-800 to-amber-950 text-white">
      <div className="relative flex-1 overflow-y-auto px-6 pt-16 pb-10">
        <div className="absolute top-16 right-8 h-28 w-28 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute bottom-20 left-6 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center shadow-xl">
            <KeyRound className="w-7 h-7 text-amber-200" />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-amber-200/80">Account Access</p>
          <h1 className="mt-3 text-[2.4rem] font-light leading-tight">Save your Maple Bridge journey.</h1>
          <p className="mt-4 text-sm font-light leading-6 text-white/75">
            Sign in to keep your fragments, uploads, and leaderboard identity tied to your own account.
          </p>

          <div className="mt-6 inline-flex rounded-full bg-white/10 p-1 border border-white/10">
            <button
              onClick={() => setMode('register')}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${mode === 'register' ? 'bg-white text-stone-900' : 'text-white/75'}`}
            >
              Create account
            </button>
            <button
              onClick={() => setMode('login')}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${mode === 'login' ? 'bg-white text-stone-900' : 'text-white/75'}`}
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-6 rounded-[32px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-light text-white/80 mb-2">Username</label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/15 px-4 py-3 text-sm outline-none focus:border-amber-300"
                placeholder="maplebridge_user"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-white/80 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/15 px-4 py-3 text-sm outline-none focus:border-amber-300"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          {mode === 'register' && (
            <p className="mt-4 text-xs font-light leading-5 text-white/60">
              Your username will also be used as your public display name for progress and leaderboard records.
            </p>
          )}

          {activeError && (
            <div className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {activeError}
            </div>
          )}

          <button
            onClick={submit}
            disabled={isSubmitting}
            className="mt-5 w-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-4 text-base font-light text-stone-950 shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
