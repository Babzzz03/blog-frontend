'use client';

import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Dropcursor from '@tiptap/extension-dropcursor';
import Link from '@tiptap/extension-link';
import { cn } from '@/lib/utils';
import Toolbar from './Toolbar';
import { SubscribeBlockExtension } from './extensions/SubscribeBlock';
import { CtaButtonBlockExtension } from './extensions/CtaButtonBlock';
import { ContactFormBlockExtension } from './extensions/ContactFormBlock';
import { DownloadBlockExtension } from './extensions/DownloadBlock';
import { PopupBlockExtension } from './extensions/PopupBlock';

interface TipTapProps {
  content?: string;
  onChange: (content: string) => void;
}

export default function TipTap({ content, onChange }: TipTapProps) {
  const isExternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Highlight,
      Dropcursor,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
      SubscribeBlockExtension,
      CtaButtonBlockExtension,
      ContactFormBlockExtension,
      DownloadBlockExtension,
      PopupBlockExtension,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'focus:outline-none min-h-[300px] w-full px-4 py-3 rounded-b-md border border-input bg-background text-foreground',
          // Heading styles
          '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2',
          '[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2',
          '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1',
          // Paragraph & list styles
          '[&_p]:leading-relaxed [&_p]:my-1',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2',
          '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2',
          '[&_li]:my-0.5',
          // Blockquote
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3',
          // Code
          '[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono',
          '[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:my-3 [&_pre]:overflow-x-auto',
          // Links
          '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80',
          // Image
          '[&_img]:max-w-full [&_img]:rounded-md [&_img]:my-3',
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (!isExternalUpdate.current) {
        onChange(editor.getHTML());
      }
    },
  });

  // Sync external content changes (e.g. from AI) into the editor
  useEffect(() => {
    if (!editor || content === undefined) return;
    if (content !== editor.getHTML()) {
      isExternalUpdate.current = true;
      editor.commands.setContent(content, false);
      isExternalUpdate.current = false;
      onChange(editor.getHTML());
    }
  }, [content, editor]);

  return (
    <div className="w-full">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
