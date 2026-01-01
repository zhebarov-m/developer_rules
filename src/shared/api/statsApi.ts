/**
 * API клиент для работы со статистикой
 */
import * as mockApi from './mockStatsApi';

// В dev используем mock, в production - реальный API
// В dev используем mock с localStorage (симулирует глобальное хранилище)
// В production используем реальный Vercel API
const API_BASE = '/api/stats';
const USE_MOCK = import.meta.env.DEV;

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
  if (USE_MOCK) {
    return mockApi.mockIncrementVisit();
  }

  try {
    const response = await fetch(`${API_BASE}/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to increment visit');
    }

    const data: VisitStats = await response.json();
    return data.count;
  } catch {
    return 0;
  }
}

/**
 * Получает количество посещений
 */
export async function getVisitCount(): Promise<number> {
  if (USE_MOCK) {
    try {
      return await mockApi.mockGetVisitCount();
    } catch {
      return 0;
    }
  }

  try {
    const response = await fetch(`${API_BASE}/visit`);

    if (!response.ok) {
      throw new Error('Failed to get visit count');
    }

    const data: VisitStats = await response.json();
    return data.count;
  } catch {
    return 0;
  }
}

/**
 * Добавляет или убирает лайк
 */
export async function toggleLike(isLiked: boolean): Promise<LikeStats> {
  if (USE_MOCK) {
    return mockApi.mockToggleLike(isLiked);
  }

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

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }

    return await response.json();
  } catch {
    return { count: 0, isLiked: false };
  }
}

/**
 * Получает статистику лайков
 */
export async function getLikeStats(): Promise<LikeStats> {
  if (USE_MOCK) {
    try {
      return await mockApi.mockGetLikeStats();
    } catch {
      return { count: 0, isLiked: false };
    }
  }

  try {
    const response = await fetch(`${API_BASE}/like`);

    if (!response.ok) {
      throw new Error('Failed to get like stats');
    }

    return await response.json();
  } catch {
    return { count: 0, isLiked: false };
  }
}

