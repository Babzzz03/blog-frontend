'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Download, FileText, X } from 'lucide-react';

function DownloadBlockView({ node, updateAttributes, deleteNode }: any) {
  return (
    <NodeViewWrapper contentEditable={false} data-drag-handle>
      <div className="my-4 rounded-xl border-2 border-dashed border-green-300/60 bg-green-50/40 dark:bg-green-900/10 p-4 select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Download className="h-4 w-4 text-green-600" />
            Downloadable Resource Block
          </div>
          <button onClick={deleteNode} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border mb-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{node.attrs.title || 'Resource Title'}</p>
            <p className="text-xs text-muted-foreground">{node.attrs.description || 'Click to download'}</p>
          </div>
          <div className="h-8 px-3 rounded-md bg-green-600 text-white text-xs flex items-center gap-1 font-medium shrink-0">
            <Download className="h-3 w-3" /> Download
          </div>
        </div>
        <div className="space-y-1.5">
          <input
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            placeholder="Resource title (e.g. SEO Checklist PDF)"
            value={node.attrs.title || ''}
            onChange={(e) => updateAttributes({ title: e.target.value })}
          />
          <input
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            placeholder="Description (optional)"
            value={node.attrs.description || ''}
            onChange={(e) => updateAttributes({ description: e.target.value })}
          />
          <input
            className="w-full px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
            placeholder="Download URL (https://...)"
            value={node.attrs.url || ''}
            onChange={(e) => updateAttributes({ url: e.target.value })}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const DownloadBlockExtension = Node.create({
  name: 'downloadBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      title: { default: 'Download Resource' },
      description: { default: 'Free PDF guide' },
      url: { default: '#' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-tiptap-block="download"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({
      'data-tiptap-block': 'download',
      'data-title': HTMLAttributes.title,
      'data-description': HTMLAttributes.description,
      'data-url': HTMLAttributes.url,
    })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DownloadBlockView);
  },
});
