'use client';

import React, { useState } from 'react';

// Register
export default function RegisterPage() {
  // Zustand für die Formulardaten (Benutzername, Passwort, Rolle)
  const [form, setForm] = useState({ username: '', password: '', role: 'customer' });
  // Zustand für das zweite Passwortfeld (Passwort-Wiederholung)
  const [password2, setPassword2] = useState('');
  // Zustand für den Ladeindikator (Button deaktivieren etc.)
  const [loading, setLoading] = useState(false);
  // Zustand für Fehlermeldungen
  const [error, setError] = useState('');
  // Zustand für Erfolgsmeldungen
  const [success, setSuccess] = useState('');

  // Handler für Änderungen an den Eingabefeldern (Benutzername, Passwort, Rolle)
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handler für das zweite Passwortfeld (Abgleich)
  const handlePassword2 = (e) => setPassword2(e.target.value);

  // Handler für das Absenden des Formulars
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== password2) {
      setError('Passwörter stimmen nicht überein!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Fehler bei der Registrierung.');
      } else {
        setSuccess('Registrierung erfolgreich! Du kannst dich jetzt einloggen.');
        setForm({ username: '', password: '', role: 'customer' });
        setPassword2('');
      }
    } catch (err) {
      setError('Serverfehler.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center w-full h-full fixed top-0 left-0 bg-gradient-to-br from-blue-100 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10">
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight mb-2">SupportDesk</span>
          <span className="text-base text-gray-400 dark:text-gray-500">Registrieren</span>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
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
              autoComplete="new-password"
              placeholder="Passwort"
            />
            <input
              id="password2"
              name="password2"
              type="password"
              required
              value={password2}
              onChange={handlePassword2}
              className="w-full mt-3 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white text-lg transition-all duration-200"
              disabled={loading}
              autoComplete="new-password"
              placeholder="Passwort wiederholen"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <span className="animate-pulse">Wird gesendet...</span> : 'Registrieren'}
          </button>
          {error && <div className="text-red-600 text-center mt-2 animate-shake">{error}</div>}
          {success && <div className="text-green-600 text-center mt-2 animate-fade-in">{success}</div>}
        </form>
      </div>
    </main>
  );
}
