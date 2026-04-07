'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Mail, X } from 'lucide-react';

// ── React view shown inside TipTap editor ──────────────────────────────────
function SubscribeBlockView({ node, deleteNode }: any) {
  return (
    <NodeViewWrapper contentEditable={false} data-drag-handle>
      <div className="my-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 select-none">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{node.attrs.title || 'Subscribe to our newsletter'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{node.attrs.subtitle || 'Get the latest posts delivered to your inbox.'}</p>
            </div>
          </div>
          <button
            onClick={deleteNode}
            className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 h-8 rounded-md bg-background border border-input text-xs px-3 flex items-center text-muted-foreground">your@email.com</div>
          <div className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs flex items-center font-medium">Subscribe</div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">📧 Email Subscribe Block — renders as real form on the blog</p>
      </div>
    </NodeViewWrapper>
  );
}

// ── TipTap Node Extension ──────────────────────────────────────────────────
export const SubscribeBlockExtension = Node.create({
  name: 'subscribeBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      title: { default: 'Subscribe to our newsletter' },
      subtitle: { default: 'Get the latest posts delivered to your inbox.' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-tiptap-block="subscribe"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = {
      'data-tiptap-block': 'subscribe',
      'data-title': HTMLAttributes.title,
      'data-subtitle': HTMLAttributes.subtitle,
    };
    return ['div', mergeAttributes(attrs)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SubscribeBlockView);
  },
});
