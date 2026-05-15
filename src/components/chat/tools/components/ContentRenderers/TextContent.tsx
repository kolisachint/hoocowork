import React from 'react';

interface TextContentProps {
  content: string;
  format?: 'plain' | 'json' | 'code';
  className?: string;
}

/**
 * Renders plain text, JSON, or code content
 * Used by: Raw parameters, generic text results, JSON responses
 */
export const TextContent: React.FC<TextContentProps> = ({
  content,
  format = 'plain',
  className = ''
}) => {
  if (format === 'json') {
    let formattedJson = content;
    try {
      const parsed = JSON.parse(content);
      formattedJson = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // If parsing fails, use original content
      console.warn('Failed to parse JSON content:', e);
    }

    return (
      <pre className={`mt-1 overflow-x-auto rounded bg-[var(--paper)] p-2.5 font-mono text-[var(--fs-sm)] text-foreground dark:bg-[var(--paper)] ${className}`}>
        {formattedJson}
      </pre>
    );
  }

  if (format === 'code') {
    return (
      <pre className={`mt-1 overflow-hidden whitespace-pre-wrap break-words rounded border border-border/50 bg-muted/50 p-2 font-mono text-[var(--fs-sm)] text-muted-foreground dark:border-border/50 dark:bg-muted/50 dark:text-muted-foreground ${className}`}>
        {content}
      </pre>
    );
  }

  // Plain text
  return (
    <div className={`mt-1 whitespace-pre-wrap text-[var(--fs-md)] text-muted-foreground ${className}`}>
      {content}
    </div>
  );
};
