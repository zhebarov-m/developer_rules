import React, { useState, useCallback } from 'react';
import { Github, Menu, Code2, Server, Star, Eye, Moon, Sun, Send } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search } from 'lucide-react';
import { cn, pluralizeViews } from '@/shared/lib/utils';
import type { DocType } from '@/shared/types/docTypes';
import { useVisitCounter, useLikeButton } from '@/shared/lib/hooks/useStats';
import { useTheme } from '@/shared/lib/hooks/useTheme';

interface SimpleHeaderProps {
  docType: DocType;
  onDocTypeChange: (type: DocType) => void;
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * Header с переключателем Frontend/Backend
 */
export const SimpleHeader = React.memo<SimpleHeaderProps>(({ 
  docType,
  onDocTypeChange,
  onMenuClick, 
  onSearch,
  className 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const { count: visitCount, isLoading: visitLoading } = useVisitCounter();
  const { isLiked, likeCount, handleLike, isLoading: likeLoading } = useLikeButton();
  const { theme, toggleTheme } = useTheme();

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  }, [onSearch]);

  const logoSrc = docType === 'frontend' ? '/logo/f_logo.webp' : '/logo/b_logo.webp';

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b bg-background',
      className
    )}>
      <div className="container flex h-16 items-center gap-4 px-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center">
          <img 
            src={logoSrc} 
            alt="Almanac Logo" 
            className="h-14 w-14 object-contain flex-shrink-0 mt-3"
          />
          <div>
            <h1 className="text-xl font-bold">Almanac</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Руководство по написанию кода
            </p>
          </div>
        </div>

        {onSearch && (
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Поиск по правилам..."
                className="pl-9"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {/* Счетчик посещений */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-muted/50 text-sm text-muted-foreground">
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

          {/* Кнопка лайка */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeLoading}
            className={cn(
              "gap-1.5 transition-all",
              isLiked && "text-primary"
            )}
          >
            <Star className={cn(
              "h-4 w-4 transition-all",
              isLiked && "fill-primary"
            )} />
            <span className="font-medium">
              {likeLoading ? '...' : likeCount}
            </span>
          </Button>

          {/* Переключатель Frontend/Backend - перенесен вправо */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border">
            {/* Мобильная версия - только активная иконка */}
            <Button
              variant="default"
              size="sm"
              onClick={() => onDocTypeChange(docType === 'frontend' ? 'backend' : 'frontend')}
              className={cn(
                "gap-2 transition-all md:hidden",
                "bg-primary text-primary-foreground shadow-sm"
              )}
              aria-label={docType === 'frontend' ? 'Переключить на Backend' : 'Переключить на Frontend'}
            >
              {docType === 'frontend' ? (
                <Code2 className="h-4 w-4" />
              ) : (
                <Server className="h-4 w-4" />
              )}
            </Button>
            
            {/* Десктопная версия - обе кнопки */}
            <Button
              variant={docType === 'frontend' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onDocTypeChange('frontend')}
              className={cn(
                "gap-2 transition-all hidden md:flex",
                docType === 'frontend' && "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              <Code2 className="h-4 w-4" />
              <span className="hidden sm:inline">Frontend</span>
            </Button>
            <Button
              variant={docType === 'backend' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onDocTypeChange('backend')}
              className={cn(
                "gap-2 transition-all hidden md:flex",
                docType === 'backend' && "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Backend</span>
            </Button>
          </div>

          {/* Переключатель темы */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="h-9 w-9"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 fill-blue-500 text-blue-500" />
            )}
          </Button>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://github.com/zhebarov-m"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/je_m27"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
            >
              <Send className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      
      {onSearch && (
        <div className="container px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Поиск по правилам..."
              className="pl-9"
            />
          </div>
        </div>
      )}
    </header>
  );
});

SimpleHeader.displayName = 'SimpleHeader';

