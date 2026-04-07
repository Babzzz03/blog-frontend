'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { MousePointerClick, X } from 'lucide-react';

function CtaButtonView({ node, updateAttributes, deleteNode }: any) {
  const style = node.attrs.style || 'primary';
  const bgClass = style === 'primary' ? 'bg-primary text-primary-foreground' : style === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'border border-primary text-primary bg-transparent';

  return (
    <NodeViewWrapper contentEditable={false} data-drag-handle>
      <div className="my-4 rounded-xl border-2 border-dashed border-orange-300/60 bg-orange-50/40 dark:bg-orange-900/10 p-4 select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MousePointerClick className="h-4 w-4 text-orange-500" />
            CTA Button Block
          </div>
          <button onClick={deleteNode} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-center">
          <div className={`px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${bgClass}`}>
            {node.attrs.text || 'Click Here'}
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <input
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            placeholder="Button text"
            value={node.attrs.text || ''}
            onChange={(e) => updateAttributes({ text: e.target.value })}
          />
          <input
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            placeholder="Link URL (https://...)"
            value={node.attrs.url || ''}
            onChange={(e) => updateAttributes({ url: e.target.value })}
          />
          <select
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            value={node.attrs.style || 'primary'}
            onChange={(e) => updateAttributes({ style: e.target.value })}
          >
            <option value="primary">Primary (filled)</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const CtaButtonBlockExtension = Node.create({
  name: 'ctaButtonBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      text: { default: 'Get Started' },
      url: { default: '#' },
      style: { default: 'primary' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-tiptap-block="cta-button"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({
      'data-tiptap-block': 'cta-button',
      'data-text': HTMLAttributes.text,
      'data-url': HTMLAttributes.url,
      'data-style': HTMLAttributes.style,
    })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CtaButtonView);
  },
});
