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

    const clientId = getClientId(req);

    if (method === 'GET') {
      const isLiked = likes.has(clientId);
      return new Response(
        JSON.stringify({ 
          count: likes.size,
          isLiked
        }),
        { status: 200, headers }
      );
    }

    if (method === 'POST') {
      const body = await req.json();
      const { action } = body;

      if (action === 'add') {
        likes.add(clientId);
      } else if (action === 'remove') {
        likes.delete(clientId);
      }

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
