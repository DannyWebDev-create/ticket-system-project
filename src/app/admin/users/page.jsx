import { useState, useEffect } from "react";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("support1");
  const [tempPassword, setTempPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const generatePassword = () => {
    // Einfache Passwort-Generierung (8 Zeichen, nur Demo)
    return Math.random().toString(36).slice(-8);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const password = tempPassword || generatePassword();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    if (res.ok) {
      setSuccess("Benutzer erfolgreich angelegt!");
      setUsername("");
      setRole("support1");
      setTempPassword("");
      // Refresh list
      fetch("/api/users").then(res => res.json()).then(setUsers);
    } else {
      const data = await res.json();
      setError(data.message || "Fehler beim Anlegen.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 border border-gray-100 dark:border-gray-800 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-orange-700 dark:text-orange-400 mb-6 text-center">Benutzerverwaltung</h1>
        <form onSubmit={handleCreate} className="flex flex-col gap-4 mb-8">
          <div>
            <label className="block font-semibold mb-1">Benutzername</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Rolle</label>
            <select
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="support1">1st Level Support</option>
              <option value="support2">2nd Level Support</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Temporäres Passwort (optional)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={tempPassword}
              onChange={e => setTempPassword(e.target.value)}
              placeholder="Wird sonst automatisch generiert"
            />
          </div>
          <button type="submit" className="w-full py-2 mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow">Benutzer anlegen</button>
          {success && <div className="text-green-600 text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
        <h2 className="text-xl font-bold mb-2">Alle Nutzer</h2>
        {loading ? <div>Lade Nutzer...</div> : (
          <table className="w-full text-sm table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2 text-left">Benutzername</th>
                <th className="p-2 text-left">Rolle</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role !== 'customer' && u.role !== 'admin').map(u => (
                <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.role === 'support1' ? '1st Level' : '2nd Level'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
