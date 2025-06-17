import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { username, password, role } = await req.json();
    if (!username || !password || !role) {
      return new Response(JSON.stringify({ message: 'Alle Felder sind erforderlich.' }), { status: 400 });
    }
    // Prüfen, ob User schon existiert
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return new Response(JSON.stringify({ message: 'Benutzername bereits vergeben.' }), { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);
    return new Response(JSON.stringify({ message: 'Registrierung erfolgreich.' }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Serverfehler', error: error.message }), { status: 500 });
  }
}
