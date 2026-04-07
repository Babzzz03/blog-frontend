import React from 'react';

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-muted px-1 rounded text-xs font-mono border border-border/50">{part.slice(1, -1)}</code>;
    return part;
  });
}

export default function MarkdownMessage({ text, prose = false }: { text: string; prose?: boolean }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let key = 0;

  const flushList = () => {
    if (!listItems.length) return;
    const items = listItems.map((item, i) => (
      <li key={i} className="leading-relaxed">{parseInline(item)}</li>
    ));
    elements.push(
      listType === 'ul'
        ? <ul key={key++} className={prose ? 'list-disc pl-5 my-2 space-y-1' : 'list-disc pl-5 my-1.5 space-y-0.5 text-sm'}>{items}</ul>
        : <ol key={key++} className={prose ? 'list-decimal pl-5 my-2 space-y-1' : 'list-decimal pl-5 my-1.5 space-y-0.5 text-sm'}>{items}</ol>
    );
    listItems = [];
    listType = null;
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (/^[-*] /.test(trimmed)) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(trimmed.slice(2));
      continue;
    }
    if (/^\d+\. /.test(trimmed)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(trimmed.replace(/^\d+\. /, ''));
      continue;
    }

    flushList();

    if (trimmed === '---') {
      elements.push(<hr key={key++} className="border-border my-3" />);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={key++} className={prose ? 'font-semibold text-base mt-4 mb-1' : 'font-semibold text-sm mt-2 mb-0.5'}>{parseInline(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={key++} className={prose ? 'font-bold text-lg mt-5 mb-1.5' : 'font-bold text-sm mt-3 mb-1'}>{parseInline(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={key++} className={prose ? 'font-bold text-xl mt-5 mb-2' : 'font-bold text-base mt-3 mb-1'}>{parseInline(trimmed.slice(2))}</h1>);
    } else if (trimmed === '') {
      elements.push(<div key={key++} className={prose ? 'h-2' : 'h-1.5'} />);
    } else {
      elements.push(<p key={key++} className={prose ? 'leading-relaxed' : 'text-sm leading-relaxed'}>{parseInline(trimmed)}</p>);
    }
  }

  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}
