/**
 * API клиент для работы со статистикой
 * Использует localStorage для хранения данных (работает везде, не требует бэкенда)
 */
import * as mockApi from './mockStatsApi';

export interface VisitStats {
  count: number;
}

export interface LikeStats {
  count: number;
  isLiked: boolean;
}

/**
 * Увеличивает счетчик посещений
 * Использует localStorage для хранения
 */
export async function incrementVisit(): Promise<number> {
  return mockApi.mockIncrementVisit();
}

/**
 * Получает количество посещений
 * Использует localStorage для хранения
 */
export async function getVisitCount(): Promise<number> {
  return mockApi.mockGetVisitCount();
}

/**
 * Добавляет или убирает лайк
 * Использует localStorage для хранения
 */
export async function toggleLike(isLiked: boolean): Promise<LikeStats> {
  return mockApi.mockToggleLike(isLiked);
}

/**
 * Получает статистику лайков
 * Использует localStorage для хранения
 */
export async function getLikeStats(): Promise<LikeStats> {
  return mockApi.mockGetLikeStats();
}

