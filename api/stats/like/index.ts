/**
 * Vercel Serverless Function для лайков
 * GET - получить статистику лайков
 * POST - добавить/убрать лайк
 * 
 * Для production используйте Vercel KV:
 * 1. npm install @vercel/kv
 * 2. В Vercel Dashboard создайте KV Database
 * 3. Раскомментируйте код с KV ниже
 */

// import { kv } from '@vercel/kv';

// In-memory хранилище (сбрасывается при перезапуске)
// В production используйте Vercel KV
const likes = new Set<string>();

// Инициализация из KV (раскомментируйте для production)
// async function initLikes() {
//   try {
//     const stored = await kv.smembers('likes');
//     stored.forEach(id => likes.add(id));
//   } catch (error) {
//     console.error('Error loading likes:', error);
//   }
// }

// initLikes();

// Функция для получения уникального ID пользователя
function getClientId(req: Request): string {
  // Используем IP адрес как уникальный идентификатор
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback на user-agent + timestamp (для dev)
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${userAgent}_${Date.now()}`;
}

export default async function handler(req: Request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    const clientId = getClientId(req);

    if (req.method === 'GET') {
      // Для production с KV:
      // const isLiked = await kv.sismember('likes', clientId);
      // const count = await kv.scard('likes');
      // return new Response(
      //   JSON.stringify({ count, isLiked: isLiked === 1 }),
      //   { status: 200, headers }
      // );
      
      const isLiked = likes.has(clientId);
      return new Response(
        JSON.stringify({ 
          count: likes.size,
          isLiked
        }),
        { status: 200, headers }
      );
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { action } = body; // 'add' или 'remove'

      if (action === 'add') {
        likes.add(clientId);
        // Для production с KV:
        // await kv.sadd('likes', clientId);
      } else if (action === 'remove') {
        likes.delete(clientId);
        // Для production с KV:
        // await kv.srem('likes', clientId);
      }

      // Для production с KV:
      // const count = await kv.scard('likes');
      // const isLiked = await kv.sismember('likes', clientId);
      // return new Response(
      //   JSON.stringify({ count, isLiked: isLiked === 1 }),
      //   { status: 200, headers }
      // );

      return new Response(
        JSON.stringify({ 
          count: likes.size,
          isLiked: likes.has(clientId)
        }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers }
    );
  }
}
