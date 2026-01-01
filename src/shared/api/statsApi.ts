/**
 * API клиент для работы со статистикой
 */
import * as mockApi from './mockStatsApi';

// В dev используем mock, в production - реальный API
// В dev используем mock с localStorage (симулирует глобальное хранилище)
// В production используем реальный Vercel API
const API_BASE = '/api/stats';

// Более надежная проверка окружения
// В production на Vercel: import.meta.env.PROD === true, import.meta.env.DEV === false
// В dev: import.meta.env.DEV === true
const USE_MOCK = import.meta.env.DEV === true || 
                 import.meta.env.MODE === 'development' ||
                 window.location.hostname === 'localhost' ||
                 window.location.hostname === '127.0.0.1';

// Логируем режим для отладки
if (typeof window !== 'undefined') {
  console.log('[StatsAPI] Environment:', {
    DEV: import.meta.env.DEV,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    hostname: window.location.hostname,
    USE_MOCK
  });
}

export interface VisitStats {
  count: number;
}

export interface LikeStats {
  count: number;
  isLiked: boolean;
}

/**
 * Увеличивает счетчик посещений
 */
export async function incrementVisit(): Promise<number> {
  // Сначала пытаемся использовать реальный API
  try {
    const response = await fetch(`${API_BASE}/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data: VisitStats = await response.json();
      console.log('[StatsAPI] incrementVisit success:', data.count);
      return data.count;
    }
    
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('[StatsAPI] incrementVisit API failed, using mock:', error);
    
    // Fallback на mock API
    try {
      return await mockApi.mockIncrementVisit();
    } catch {
      return 0;
    }
  }
}

/**
 * Получает количество посещений
 */
export async function getVisitCount(): Promise<number> {
  // Сначала пытаемся использовать реальный API (даже в dev можно тестировать)
  try {
    const response = await fetch(`${API_BASE}/visit`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data: VisitStats = await response.json();
      console.log('[StatsAPI] getVisitCount success:', data.count);
      return data.count;
    }
    
    // Если ответ не OK, пробуем fallback
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('[StatsAPI] getVisitCount API failed, using mock:', error);
    
    // Fallback на mock API
    if (USE_MOCK) {
      try {
        return await mockApi.mockGetVisitCount();
      } catch {
        return 0;
      }
    }
    
    // В production тоже используем mock как fallback
    try {
      return await mockApi.mockGetVisitCount();
    } catch {
      return 0;
    }
  }
}

/**
 * Добавляет или убирает лайк
 */
export async function toggleLike(isLiked: boolean): Promise<LikeStats> {
  // Сначала пытаемся использовать реальный API
  try {
    const response = await fetch(`${API_BASE}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: isLiked ? 'remove' : 'add',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[StatsAPI] toggleLike success:', data);
      return data;
    }
    
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('[StatsAPI] toggleLike API failed, using mock:', error);
    
    // Fallback на mock API
    try {
      return await mockApi.mockToggleLike(isLiked);
    } catch {
      return { count: 0, isLiked: false };
    }
  }
}

/**
 * Получает статистику лайков
 */
export async function getLikeStats(): Promise<LikeStats> {
  // Сначала пытаемся использовать реальный API
  try {
    const response = await fetch(`${API_BASE}/like`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[StatsAPI] getLikeStats success:', data);
      return data;
    }
    
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('[StatsAPI] getLikeStats API failed, using mock:', error);
    
    // Fallback на mock API
    try {
      return await mockApi.mockGetLikeStats();
    } catch {
      return { count: 0, isLiked: false };
    }
  }
}

