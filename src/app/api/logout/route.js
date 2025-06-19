import { cookies } from 'next/headers';

// Cookie entfernen
export async function POST() {
  const cookieStore = cookies();
  cookieStore.set('user', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
  });
  return new Response(JSON.stringify({ message: 'Logout erfolgreich.' }), { status: 200 });
}
