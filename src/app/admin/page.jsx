import React from 'react';

export default function AdminPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 border border-gray-100 dark:border-gray-800 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-center mb-4 text-orange-700 dark:text-orange-400 tracking-tight">Admin Dashboard</h1>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8 text-lg">Benutzer, Rollen & Tickets verwalten.</p>
        {/* User and ticket management will go here */}
      </div>
    </main>
  );
}
