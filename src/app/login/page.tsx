'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('Kode akses salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-surface rounded-[22px] w-full max-w-[360px] p-6 shadow-xl border border-border animate-slide-up-modal">
        <div className="text-center mb-8">
          <div className="w-[64px] h-[64px] bg-primary-light border-2 border-primary/20 rounded-2xl flex items-center justify-center text-[32px] mx-auto mb-4">
            🐐
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-2xl text-text leading-tight mb-1">
            Pak Ji Farm
          </h1>
          <p className="text-xs text-text-sm">Sistem Monitoring Kambing</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="text-[11px] font-bold text-text-sm mb-1.5 block uppercase tracking-wider text-center">
              Masukkan Kode Akses
            </label>
            <input
              type="password"
              className="form-input w-full p-3.5 border-[1.5px] border-border rounded-xl text-center text-lg tracking-[0.2em] font-[family-name:var(--font-sans)] bg-surface2 text-text outline-none focus:border-primary transition-colors"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-danger-light text-danger text-xs text-center p-2 rounded-lg mb-4 font-semibold border border-danger/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-primary text-white border-none rounded-xl text-sm font-bold cursor-pointer transition-colors active:bg-primary-d disabled:opacity-50 shadow-md"
          >
            {loading ? '⏳ Memeriksa...' : 'Masuk Aplikasi →'}
          </button>
        </form>
      </div>
    </div>
  );
}
