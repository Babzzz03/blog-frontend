'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { MessageSquare, X } from 'lucide-react';

function ContactFormView({ node, updateAttributes, deleteNode }: any) {
  return (
    <NodeViewWrapper contentEditable={false} data-drag-handle>
      <div className="my-4 rounded-xl border-2 border-dashed border-blue-300/60 bg-blue-50/40 dark:bg-blue-900/10 p-4 select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Contact Form Block
          </div>
          <button onClick={deleteNode} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          className="w-full mb-2 px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
          placeholder="Form heading (e.g. Get in Touch)"
          value={node.attrs.heading || ''}
          onChange={(e) => updateAttributes({ heading: e.target.value })}
        />
        <div className="space-y-2 pointer-events-none opacity-60">
          <div className="h-8 rounded-md bg-background border border-input text-xs px-3 flex items-center text-muted-foreground">Your name</div>
          <div className="h-8 rounded-md bg-background border border-input text-xs px-3 flex items-center text-muted-foreground">your@email.com</div>
          <div className="h-16 rounded-md bg-background border border-input text-xs px-3 py-2 text-muted-foreground">Your message...</div>
          <div className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs flex items-center font-medium w-fit">Send Message</div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">📬 Contact Form Block — renders as interactive form on the blog</p>
      </div>
    </NodeViewWrapper>
  );
}

export const ContactFormBlockExtension = Node.create({
  name: 'contactFormBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      heading: { default: 'Get in Touch' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-tiptap-block="contact-form"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({
      'data-tiptap-block': 'contact-form',
      'data-heading': HTMLAttributes.heading,
    })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ContactFormView);
  },
});
