'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from './Spinner';

// Login Design
export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login fehlgeschlagen.');
      } else {
        // Nach erfolgreichem Login: Seite komplett neu laden, damit Navbar & User-Status stimmen
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Serverfehler.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center w-full h-full fixed top-0 left-0 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 animate-fadein">
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight mb-2">SupportDesk</span>
          <span className="text-base text-gray-400 dark:text-gray-500">Login</span>
        </div>
        {loading ? (
          <Spinner text="Login wird geprüft..." />
        ) : (
          <form className="space-y-6 animate-fadein" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Benutzername</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white text-lg transition-all duration-200"
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white text-lg transition-all duration-200"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Login'}
            </button>
            {error && <div className="text-red-600 text-center mt-2 animate-shake">{error}</div>}
          </form>
        )}
      </div>
    </main>
  );
}
