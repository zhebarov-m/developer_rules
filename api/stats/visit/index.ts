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

export default async function handler(req: Request): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const method = req.method;
    
    if (method === 'OPTIONS') {
      return new Response(null, { status: 200, headers });
    }

    if (method === 'GET') {
      return new Response(
        JSON.stringify({ count: visitCount }),
        { status: 200, headers }
      );
    }

    if (method === 'POST') {
      visitCount += 1;
      return new Response(
        JSON.stringify({ count: visitCount }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}
