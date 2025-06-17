'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");
  const router = useRouter();

  // Lädt Userdaten immer neu, wenn Route wechselt (z.B. nach Login/Logout)
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/me');
      if (res.ok) {
        const user = await res.json();
        setRole(user.role);
        setUsername(user.username);
      } else {
        setRole(null);
        setUsername("");
      }
    };
    fetchUser();
    // Next.js router events (refresh bei Navigation)
    const handle = () => fetchUser();
    window.addEventListener('focus', handle);
    return () => {
      window.removeEventListener('focus', handle);
    };
  }, [router]);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950/95 backdrop-blur-lg shadow-2xl border-b border-gray-800 flex items-center justify-between px-8 py-6 h-28">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight hover:opacity-90 transition"> SupportDesk</Link>
        {/* Dashboard-Link direkt links daneben */}
        {role === 'customer' && <span className="ml-2 px-3 py-1 rounded-lg font-medium text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">Customer Dashboard</span>}
        {role === 'support1' && <span className="ml-2 px-3 py-1 rounded-lg font-medium text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">1st Level Support</span>}
        {role === 'support2' && <span className="ml-2 px-3 py-1 rounded-lg font-medium text-purple-700 bg-purple-100 dark:bg-purple-900 dark:text-purple-300">2nd Level Support</span>}
        {role === 'admin' && <>
          <span className="ml-2 px-3 py-1 rounded-lg font-medium text-orange-700 bg-orange-100 dark:bg-orange-900 dark:text-orange-300">Admin</span>
          <span className="ml-2 px-3 py-1 rounded-lg font-medium text-orange-700 bg-orange-50 dark:bg-orange-950 dark:text-orange-200">Benutzerverwaltung</span>
        </>}
      </div>
      <div className="flex gap-2">
        {!role ? (
  <>
    <Link href="/login" className="px-3 py-1 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition">Login</Link>
    <Link href="/register" className="px-3 py-1 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition">Register</Link>
  </>
) : (
  <>
    <a href="/profile" className="px-3 py-1 rounded-lg font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition cursor-pointer">{username}</a>
    <button
      className="px-3 py-1 rounded-lg font-medium text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition"
      onClick={async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
        setTimeout(() => window.location.reload(), 100);
      }}
    >Logout</button>
  </>
)}
      </div>
    </nav>
  );
}

