import React, { useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { ScrollArea } from '@/shared/ui/scroll-area';
import type { Section } from '@/shared/lib/markdown';

interface SimpleSidebarProps {
  sections: Section[];
  activeSection?: string;
  onSectionClick: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Минималистичный Sidebar с разделами
 */
export const SimpleSidebar = React.memo<SimpleSidebarProps>(({ 
  sections,
  activeSection,
  onSectionClick,
  isOpen,
  onClose
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
          'fixed top-0 left-0 z-50 h-screen w-72 bg-background border-r transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Содержание</h2>
        </div>
        
        <ScrollArea className="h-[calc(100vh-73px)]">
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
      </aside>
    </>
  );
});

SimpleSidebar.displayName = 'SimpleSidebar';

