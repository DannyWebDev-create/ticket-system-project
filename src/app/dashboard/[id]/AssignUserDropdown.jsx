import { useEffect, useState } from "react";

export default function AssignUserDropdown({ ticket, setTicket }) {
  // Liste aller Nutzer
  const [users, setUsers] = useState([]);
  // Lädt Nutzerliste
  const [loading, setLoading] = useState(true);
  // Suchbegriff für Nutzer
  const [query, setQuery] = useState("");
  // Ob gerade gespeichert wird
  const [saving, setSaving] = useState(false);
  // Gefilterte Nutzer-Vorschläge
  const [suggestions, setSuggestions] = useState([]);
  // IDs der Nutzer, mit denen das Ticket geteilt ist
  const [sharedWith, setSharedWith] = useState(ticket.shared_with || []);

  // Nutzerliste beim Laden der Komponente holen
  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

  // Filtert Nutzer-Vorschläge je nach Suchbegriff
  useEffect(() => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }
    const lower = query.toLowerCase();
    setSuggestions(users.filter(u =>
      (u.username.toLowerCase().includes(lower) || u.role.toLowerCase().includes(lower) || (u.role === 'customer' && 'user'.includes(lower))) &&
      !sharedWith.includes(u.id)
    ));
  }, [query, users, sharedWith]);

  // Nutzer zum geteilten Ticket hinzufügen
  const handleAdd = async (userId) => {
    setSaving(true);
    const newShared = [...sharedWith, userId];
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shared_with: newShared })
    });
    setSharedWith(newShared);
    setTicket(t => ({ ...t, shared_with: newShared }));
    setQuery("");
    setSaving(false);
  };

  // Nutzer vom geteilten Ticket entfernen
  const handleRemove = async (userId) => {
    setSaving(true);
    const newShared = sharedWith.filter(id => id !== userId);
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shared_with: newShared })
    });
    setSharedWith(newShared);
    setTicket(t => ({ ...t, shared_with: newShared }));
    setSaving(false);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          placeholder="Ticket teilen mit..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={loading || saving}
          aria-label="User suchen, um Ticket zu teilen"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-56 overflow-auto text-white">
            {suggestions.map(u => (
              <li
                key={u.id}
                className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-800 cursor-pointer flex items-center gap-2"
                onClick={() => handleAdd(u.id)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(u.id); }}
              >
                <span className="font-semibold text-white">{u.username}</span>
                <span className="text-xs text-white">
                  {u.role === 'support1' ? '(1st Level)' : u.role === 'support2' ? '(2nd Level)' : u.role === 'customer' ? '(User)' : `(${u.role})`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Chips für geteilte User */}
      <div className="flex flex-wrap gap-2 mt-3">
        {sharedWith.map(id => {
          const u = users.find(u => u.id === id);
          if (!u) return null;
          return (
            <span key={id} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-sm font-medium shadow">
              {u.username} <span className="ml-1 text-xs text-gray-400">({u.role})</span>
              <button
                type="button"
                className="ml-2 text-blue-700 dark:text-blue-200 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
                onClick={() => handleRemove(id)}
                aria-label={`Entferne ${u.username}`}
                disabled={saving}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

