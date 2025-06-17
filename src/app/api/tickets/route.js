import pool from '@/lib/db';

export async function GET(req) {
  try {
    const [tickets] = await pool.query(`
      SELECT t.*, 
        u1.username AS created_by_username, 
        u2.username AS assigned_to_username
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      ORDER BY t.created_at DESC
    `);
    return new Response(JSON.stringify(tickets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, description, priority = 'mittel', created_by, assigned_to = null } = await req.json();
    if (!created_by) {
      return new Response(JSON.stringify({ error: 'Ersteller ist ein Pflichtfeld.' }), { status: 400 });
    }
    const [result] = await pool.query(
      'INSERT INTO tickets (title, description, priority, created_by, assigned_to) VALUES (?, ?, ?, ?, ?)',
      [title, description, priority, created_by, assigned_to]
    );
    const [ticketRows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
    return new Response(JSON.stringify(ticketRows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
