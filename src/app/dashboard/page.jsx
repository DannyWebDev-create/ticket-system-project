"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TicketChat from "./TicketChat";
import Spinner from "../login/Spinner";

function StatusGroups({ tickets, router, closedCollapsed, setClosedCollapsed, searchOffen, setSearchOffen, searchInBearbeitung, setSearchInBearbeitung, searchWartend, setSearchWartend, searchGeschlossen, setSearchGeschlossen, user }) {
  const statusOrder = [
    { key: 'offen', label: 'Offen' },
    { key: 'in_bearbeitung', label: 'In Bearbeitung' },
    { key: 'wartend', label: 'Wartend' },
    { key: 'geschlossen', label: 'Geschlossen' }
  ];
  const grouped = Object.fromEntries(statusOrder.map(s => [s.key, []]));
  tickets.forEach(t => {
    const stat = (t.status || '').trim().toLowerCase();
    if (grouped[stat]) grouped[stat].push(t);
  });

  return (
    <>
      <StatusGroup
        grouped={grouped}
        statusKey="offen"
        label="Offen"
        searchValue={searchOffen}
        setSearchValue={setSearchOffen}
        router={router}
        user={user}
      />
      <StatusGroup
        grouped={grouped}
        statusKey="in_bearbeitung"
        label="In Bearbeitung"
        searchValue={searchInBearbeitung}
        setSearchValue={setSearchInBearbeitung}
        router={router}
        user={user}
      />
      <StatusGroup
        grouped={grouped}
        statusKey="wartend"
        label="Wartend"
        searchValue={searchWartend}
        setSearchValue={setSearchWartend}
        router={router}
        user={user}
      />
      <StatusGroup
        grouped={grouped}
        statusKey="geschlossen"
        label="Geschlossen"
        collapsible
        collapsed={closedCollapsed}
        setCollapsed={setClosedCollapsed}
        searchValue={searchGeschlossen}
        setSearchValue={setSearchGeschlossen}
        router={router}
        user={user}
      />
    </>
  );
}

function StatusGroup({ grouped, statusKey, label, collapsible, collapsed, setCollapsed, searchValue, setSearchValue, router, user }) {
  // Filterlogik für Tickets dieser Gruppe
  const filteredTickets = grouped[statusKey].filter(ticket => {
    const search = (searchValue || "").toLowerCase().trim();
    if (!search) return true;
    // Splitte Suchfeld in Wörter, ignoriere leere
    const words = search.split(/\s+/).filter(Boolean);
    // Kombiniere alle relevanten Felder in einen String
    const haystack = [ticket.title, ticket.created_by_username, ticket.assigned_to_username]
      .map(x => (x || "").toLowerCase())
      .join(" ");
    // Jedes Wort muss im haystack vorkommen
    return words.every(word => haystack.includes(word));
  });
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => collapsible && setCollapsed && setCollapsed(v => !v)}>
          <span className="text-xl font-bold text-white">{label}</span>
          {collapsible && (
            <svg className={`w-5 h-5 transition-transform ${collapsed ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          )}
        </div>
        <input
          type="text"
          className="max-w-xs px-3 py-2 ml-2 rounded border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder={`Suche in ${label}...`}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
      </div>
      <div className={collapsible && collapsed ? 'hidden' : ''}>

        <table className="min-w-full bg-gray-800 rounded shadow table-fixed">
          <thead>
            <tr className="text-white">
              <th className="py-2 px-3 border-b text-center w-3/5">Titel</th>
              <th className="py-2 px-3 border-b text-center w-1/12">Priorität</th>
              <th className="py-2 px-3 border-b text-center w-1/12">Ersteller</th>
              <th className="py-2 px-3 border-b text-center w-1/12">Bearbeiter</th>
              <th className="py-2 px-3 border-b text-center w-24">Erstellt am</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-white/60">Keine Tickets gefunden.</td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr key={ticket.id} className="cursor-pointer hover:bg-gray-700" onClick={() => router.push(`/dashboard/${ticket.id}`)}>
                  <td className="py-2 px-3 border-b text-white text-center">{ticket.title}</td>
                  <td className="py-2 px-3 border-b text-white text-center">{ticket.priority}</td>
                  <td className="py-2 px-3 border-b text-white text-center">{ticket.created_by_username || '-'}</td>
                  <td className="py-2 px-3 border-b text-white text-center">
                    {ticket.assigned_to_username
                      ? ticket.assigned_to_username
                      : (
                        (user?.role === 'support2' && ticket.status === 'offen' && !ticket.assigned_to && ticket.escalated_from === 'support1') ? (
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={async e => {
                              e.stopPropagation();
                              await fetch(`/api/tickets/${ticket.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ assigned_to: user.id })
                              });
                              ticket.assigned_to = user.id;
                              ticket.assigned_to_username = user.username;
                              router.refresh?.();
                            }}
                          >Mir zuweisen</button>
                        ) : (user?.role === 'support1' && ticket.status === 'offen' && !ticket.assigned_to && ticket.escalated_from !== 'support1') ? (
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={async e => {
                              e.stopPropagation();
                              await fetch(`/api/tickets/${ticket.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ assigned_to: user.id })
                              });
                              ticket.assigned_to = user.id;
                              ticket.assigned_to_username = user.username;
                              router.refresh?.();
                            }}
                          >Mir zuweisen</button>
                        ) : 'Unassigned'
                      )
                    }
                  </td>
                  <td className="py-2 px-3 border-b text-white text-center">{ticket.created_at && new Date(ticket.created_at).toLocaleString("de-DE", {day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false}).replace(",", "")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Such-States für jede Gruppe
  const [searchOffen, setSearchOffen] = useState("");
  const [searchInBearbeitung, setSearchInBearbeitung] = useState("");
  const [searchWartend, setSearchWartend] = useState("");
  const [searchGeschlossen, setSearchGeschlossen] = useState("");
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [closedCollapsed, setClosedCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  // Neues Ticket direkt anlegen und weiterleiten
  async function handleCreateNewTicket() {
    if (!user) return;
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "",
          description: "",
          priority: "mittel",
          assigned_to: null,
          created_by: user.id
        })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/dashboard/${data.id}`);
      } else {
        setError("Ticket konnte nicht erstellt werden.");
      }
    } catch (err) {
      setError("Serverfehler beim Erstellen des Tickets.");
    }
  }


  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  async function fetchUser() {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data);
    } catch {
      setError("Nicht eingeloggt oder Session abgelaufen.");
    }
  }

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (user?.role === "customer") {
        setTickets(data.filter(ticket => ticket.created_by === user.id || (ticket.shared_with && ticket.shared_with.includes(user.id))));
      } else if (user?.role === "support1") {
        setTickets(data.filter(ticket => (
          (!ticket.assigned_to || ticket.assigned_to === user.id)
          && ticket.escalated_from !== 'support1'
          || (ticket.shared_with && ticket.shared_with.includes(user.id))
        )));
      } else if (user?.role === "support2") {
        setTickets(data.filter(ticket => (
          ticket.assigned_to === user.id ||
          (ticket.status?.trim().toLowerCase() === 'wartend') ||
          (ticket.status?.trim().toLowerCase() === 'offen' && ticket.escalated_from === 'support1') ||
          (ticket.shared_with && ticket.shared_with.includes(user.id))
        )));
      } else if (user?.role === "admin") {
        setTickets(data);
      }
    } catch (err) {
      setError("Fehler beim Laden der Tickets.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title || !form.description) {
      setError("Bitte alle Felder ausfüllen!");
      return;
    }
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, created_by: user.id, assigned_to: form.assigned_to ? form.assigned_to : null })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Anlegen des Tickets.");
      } else {
        setSuccess("Ticket erfolgreich erstellt.");
        setForm({ title: "", description: "", priority: "mittel", assigned_to: "" });
        fetchTickets();
        setShowForm(false);
      }
    } catch (err) {
      setError("Serverfehler.");
    }
  }

  const [detailTicket, setDetailTicket] = useState(null);

  if (!user) {
    if (error) {
      return <div className="text-center mt-10 text-red-600">{error}</div>;
    }
    // Spinner anzeigen solange user==null und kein Fehler
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Spinner text="Benutzerdaten werden geladen..." />
      </div>
    );
  }

  async function assignTicket(ticketId) {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: user.id })
      });
      if (res.ok) {
        fetchTickets();
      } else {
        setError("Konnte Ticket nicht zuweisen.");
      }
    } catch {
      setError("Serverfehler beim Zuweisen.");
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Meine Tickets</h1>
        <button
          onClick={() => router.push('/dashboard/create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-lg"
        >
          <span className="text-2xl">＋</span> Neues Ticket
        </button>
      </div>

      {loading ? (
        <div className="text-white">Lade Tickets...</div>
      ) : (
        <div className="overflow-x-auto mt-8">
          <StatusGroups
            tickets={tickets}
            router={router}
            closedCollapsed={closedCollapsed}
            setClosedCollapsed={setClosedCollapsed}
            searchOffen={searchOffen}
            setSearchOffen={setSearchOffen}
            searchInBearbeitung={searchInBearbeitung}
            setSearchInBearbeitung={setSearchInBearbeitung}
            searchWartend={searchWartend}
            setSearchWartend={setSearchWartend}
            searchGeschlossen={searchGeschlossen}
            setSearchGeschlossen={setSearchGeschlossen}
            user={user}
          />
        </div>
      )}
    </div>
  </div>
  );
}
