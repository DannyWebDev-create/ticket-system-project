"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  // Scrollen auf dieser Seite verhindern
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: "", currentPassword: "", newPassword: "", repeatPassword: "" });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        setForm(f => ({ ...f, username: u.username }));
        if (u.profilePicUrl) setPreview(u.profilePicUrl);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    // Validierung
    if (form.newPassword && form.newPassword !== form.repeatPassword) {
      setError("Neue Passwörter stimmen nicht überein.");
      setLoading(false);
      return;
    }
    // Bei jeder Änderung ist das aktuelle Passwort Pflicht
    if ((form.username !== user.username || form.newPassword || profilePic) && !form.currentPassword) {
      setError("Bitte aktuelles Passwort eingeben, um Änderungen zu speichern.");
      setLoading(false);
      return;
    }
    // Wenn Benutzername geändert wurde, ist das aktuelle Passwort Pflicht
    if (form.username !== user.username && !form.currentPassword) {
      setError("Bitte aktuelles Passwort eingeben, um den Benutzernamen zu ändern.");
      setLoading(false);
      return;
    }
    try {
      // Profilbild upload
      let picUrl = null;
      if (profilePic) {
        const data = new FormData();
        data.append("file", profilePic);
        const res = await fetch("/api/profilepic", { method: "POST", body: data });
        if (!res.ok) throw new Error("Fehler beim Upload des Profilbilds.");
        const picData = await res.json();
        picUrl = picData.url;
      }
      // Username/Passwort update
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          profilePicUrl: picUrl,
        })
      });
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error("Serverfehler (ungültige Antwort). Bitte später erneut versuchen.");
      }
      if (!res.ok) throw new Error(data.message || "Fehler beim Speichern.");
      setSuccess("Profil erfolgreich aktualisiert!");
      setForm(f => ({ ...f, currentPassword: "", newPassword: "", repeatPassword: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center overflow-auto">
      <div className="w-full max-w-2xl mx-auto p-2">
        <div className="rounded-3xl shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden flex flex-col items-center">


        {/* Header mit großem Avatar */}
          <div className="flex flex-col items-center justify-center pt-8 pb-2 w-full bg-gradient-to-t from-blue-700/80 via-blue-500/80 to-blue-400/60 relative">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-white/70 shadow-2xl overflow-hidden mb-3 bg-gray-200/50 flex items-center justify-center ring-4 ring-blue-400/40">
                {(preview || (user && user.profilepic)) ? (
                  <img src={preview || user.profilepic} alt="Profilbild" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-8xl text-blue-200">👤</span>
                )}
                <button
                  type="button"
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all border-2 border-white/70"
                  style={{boxShadow:'0 4px 20px 0 rgba(30,64,175,0.25)'}}
                  onClick={() => fileInputRef.current.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a2.25 2.25 0 113.182 3.182l-1.688 1.688m-2.181-3.182a9 9 0 11-12.728 0m12.728 0L12 9.75m0 0L7.318 5.068m4.682 4.682V3.75" />
                  </svg>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePicChange}
                />
              </div>
            </div>
            <div className="flex flex-col items-center mt-2 mb-2">
              <span className="text-2xl font-extrabold text-white drop-shadow-lg">{form.username}</span>
              <span className="text-sm text-blue-100 tracking-wide">{user?.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
            </div>
          </div>



        </div>

        {/* Card für Userdaten */}
          <form onSubmit={handleSubmit} className="w-full px-4 md:px-8 pb-8 pt-4 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Benutzername</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-100 focus:ring-2 focus:ring-blue-400 outline-none text-base backdrop-blur-md transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Derzeitiges Passwort <span className='opacity-60'>(zum Ändern erforderlich)</span></label>
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-100 focus:ring-2 focus:ring-blue-400 outline-none text-base backdrop-blur-md transition"
                  required={!!form.newPassword}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Neues Passwort</label>
                <input
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-100 focus:ring-2 focus:ring-blue-400 outline-none text-base backdrop-blur-md transition"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Neues Passwort wiederholen</label>
                <input
                  name="repeatPassword"
                  type="password"
                  value={form.repeatPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-100 focus:ring-2 focus:ring-blue-400 outline-none text-base backdrop-blur-md transition"
                  autoComplete="new-password"
                />
              </div>
            </div>
            {error && <div className="text-red-400 text-center font-semibold mt-2">{error}</div>}
            {success && <div className="text-green-400 text-center font-semibold mt-2">{success}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400 via-blue-600 to-blue-700 text-white font-extrabold text-lg shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-150 disabled:opacity-60 tracking-wide"
            >
              {loading ? "Speichern..." : "Profil speichern"}
            </button>
          </form>
        </div>
      </div>
    
  );
}
