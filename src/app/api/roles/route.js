// Roles API route stub
const roles = ['customer', 'support1', 'support2', 'admin'];

export async function GET() {
  return new Response(JSON.stringify(roles), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
