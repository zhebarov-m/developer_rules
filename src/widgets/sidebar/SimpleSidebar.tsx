import React, { useCallback } from 'react';
import { Github, Eye, Send } from 'lucide-react';
import { cn, pluralizeViews } from '@/shared/lib/utils';
import { ScrollArea } from '@/shared/ui/scroll-area';
import type { Section } from '@/shared/lib/markdown';

interface SimpleSidebarProps {
  sections: Section[];
  activeSection?: string;
  onSectionClick: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  visitCount?: number;
  visitLoading?: boolean;
}

/**
 * Минималистичный Sidebar с разделами
 */
export const SimpleSidebar = React.memo<SimpleSidebarProps>(({ 
  sections,
  activeSection,
  onSectionClick,
  isOpen,
  onClose,
  visitCount,
  visitLoading
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    onSectionClick(id);
    onClose();
  }, [onSectionClick, onClose]);

  return (
    <>
      {/* Overlay для мобильных */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-[60] h-screen w-72 bg-background border-r transition-transform duration-300 lg:sticky lg:top-0 lg:z-50 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Содержание</h2>
        </div>
        
        <ScrollArea className="h-[calc(100vh-73px-120px)] md:h-[calc(100vh-73px)]">
          <nav className="p-4">
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(e) => handleClick(e, section.id)}
                    className={cn(
                      'block py-2 px-3 text-sm rounded-md transition-all',
                      'hover:bg-primary/10 hover:text-primary',
                      activeSection === section.id
                        ? 'bg-primary/15 text-primary font-semibold border-l-2 border-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollArea>
        
        {/* GitHub ссылка и счетчик просмотров для мобильной версии */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background md:hidden space-y-2">
          {/* Счетчик просмотров */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span className="font-medium">
              {visitLoading ? '...' : (visitCount ?? 0).toLocaleString()}
            </span>
            {!visitLoading && (
              <span className="text-xs opacity-70">
                {pluralizeViews(visitCount ?? 0)}
              </span>
            )}
          </div>
          
          {/* GitHub и Telegram ссылки */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/zhebarov-m"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              onClick={onClose}
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://t.me/je_m27"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              onClick={onClose}
            >
              <Send className="h-5 w-5" />
              <span>Telegram</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
});

SimpleSidebar.displayName = 'SimpleSidebar';

