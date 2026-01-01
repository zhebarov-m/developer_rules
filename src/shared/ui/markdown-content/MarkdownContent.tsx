import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '@/shared/ui/code-block';
import { cn } from '@/shared/lib/utils';
import { removeEmojis } from '@/shared/lib/markdown';

interface MarkdownContentProps {
  content: string;
  sectionIds?: Map<string, string>; // title -> id mapping
  className?: string;
}

/**
 * Компонент для рендеринга markdown контента
 * Простое отображение без парсинга
 */
export const MarkdownContent = React.memo<MarkdownContentProps>(({ 
  content,
  sectionIds,
  className 
}) => {
  return (
    <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        components={{
          code({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !className || !match;
            
            return !isInline && match ? (
              <CodeBlock
                code={codeString}
                language={match[1]}
                className="my-4"
              />
            ) : (
              <code
                className={cn(
                  'px-1.5 py-0.5 rounded bg-muted text-sm font-mono',
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-4xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            const fullText = String(children).trim();
            // Убираем смайлы для поиска ID (как в парсере)
            const text = removeEmojis(fullText);
            const id = sectionIds?.get(text);
            // Убираем смайлы и из отображаемого текста
            const displayText = removeEmojis(fullText);
            
            return (
              <h2 
                id={id}
                className="text-3xl font-bold mt-12 mb-6 pb-3 border-b border-border flex items-center gap-3 scroll-mt-20"
              >
                {displayText}
              </h2>
            );
          },
          h3({ children }) {
            return <h3 className="text-2xl font-semibold mt-8 mb-4">{children}</h3>;
          },
          h4({ children }) {
            return <h4 className="text-xl font-semibold mt-6 mb-3">{children}</h4>;
          },
          ul({ children }) {
            return <ul className="space-y-2 my-4 list-none">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="space-y-2 my-4 list-none">{children}</ol>;
          },
          li({ children }) {
            return (
              <li className="ml-4">
                {children}
              </li>
            );
          },
          strong({ children }) {
            return <strong className="font-semibold text-foreground">{children}</strong>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/50 pl-4 py-3 my-4 bg-muted/50 rounded-r">
                {children}
              </blockquote>
            );
          },
          hr() {
            return <hr className="my-8 border-border" />;
          },
          a({ href, children }) {
            return (
              <a 
                href={href} 
                className="text-primary hover:underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownContent.displayName = 'MarkdownContent';

