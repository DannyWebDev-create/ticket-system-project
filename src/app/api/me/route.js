import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

export async function GET() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('user');
  if (!cookie?.value) {
    return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), { status: 401 });
  }
  try {
    const user = JSON.parse(cookie.value);
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT id, username, role, profilepic FROM users WHERE id = ?', [user.id]);
    await conn.end();
    if (!rows.length) {
      return new Response(JSON.stringify({ error: 'User nicht gefunden' }), { status: 404 });
    }
    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Fehler: ' + err.message }), { status: 500 });
  }
}