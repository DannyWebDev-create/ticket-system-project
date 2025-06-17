import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

export const maxSize = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  const cookieStore = cookies();
  const userCookie = cookieStore.get('user');
  if (!userCookie) {
    return new Response(JSON.stringify({ message: 'Nicht eingeloggt.' }), { status: 401 });
  }
  const user = JSON.parse(userCookie.value);

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) {
    return new Response(JSON.stringify({ message: 'Kein Bild hochgeladen.' }), { status: 400 });
  }
  if (file.size > maxSize) {
    return new Response(JSON.stringify({ message: 'Bild zu groß (max 5MB).' }), { status: 400 });
  }
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['jpg','jpeg','png','gif','webp'].includes(ext)) {
    return new Response(JSON.stringify({ message: 'Nur JPG, PNG, GIF, WEBP erlaubt.' }), { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const fileName = `user_${user.id}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  // Rückgabe der URL für die Datenbank
  return new Response(JSON.stringify({ url: `/uploads/${fileName}` }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
