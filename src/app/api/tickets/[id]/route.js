import pool from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req, { params }) {
  try {
    const ticketId = params.id;
    const [rows] = await pool.query(`
      SELECT t.*, 
        u1.username AS created_by_username, 
        u2.username AS assigned_to_username
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?
      LIMIT 1
    `, [ticketId]);
    if (!rows.length) {
      return new Response(JSON.stringify({ error: 'Ticket nicht gefunden' }), { status: 404 });
    }
    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('user');
    if (!cookie?.value) {
      return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), { status: 401 });
    }
    const user = JSON.parse(cookie.value);
    if (user.role === 'customer') {
      return new Response(JSON.stringify({ error: 'Keine Berechtigung' }), { status: 403 });
    }
    const { assigned_to, status, escalated_from } = await req.json();
    const ticketId = params.id;
    // Prüfe, ob Ticket existiert
    const [rows] = await pool.query('SELECT assigned_to FROM tickets WHERE id = ?', [ticketId]);
    if (!rows.length) {
      return new Response(JSON.stringify({ error: 'Ticket nicht gefunden' }), { status: 404 });
    }
    // assigned_to-Logik 
    if (assigned_to !== undefined) {
      // Verhindern, wenn assigned_to gesetzt werden soll UND es schon einen Bearbeiter gibt UND assigned_to NICHT null ist
      if (assigned_to && rows[0].assigned_to) {
        return new Response(JSON.stringify({ error: 'Ticket ist bereits zugewiesen' }), { status: 409 });
      }
      await pool.query('UPDATE tickets SET assigned_to = ? WHERE id = ?', [assigned_to, ticketId]);
    }
    // Status-Update erlauben
    if (status !== undefined) {
      await pool.query('UPDATE tickets SET status = ? WHERE id = ?', [status, ticketId]);
    }
    // Eskalations-Logik: escalated_from speichern
    if (escalated_from !== undefined) {
      await pool.query('UPDATE tickets SET escalated_from = ? WHERE id = ?', [escalated_from, ticketId]);
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Serverfehler', details: error.message }), { status: 500 });
  }
}
