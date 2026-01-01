import { useState, useEffect, useRef } from 'react';
import { 
  incrementVisit, 
  getVisitCount, 
  toggleLike, 
  getLikeStats 
} from '@/shared/api/statsApi';

/**
 * Хук для работы со счетчиком посещений
 * Использует реальный API
 */
export const useVisitCounter = () => {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasIncremented = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initCounter = async () => {
      try {
        const currentCount = await getVisitCount();
        
        if (!mounted) return;
        
        setCount(currentCount);
        setIsLoading(false);

        if (hasIncremented.current) {
          return;
        }
        hasIncremented.current = true;

        const newCount = await incrementVisit();
        
        if (mounted) {
          setCount(newCount);
        }
      } catch {
        if (mounted) {
          setIsLoading(false);
          try {
            const fallbackCount = await getVisitCount();
            setCount(fallbackCount);
          } catch {
            setCount(0);
          }
        }
      }
    };

    initCounter();

    return () => {
      mounted = false;
    };
  }, []);

  return { count, isLoading };
};

/**
 * Хук для работы с лайками
 * Использует реальный API
 */
export const useLikeButton = () => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadLikeStats = async () => {
      try {
        const stats = await getLikeStats();
        if (!mounted) return;
        
        setIsLiked(stats.isLiked);
        setLikeCount(stats.count);
        setIsLoading(false);
      } catch {
        if (mounted) {
          setIsLiked(false);
          setLikeCount(0);
          setIsLoading(false);
        }
      }
    };

    loadLikeStats();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLike = async () => {
    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Оптимистичное обновление
    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      const stats = await toggleLike(previousLiked);
      setIsLiked(stats.isLiked);
      setLikeCount(stats.count);
    } catch {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  return { isLiked, likeCount, handleLike, isLoading };
};

