/**
 * Mock API для локальной разработки
 * Использует localStorage для симуляции глобального хранилища
 * В production эти функции будут вызывать реальный API
 */

// Генерируем уникальный ID для пользователя (для dev)
function getClientId(): string {
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('clientId', clientId);
  }
  return clientId;
}

// Загружаем данные из localStorage (симулирует глобальное хранилище)
function loadStorage() {
  try {
    const visitCountStr = localStorage.getItem('globalVisitCount');
    const visitCount = visitCountStr ? parseInt(visitCountStr, 10) : 0;
    
    const likesJson = localStorage.getItem('globalLikes');
    let likes: Set<string>;
    try {
      likes = likesJson ? new Set<string>(JSON.parse(likesJson)) : new Set<string>();
    } catch {
      likes = new Set<string>();
    }
    
    return { visitCount: isNaN(visitCount) ? 0 : visitCount, likes };
  } catch {
    return { visitCount: 0, likes: new Set<string>() };
  }
}

// Сохраняем данные в localStorage (симулирует глобальное хранилище)
function saveStorage(visitCount: number, likes: Set<string>) {
  try {
    localStorage.setItem('globalVisitCount', visitCount.toString());
    localStorage.setItem('globalLikes', JSON.stringify(Array.from(likes)));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Mock API для счетчика посещений
 * Симулирует глобальный счетчик через localStorage
 */
export async function mockIncrementVisit(): Promise<number> {
  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const { visitCount, likes } = loadStorage();
    
    const lastIncrement = sessionStorage.getItem('lastVisitIncrement');
    const now = Date.now();
    
    if (lastIncrement) {
      const lastTime = parseInt(lastIncrement, 10);
      if (!isNaN(lastTime) && now - lastTime < 2000) {
        return visitCount;
      }
    }
    
    sessionStorage.setItem('lastVisitIncrement', now.toString());
    const newCount = (visitCount || 0) + 1;
    saveStorage(newCount, likes);
    return newCount;
  } catch {
    try {
      const { visitCount } = loadStorage();
      return visitCount || 0;
    } catch {
      return 0;
    }
  }
}

export async function mockGetVisitCount(): Promise<number> {
  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const { visitCount } = loadStorage();
    const count = typeof visitCount === 'number' && !isNaN(visitCount) ? visitCount : 0;
    return count;
  } catch {
    return 0;
  }
}

/**
 * Mock API для лайков
 * Симулирует глобальные лайки через localStorage
 */
export async function mockToggleLike(isLiked: boolean): Promise<{ count: number; isLiked: boolean }> {
  // Имитируем небольшую задержку сети
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const clientId = getClientId();
  const { visitCount, likes } = loadStorage();
  
  if (isLiked) {
    likes.delete(clientId);
  } else {
    likes.add(clientId);
  }
  
  saveStorage(visitCount, likes);
  
  return {
    count: likes.size,
    isLiked: likes.has(clientId),
  };
}

export async function mockGetLikeStats(): Promise<{ count: number; isLiked: boolean }> {
  try {
    // Имитируем небольшую задержку сети
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const clientId = getClientId();
    const { likes } = loadStorage();
    
    return {
      count: likes.size,
      isLiked: likes.has(clientId),
    };
  } catch {
    return { count: 0, isLiked: false };
  }
}

