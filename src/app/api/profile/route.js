import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Passe ggf. deine DB-Config an
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
};

export async function POST(req) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    if (!userCookie) {
      return new Response(JSON.stringify({ message: 'Nicht eingeloggt.' }), { status: 401 });
    }
    const user = JSON.parse(userCookie.value);
    const body = await req.json();
    const { username, currentPassword, newPassword, profilePicUrl } = body;

    const conn = await mysql.createConnection(dbConfig);
    try {
      // Hole aktuellen User
      const [rows] = await conn.execute('SELECT * FROM users WHERE id = ?', [user.id]);
      if (!rows.length) {
        return new Response(JSON.stringify({ message: 'User nicht gefunden.' }), { status: 404 });
      }
      const dbUser = rows[0];
      // Wenn Passwort geändert werden soll, prüfe currentPassword
      if (newPassword) {
        const ok = await bcrypt.compare(currentPassword, dbUser.password);
        if (!ok) {
          return new Response(JSON.stringify({ message: 'Falsches aktuelles Passwort.' }), { status: 400 });
        }
        const hash = await bcrypt.hash(newPassword, 10);
        await conn.execute('UPDATE users SET password = ? WHERE id = ?', [hash, user.id]);
      }
      // Username ändern
      if (username && username !== dbUser.username) {
        await conn.execute('UPDATE users SET username = ? WHERE id = ?', [username, user.id]);
      }
      // Profilbild ändern
      if (profilePicUrl) {
        await conn.execute('UPDATE users SET profilepic = ? WHERE id = ?', [profilePicUrl, user.id]);
      }
      return new Response(JSON.stringify({ message: 'Profil aktualisiert.' }), { status: 200 });
    } finally {
      await conn.end();
    }
  } catch (err) {
    console.error('API /api/profile error:', err);
    return new Response(JSON.stringify({ message: 'Interner Serverfehler: ' + (err.message || err) }), { status: 500 });
  }
}
