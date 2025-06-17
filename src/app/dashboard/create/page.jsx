"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "../../login/Spinner";

export default function CreateTicketPage() {
  // Scrollen auf dieser Seite verhindern
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);
  // Router für Navigation
  const router = useRouter();
  // Aktueller Nutzer
  const [user, setUser] = useState(null);
  // Formularzustand für neues Ticket
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "mittel",
    assigned_to: ""
  });
  // Fehlermeldung für Anzeige
  const [error, setError] = useState("");
  // Lädt beim Anlegen
  const [loading, setLoading] = useState(false);

  // Nutzerinformationen laden
  useEffect(() => {
    fetch("/api/me").then(async res => {
      if (res.ok) setUser(await res.json());
      else router.replace("/login");
    });
  }, [router]);

  // Aktualisiert Formularfelder
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Ticket absenden
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description) {
      setError("Bitte Titel und Beschreibung ausfüllen.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, created_by: user.id, assigned_to: form.assigned_to || null })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/dashboard/${data.id}`);
      } else {
        setError(data.error || "Fehler beim Anlegen des Tickets.");
      }
    } catch {
      setError("Serverfehler beim Anlegen des Tickets.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 overflow-hidden">
        <Spinner text="Benutzerdaten werden geladen..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900">
      <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl p-8 animate-fadein">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Neues Ticket erstellen</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium text-white">Titel</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required maxLength={150} className="w-full border px-3 py-2 rounded bg-gray-900 text-white" placeholder="Kurzer Titel für das Problem" />
            <div className="text-right text-xs text-gray-400 mt-1">{form.title.length}/150</div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-white">Beschreibung</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={7} className="w-full border px-3 py-4 rounded bg-gray-900 text-white text-base resize-vertical min-h-[140px]" placeholder="Beschreibe dein Problem möglichst genau..." />
          </div>
          <div>
            <label className="block mb-1 font-medium text-white">Priorität</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="w-full border px-3 py-2 rounded bg-gray-900 text-white">
              <option value="niedrig">Niedrig</option>
              <option value="mittel">Mittel</option>
              <option value="hoch">Hoch</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold rounded-full shadow-lg px-6 py-3 mt-4 transition-all duration-200 text-lg">
            {loading ? "Ticket wird erstellt..." : "Ticket erstellen"}
          </button>
          {error && <div className="text-red-400 mt-2 text-center">{error}</div>}
        </form>
      </div>
    </main>
  );
}
