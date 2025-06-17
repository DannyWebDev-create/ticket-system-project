import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    console.log('Login-Request:', { username, password });
    if (!username || !password) {
      console.log('Fehlende Felder');
      return new Response(JSON.stringify({ message: 'Alle Felder sind erforderlich.' }), { status: 400 });
    }
    const [rows] = await pool.query('SELECT id, password, role FROM users WHERE username = ?', [username]);
    console.log('DB-User:', rows[0]);
    if (rows.length === 0) {
      console.log('Benutzer nicht gefunden');
      return new Response(JSON.stringify({ message: 'Benutzer nicht gefunden.' }), { status: 401 });
    }
    const user = rows[0];
    console.log('Vergleiche Passwort:', { eingegeben: password, hash: user.password });
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('PasswordMatch:', passwordMatch);
    if (!passwordMatch) {
      console.log('Falsches Passwort');
      return new Response(JSON.stringify({ message: 'Falsches Passwort.' }), { status: 401 });
    }
    // Setze sicheres Cookie mit Userdaten
    const cookieStore = await cookies();
    cookieStore.set('user', JSON.stringify({ id: user.id, username, role: user.role }), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7 Tage
    });
    console.log('Login erfolgreich!');
    return new Response(JSON.stringify({ message: 'Login erfolgreich.', role: user.role }), { status: 200 });
  } catch (error) {
    console.log('Serverfehler:', error);
    return new Response(JSON.stringify({ message: 'Serverfehler', error: error.message }), { status: 500 });
  }
}

