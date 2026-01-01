/**
 * Склоняет слово "просмотр" в зависимости от числа
 * @param count - количество просмотров
 * @returns склоненное слово
 */
export const pluralizeViews = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'просмотров';
  }

  // 1, 21, 31, 41...
  if (lastDigit === 1) {
    return 'просмотр';
  }

  // 2, 3, 4, 22, 23, 24...
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'просмотра';
  }

  // 5, 6, 7, 8, 9, 0, 11-14, 15-20...
  return 'просмотров';
};

