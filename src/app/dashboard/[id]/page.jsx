"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TicketChat from "../TicketChat";
import AssignUserDropdown from "./AssignUserDropdown";

export default function TicketDetailPage() {
  // Router für Navigation
  const router = useRouter();
  // Ticket-ID aus der URL
  const { id } = useParams();
  // Aktuelles Ticket
  const [ticket, setTicket] = useState(null);
  // Aktuell eingeloggter Nutzer
  const [user, setUser] = useState(null);
  // Lädt Ticketdaten
  const [loading, setLoading] = useState(true);
  // Fehlermeldung für Anzeige
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (res.ok) {
        setUser(await res.json());
      } else {
        router.replace("/login");
      }
    });
  }, [router]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/tickets/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Fehler beim Laden des Tickets.");
        setLoading(false);
      });
  }, [id]);

  if (loading || !ticket || !user) return <div className="p-10 text-center">Lade Ticket...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  // Helper: Status-Badge
  // Farben für Status-Badges
  const statusColors = {
    offen: "bg-blue-900 text-white border-blue-800",
    in_bearbeitung: "bg-yellow-900 text-white border-yellow-800",
    wartend: "bg-purple-900 text-white border-purple-800",
    geschlossen: "bg-gray-900 text-white border-gray-700"
  };
  // Labels für Status-Badges
  const statusLabel = {
    offen: "Offen",
    in_bearbeitung: "In Bearbeitung",
    wartend: "Wartend",
    geschlossen: "Geschlossen"
  };
  // Farben für Prioritäts-Badges
  const prioColors = {
    niedrig: "bg-green-900 text-white border-green-800",
    mittel: "bg-yellow-900 text-white border-yellow-800",
    hoch: "bg-red-900 text-white border-red-800"
  };
  // Avatar-Komponente für Nutzerbild oder Initialen
  function Avatar({ username, profilepic }) {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold text-lg shadow border-2 border-white dark:border-gray-800 overflow-hidden">
        {profilepic ? <img src={profilepic} alt={username} className="object-cover w-full h-full" /> : (username ? username.slice(0,2).toUpperCase() : "SU")}
      </div>
    );
  }
  return (
    <main className="min-h-screen py-10 px-2 flex flex-col items-center bg-gradient-to-br from-gray-900 to-blue-900">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border bg-gray-900 bg-opacity-80 ${ticket.status === "geschlossen" ? "border-gray-700" : "border-gray-800"}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 border-b border-gray-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {(!ticket.title || !ticket.description) && user && ticket.created_by === user.id && (
                <form
                  className="flex flex-col gap-2 w-full max-w-xl bg-gray-800 p-4 rounded-xl mb-2"
                  onSubmit={async e => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const newTitle = formData.get('title');
                    const newDesc = formData.get('description');
                    const res = await fetch(`/api/tickets/${ticket.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: newTitle, description: newDesc })
                    });
                    if (res.ok) {
                      setTicket(t => ({ ...t, title: newTitle, description: newDesc }));
                    }
                  }}
                >
                  <label className="text-white font-semibold">Titel</label>
                  <input
                    name="title"
                    defaultValue={ticket.title}
                    required
                    className="w-full border px-3 py-2 rounded bg-gray-900 text-white mb-2"
                    placeholder="Ticket-Titel eingeben"
                  />
                  <label className="text-white font-semibold">Beschreibung</label>
                  <textarea
                    name="description"
                    defaultValue={ticket.description}
                    required
                    className="w-full border px-3 py-2 rounded bg-gray-900 text-white mb-2"
                    placeholder="Ticket-Beschreibung eingeben"
                  />
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold">Speichern</button>
                </form>
              )}
              {((ticket.title && ticket.description) || !user || ticket.created_by !== user.id) && (
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2 text-white">
                  {ticket.title}
                  <div className="text-xs text-blue-100 mb-2">ID: {ticket.id} &bull; {ticket.created_at && new Date(ticket.created_at).toLocaleString()}</div>
                </h2>
              )}
            </div>
          </div>

        </div>
        {/* Ersteller & Bearbeiter & Ticket teilen */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Avatar username={ticket.created_by_username} profilepic={ticket.created_by_profilepic} />
            <div className="text-sm">
              <span className="font-semibold text-white">Kunde</span><br/>
              <span className="text-xs text-blue-100">{ticket.created_by_username || '-'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar username={ticket.assigned_to_username} profilepic={ticket.assigned_to_profilepic} />
            <div className="text-sm">
              <span className="font-semibold text-white">{ticket.assigned_to_username === ticket.created_by_username ? 'Kunde' : 'Bearbeiter'}</span><br/>
              <span className="text-xs text-blue-100">{ticket.assigned_to_username || '-'}</span>
            </div>
          </div>
          {/* Ticket teilen ganz rechts */}
          {['support1','support2','admin'].includes(user.role) && (
            <div className="md:ml-auto md:mr-0 mt-4 md:mt-0 min-w-[170px] max-w-xs">
              <AssignUserDropdown ticket={ticket} setTicket={setTicket} />
            </div>
          )}
        </div>
        {/* Beschreibung */}
        <div className="px-6 py-6 border-b border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <div className="font-semibold text-white text-lg">Beschreibung</div>
            <div className="flex flex-row gap-2 mt-2 md:mt-0">
              <span className={`px-4 py-1 rounded-full border text-sm font-semibold bg-opacity-70 whitespace-nowrap ${statusColors[ticket.status]} text-white`}>{statusLabel[ticket.status] || ticket.status}</span>
              <span className={`px-3 py-1 rounded-full border text-sm font-semibold bg-opacity-70 ${prioColors[ticket.priority]} text-white`}>{ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1)}</span>
            </div>
          </div>
          {(!ticket.description && user && ticket.created_by === user.id) ? null : (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 whitespace-pre-line text-base text-white rounded-xl p-4 shadow-inner bg-gray-900">
              <div className="flex-1 min-w-0">{ticket.description}</div>

            </div>
          )}
        </div>
        {/* Status-Wechsel & Ticket teilen für Support */}
        {['support1','support2','admin'].includes(user.role) && ticket.status !== 'geschlossen' && (
          <div className="px-6 py-6 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-row justify-between items-center w-full gap-3">
              <div className="flex flex-row gap-3">
                {['offen','in_bearbeitung','wartend','geschlossen'].map(s => (
                  <button
                    key={s}
                    className={`whitespace-nowrap text-sm px-3 py-1 font-semibold rounded-full shadow border transition duration-150 ${statusColors[s]} ${ticket.status === s ? "ring-2 ring-blue-400 dark:ring-blue-600" : "hover:scale-105 hover:brightness-110"}`}
                    onClick={async () => {
                      await fetch(`/api/tickets/${ticket.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: s })
                      });
                      setTicket(t => ({ ...t, status: s }));
                    }}
                    disabled={ticket.status === s}
                  >{statusLabel[s]}</button>
                ))}
              </div>
              {/* Eskalieren-Button nur für support1, wenn Status nicht wartend/geschlossen */}
              {user.role === 'support1' && !['wartend','geschlossen'].includes(ticket.status) && (
                <button
                  className="whitespace-nowrap text-sm px-3 py-1 font-semibold rounded-full shadow border bg-red-900 text-white border-red-800 transition duration-150 hover:bg-red-200 dark:hover:bg-red-800 hover:scale-105 hover:brightness-110"
                  onClick={async () => {
                    if (!window.confirm('Wirklich eskalieren?')) return;
                    const res = await fetch(`/api/tickets/${ticket.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'offen', assigned_to: null, escalated_from: 'support1' })
                    });
                    if (!res.ok) {
                      let msg = 'Fehler beim Eskalieren';
                      try {
                        const data = await res.json();
                        msg = data.error || msg;
                      } catch {}
                      alert(msg);
                      return;
                    }
                    setTicket(t => ({ ...t, status: 'offen', assigned_to: null, assigned_to_username: null, escalated_from: 'support1' }));
                    router.push('/dashboard');
                  }}
                >Eskalieren</button>
              )}
            </div>

          </div>
        )}
      </div>
      {/* Chat-Bereich */}
      <div className="mt-8 w-full max-w-2xl">
        <TicketChat ticketId={ticket.id} user={user} jiraStyle />
      </div>
    </main>
  );
}
