import { useEffect, useRef, useState } from "react";

export default function TicketChat({ ticketId, user, jiraStyle = false }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/comments?ticket_id=${ticketId}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
        setLoading(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
  }, [ticketId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    const body = { ticket_id: ticketId, user_id: user?.id, message };
    // Optimistisches UI
    setComments((old) => [
      ...old,
      {
        id: Math.random(), // temp ID
        ticket_id: ticketId,
        user_id: user?.id,
        username: user?.username || "Du",
        message,
        created_at: new Date().toISOString(),
        pending: true,
      },
    ]);
    setMessage("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Fehler beim Senden");
      // Neu laden
      fetch(`/api/comments?ticket_id=${ticketId}`)
        .then((res) => res.json())
        .then((data) => setComments(data));
    } catch (err) {
      // Fehlerbehandlung
    } finally {
      setSending(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [comments]);

  if (jiraStyle) {
    const handleJiraComment = async (e) => {
      e.preventDefault();
      if (!message.trim() && !file) return;
      setSending(true);
      const formData = new FormData();
      formData.append("ticket_id", ticketId);
      formData.append("user_id", user.id);
      formData.append("message", message);
      if (file) formData.append("image", file);
      try {
        const res = await fetch("/api/comments", {
          method: "POST",
          body: formData,
        });
        setMessage("");
        setFile(null);
        fetch(`/api/comments?ticket_id=${ticketId}`)
          .then((res) => res.json())
          .then((data) => setComments(data));
      } finally {
        setSending(false);
      }
    };
    
    return (
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl border bg-gray-900 bg-opacity-80 border-gray-800 text-white p-6 mx-auto my-8">
        <h3 className="mt-8 mb-4 text-lg font-bold text-white">Kommentare</h3>
        {user && (
          <form onSubmit={handleJiraComment} className="flex flex-col gap-2 mb-6">
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition min-h-[60px]"
              placeholder="Kommentar hinzufügen..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              style={{resize:'none',overflow:'hidden'}}
              rows={1}
              disabled={sending}
              maxLength={2000}
            />
            <div className="w-full flex flex-row justify-between items-center gap-2 mt-2">
  <label htmlFor="file-upload" className="cursor-pointer min-w-[160px] min-h-[44px] px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg shadow hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition flex items-center justify-center">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m8 4a4 4 0 01-8 0V8a4 4 0 018 0v8z" /></svg>
    Datei auswählen
    <input
      id="file-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={e => setFile(e.target.files[0])}
      disabled={sending}
    />
  </label>
  <button
    type="submit"
    disabled={sending || (!message.trim() && !file)}
    className="inline-flex items-center min-w-[160px] min-h-[44px] px-4 py-2 bg-blue-900 text-white border border-gray-700 rounded-lg shadow hover:bg-blue-600 focus:outline-none transition justify-center"
  >
    Kommentar speichern
  </button>
</div>
{file && (
  <span className="ml-2 text-sm text-gray-400 truncate max-w-[140px]">{file.name}</span>
)}
            {file && file.type.startsWith("image/") && (
              <div className="mt-2 flex justify-center">
                <img src={URL.createObjectURL(file)} alt="Vorschau" className="max-h-32 rounded shadow border" />
              </div>
            )}
            
        
           
          </form>
        )}
        {loading ? (
          <div className="text-center text-gray-400">Lade Kommentare...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400">Noch keine Kommentare.</div>
        ) : (
          <ul className="space-y-6">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold text-xl shadow-lg overflow-hidden border-2 border-white dark:border-gray-800">
  {c.profilepic ? (
    <img src={c.profilepic} alt={c.username || 'User'} className="object-cover w-full h-full" />
  ) : (
    c.username ? c.username.slice(0,2).toUpperCase() : 'SU'
  )}
</div>
                {/* Kommentarbox */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl shadow p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold text-blue-800 dark:text-blue-300">{c.username || "Support"}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <div className="whitespace-pre-line text-gray-900 dark:text-gray-100 text-base mb-2">{c.message}</div>
                  {c.image_url && (
                    <div className="mt-2">
                      <img src={c.image_url} alt="Anhang" className="max-h-72 rounded-lg border border-gray-200 dark:border-gray-700 shadow" />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  // Default (Chat-Ansicht)
  return (
    <div className="w-full max-w-2xl rounded-2xl shadow-2xl border bg-gray-900 bg-opacity-80 border-gray-800 text-white p-6 mx-auto my-8">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {loading ? (
          <div className="text-center text-gray-400">Lade Verlauf...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400">Noch keine Nachrichten.</div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className={`flex ${c.user_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm whitespace-pre-line ${
                  c.user_id === user?.id
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                } ${c.pending ? "opacity-60" : ""}`}
              >
                <div className="font-semibold mb-1 text-xs">
                  {c.user_id === user?.id ? "Du" : c.username || "Support"}
                  <span className="ml-2 text-[10px] text-gray-300 dark:text-gray-500">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {c.message}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          placeholder="Nachricht eingeben..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
          maxLength={1000}
          autoFocus
        />
        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-600 transition disabled:opacity-60"
        >
          Senden
        </button>
      </form>
    </div>
  );
}

