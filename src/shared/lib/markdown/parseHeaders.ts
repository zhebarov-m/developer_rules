export interface Section {
  id: string;
  title: string;
  level: number;
}

/**
 * Убирает смайлы из текста (используется в парсере и в MarkdownContent)
 */
export const removeEmojis = (text: string): string => {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Эмодзи
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Разные символы
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Разные символы
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Эмодзи лиц
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Транспорт и карты
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Флаги
    .replace(/[\u{1F3A0}-\u{1F3FF}]/gu, '') // Дополнительные эмодзи
    .replace(/[\u{1F400}-\u{1F4FF}]/gu, '') // Символы и пиктограммы
    .replace(/[\u{1F500}-\u{1F5FF}]/gu, '') // Дополнительные символы
    .replace(/\p{Emoji}/gu, '') // Все эмодзи через Unicode property
    .replace(/\s+/g, ' ') // Множественные пробелы в один
    .trim();
};

/**
 * Парсит markdown для получения заголовков для навигации
 */
export const parseMarkdownHeaders = (content: string): Section[] => {
  const lines = content.split('\n');
  const sections: Section[] = [];
  const usedIds = new Set<string>();
  
  lines.forEach((line, index) => {
    // Находим заголовки ## (второго уровня)
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      const fullTitle = h2Match[1].trim();
      // Убираем смайлы только из title для сайдбара (текст остается полным)
      const title = removeEmojis(fullTitle);
      
      // Генерируем ID на основе очищенного заголовка для стабильности
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Убеждаемся, что ID уникален
      let uniqueId = id || `section-${index}`;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      usedIds.add(uniqueId);
      
      sections.push({
        id: uniqueId,
        title,
        level: 2,
      });
    }
  });
  
  return sections;
};

