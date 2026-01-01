/**
 * Vercel Serverless Function для счетчика посещений
 * GET - получить количество
 * POST - увеличить счетчик
 * 
 * Для production используйте Vercel KV:
 * 1. npm install @vercel/kv
 * 2. В Vercel Dashboard создайте KV Database
 * 3. Раскомментируйте код с KV ниже
 */

// import { kv } from '@vercel/kv';

// Простое in-memory хранилище (сбрасывается при перезапуске)
// В production используйте Vercel KV
let visitCount = 0;

// Инициализация из KV (раскомментируйте для production)
// async function initVisitCount() {
//   try {
//     const stored = await kv.get<number>('visitCount');
//     visitCount = stored || 0;
//   } catch (error) {
//     console.error('Error loading visit count:', error);
//   }
// }

// initVisitCount();

export default async function handler(req: Request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Логирование для отладки
  console.log('[Visit API] Request:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    if (req.method === 'GET') {
      console.log('[Visit API] GET - returning count:', visitCount);
      return new Response(
        JSON.stringify({ count: visitCount }),
        { status: 200, headers }
      );
    }

    if (req.method === 'POST') {
      visitCount += 1;
      console.log('[Visit API] POST - new count:', visitCount);
      
      return new Response(
        JSON.stringify({ count: visitCount }),
        { status: 200, headers }
      );
    }

    console.log('[Visit API] Method not allowed:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  } catch (error) {
    console.error('[Visit API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers }
    );
  }
}
