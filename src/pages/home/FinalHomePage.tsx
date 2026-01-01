import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SimpleHeader } from '@/widgets/header/SimpleHeader';
import { SimpleSidebar } from '@/widgets/sidebar/SimpleSidebar';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { MarkdownContent } from '@/shared/ui/markdown-content';
import { ScrollToTop } from '@/shared/ui/scroll-to-top';
import { parseMarkdownHeaders } from '@/shared/lib/markdown';
import { useVisitCounter } from '@/shared/lib/hooks/useStats';
import type { DocType } from '@/shared/types/docTypes';

interface FinalHomePageProps {
  frontendContent: string;
  backendContent: string;
}

/**
 * Финальная версия главной страницы с переключателем Frontend/Backend
 */
export const FinalHomePage: React.FC<FinalHomePageProps> = ({ 
  frontendContent, 
  backendContent 
}) => {
  const [docType, setDocType] = useState<DocType>('frontend');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>();
  const { count: visitCount, isLoading: visitLoading } = useVisitCounter();

  // Применяем тему при изменении типа документации и при монтировании
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-frontend', 'theme-backend');
    root.classList.add(`theme-${docType}`);
  }, [docType]);

  // Получаем текущий контент в зависимости от типа документации
  const currentContent = useMemo(() => {
    return docType === 'frontend' ? frontendContent : backendContent;
  }, [docType, frontendContent, backendContent]);

  // Парсим заголовки для навигации
  const sections = useMemo(() => {
    return parseMarkdownHeaders(currentContent);
  }, [currentContent]);

  // Создаём Map для быстрого поиска id по названию раздела
  const sectionIdsMap = useMemo(() => {
    const map = new Map<string, string>();
    sections.forEach(section => {
      map.set(section.title, section.id);
    });
    return map;
  }, [sections]);

  const handleDocTypeChange = useCallback((type: DocType) => {
    setDocType(type);
    setSearchQuery(''); // Очищаем поиск при переключении
    setActiveSection(undefined);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      // Используем requestAnimationFrame для более плавного скролла
      requestAnimationFrame(() => {
        const headerOffset = 80; // Высота фиксированного header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      });
    }
  }, []);

  // Отслеживание активной секции при скролле
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id) {
            setActiveSection(id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Наблюдаем за всеми секциями
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  // Простая фильтрация
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) return currentContent;
    
    const query = searchQuery.toLowerCase();
    const lines = currentContent.split('\n');
    const filteredLines: string[] = [];
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query)) {
        const start = Math.max(0, index - 2);
        const end = Math.min(lines.length, index + 4);
        
        for (let i = start; i < end; i++) {
          if (!filteredLines.includes(lines[i])) {
            filteredLines.push(lines[i]);
          }
        }
      }
    });
    
    return filteredLines.length > 0 
      ? filteredLines.join('\n') 
      : '# Ничего не найдено\n\nПопробуйте другой запрос.';
  }, [currentContent, searchQuery]);

  return (
    <div className="flex min-h-screen bg-background">
      <SimpleSidebar
        sections={sections}
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        visitCount={visitCount}
        visitLoading={visitLoading}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <SimpleHeader 
          docType={docType}
          onDocTypeChange={handleDocTypeChange}
          onMenuClick={handleToggleSidebar}
          onSearch={handleSearch}
        />
        
        <ScrollArea className="flex-1">
          <main className="container max-w-4xl mx-auto p-6 lg:p-8">
            <MarkdownContent 
              content={filteredContent}
              sectionIds={sectionIdsMap}
            />
          </main>
        </ScrollArea>
        
        <ScrollToTop />
      </div>
    </div>
  );
};
