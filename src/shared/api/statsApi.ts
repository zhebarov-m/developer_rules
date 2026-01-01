/**
 * API клиент для работы со статистикой
 */
import * as mockApi from './mockStatsApi';

// В dev используем mock, в production - реальный API
// В dev используем mock с localStorage (симулирует глобальное хранилище)
// В production используем реальный Vercel API
const API_BASE = '/api/stats';
// Более надежная проверка окружения
const USE_MOCK = import.meta.env.DEV || import.meta.env.MODE === 'development';

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
      const errorText = await response.text();
      console.error('[StatsAPI] incrementVisit failed:', response.status, errorText);
      // Fallback на mock API если реальный API недоступен
      console.warn('[StatsAPI] Falling back to mock API');
      return await mockApi.mockIncrementVisit();
    }

    const data: VisitStats = await response.json();
    return data.count;
  } catch (error) {
    console.error('[StatsAPI] incrementVisit error:', error);
    // Fallback на mock API если реальный API недоступен
    try {
      console.warn('[StatsAPI] Falling back to mock API');
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
  if (USE_MOCK) {
    try {
      return await mockApi.mockGetVisitCount();
    } catch {
      return 0;
    }
  }

  try {
    const response = await fetch(`${API_BASE}/visit`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[StatsAPI] getVisitCount failed:', response.status, errorText);
      // Fallback на mock API если реальный API недоступен
      console.warn('[StatsAPI] Falling back to mock API');
      return await mockApi.mockGetVisitCount();
    }

    const data: VisitStats = await response.json();
    return data.count;
  } catch (error) {
    console.error('[StatsAPI] getVisitCount error:', error);
    // Fallback на mock API если реальный API недоступен
    try {
      console.warn('[StatsAPI] Falling back to mock API');
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
      const errorText = await response.text();
      console.error('[StatsAPI] toggleLike failed:', response.status, errorText);
      // Fallback на mock API если реальный API недоступен
      console.warn('[StatsAPI] Falling back to mock API');
      return await mockApi.mockToggleLike(isLiked);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[StatsAPI] toggleLike error:', error);
    // Fallback на mock API если реальный API недоступен
    try {
      console.warn('[StatsAPI] Falling back to mock API');
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
  if (USE_MOCK) {
    try {
      return await mockApi.mockGetLikeStats();
    } catch {
      return { count: 0, isLiked: false };
    }
  }

  try {
    const response = await fetch(`${API_BASE}/like`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[StatsAPI] getLikeStats failed:', response.status, errorText);
      // Fallback на mock API если реальный API недоступен
      console.warn('[StatsAPI] Falling back to mock API');
      return await mockApi.mockGetLikeStats();
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[StatsAPI] getLikeStats error:', error);
    // Fallback на mock API если реальный API недоступен
    try {
      console.warn('[StatsAPI] Falling back to mock API');
      return await mockApi.mockGetLikeStats();
    } catch {
      return { count: 0, isLiked: false };
    }
  }
}

