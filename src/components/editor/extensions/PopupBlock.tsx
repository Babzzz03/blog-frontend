'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Zap, X } from 'lucide-react';

function PopupBlockView({ node, updateAttributes, deleteNode }: any) {
  return (
    <NodeViewWrapper contentEditable={false} data-drag-handle>
      <div className="my-4 rounded-xl border-2 border-dashed border-purple-300/60 bg-purple-50/40 dark:bg-purple-900/10 p-4 select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4 text-purple-500" />
            Popup / Modal Block
          </div>
          <button onClick={deleteNode} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-center mb-3">
          <div className="px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium">
            {node.attrs.triggerText || 'Open Popup'}
          </div>
        </div>
        <div className="space-y-1.5">
          <input
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            placeholder="Trigger button text (e.g. Get Free Guide)"
            value={node.attrs.triggerText || ''}
            onChange={(e) => updateAttributes({ triggerText: e.target.value })}
          />
          <input
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            placeholder="Popup title"
            value={node.attrs.title || ''}
            onChange={(e) => updateAttributes({ title: e.target.value })}
          />
          <textarea
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs resize-none"
            rows={2}
            placeholder="Popup content / message"
            value={node.attrs.content || ''}
            onChange={(e) => updateAttributes({ content: e.target.value })}
          />
          <input
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            placeholder="CTA button text (e.g. Download Now)"
            value={node.attrs.ctaText || ''}
            onChange={(e) => updateAttributes({ ctaText: e.target.value })}
          />
          <input
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            placeholder="CTA button URL"
            value={node.attrs.ctaUrl || ''}
            onChange={(e) => updateAttributes({ ctaUrl: e.target.value })}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">⚡ Popup Block — renders as a modal trigger on the blog</p>
      </div>
    </NodeViewWrapper>
  );
}

export const PopupBlockExtension = Node.create({
  name: 'popupBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      triggerText: { default: 'Open Popup' },
      title: { default: 'Special Offer' },
      content: { default: 'Check out this exclusive content.' },
      ctaText: { default: 'Learn More' },
      ctaUrl: { default: '#' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-tiptap-block="popup"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({
      'data-tiptap-block': 'popup',
      'data-trigger-text': HTMLAttributes.triggerText,
      'data-title': HTMLAttributes.title,
      'data-content': HTMLAttributes.content,
      'data-cta-text': HTMLAttributes.ctaText,
      'data-cta-url': HTMLAttributes.ctaUrl,
    })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PopupBlockView);
  },
});
