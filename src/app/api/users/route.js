// User API route stub
// Later: Connect to DB (e.g., MySQL via XAMPP) and hash passwords

import pool from '@/lib/db';

export async function GET(req) {
  try {
    const [rows] = await pool.query('SELECT id, username, role FROM users');
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  // Create a user (stub)
  const body = await req.json();
  const newUser = { ...body, id: Date.now() };
  users.push(newUser);
  return new Response(JSON.stringify({ ...newUser, password: undefined }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
