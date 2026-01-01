import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '../button';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  className?: string;
}

/**
 * Компонент для отображения кода с подсветкой синтаксиса
 * Следует принципу SRP - только отображение кода
 */
export const CodeBlock = React.memo<CodeBlockProps>(({ 
  code, 
  language, 
  showLineNumbers = true,
  className 
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [code]);

  return (
    <div className={cn('relative group', className)}>
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="default"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          padding: '1.5rem',
        }}
        codeTagProps={{
          style: {
            fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

