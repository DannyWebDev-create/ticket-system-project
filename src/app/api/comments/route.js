import pool from '@/lib/db';

// GET /api/comments?ticket_id=123
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get('ticket_id');
  if (!ticketId) {
    return new Response(JSON.stringify({ error: 'ticket_id erforderlich' }), { status: 400 });
  }
  try {
    const [comments] = await pool.query(
      `SELECT c.*, u.username, u.profilepic FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.ticket_id = ? ORDER BY c.created_at ASC`,
      [ticketId]
    );
    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// POST /api/comments
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    let ticket_id, user_id, message, image_url = null;
    let isMultipart = req.headers.get('content-type')?.includes('multipart/form-data');
    if (isMultipart) {
      const formData = await req.formData();
      ticket_id = formData.get('ticket_id');
      user_id = formData.get('user_id');
      message = formData.get('message');
      const file = formData.get('image');
      if (file && typeof file === 'object' && file.size > 0) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        const ext = path.extname(file.name) || '.jpg';
        const fileName = `comment_${Date.now()}_${Math.random().toString(36).substring(2,8)}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        const arrayBuffer = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(arrayBuffer));
        image_url = `/uploads/${fileName}`;
      }
    } else {
      const body = await req.json();
      ticket_id = body.ticket_id;
      user_id = body.user_id;
      message = body.message;
    }
    if (!ticket_id || !user_id || (!message && !image_url)) {
      return new Response(JSON.stringify({ error: 'ticket_id, user_id, message oder Bild erforderlich' }), { status: 400 });
    }
    await pool.query(
      'INSERT INTO comments (ticket_id, user_id, message, image_url) VALUES (?, ?, ?, ?)',
      [ticket_id, user_id, message, image_url]
    );
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
