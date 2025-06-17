// Auth API route stub
// Later: Connect to DB and implement secure authentication

import { cookies } from 'next/headers';

const users = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin' },
  { id: 2, username: 'customer1', password: 'customer', role: 'customer' },
  { id: 3, username: 'support1', password: 'support1', role: 'support1' },
  { id: 4, username: 'support2', password: 'support2', role: 'support2' }
];

export async function POST(req) {
  // Login stub
  const { username, password } = await req.json();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }
  // Set cookie (stub, not secure)
  cookies().set('user', JSON.stringify({ id: user.id, role: user.role }), { httpOnly: true });
  return new Response(JSON.stringify({ id: user.id, username: user.username, role: user.role }), { status: 200 });
}

export async function DELETE() {
  // Logout stub
  cookies().set('user', '', { maxAge: 0 });
  return new Response(JSON.stringify({ message: 'Logged out' }), { status: 200 });
}
