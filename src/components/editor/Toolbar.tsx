'use client';

import React, { useState } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold, Strikethrough, Italic, List, ListOrdered, Heading1, Heading2, Heading3,
  Underline, Quote, Undo, Redo, Code, Image as ImageIcon, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Highlighter, Type, Link as LinkIcon, Unlink,
  Mail, MousePointerClick, MessageSquare, Download, Zap, ChevronDown,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  const [imageModal, setImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [linkModal, setLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  if (!editor) return null;

  // ── Image ────────────────────────────────────────────
  const openImageModal = () => {
    setImageUrl('');
    setImageModal(true);
  };

  const insertImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    }
    setImageModal(false);
    setImageUrl('');
  };

  // ── Link ─────────────────────────────────────────────
  const openLinkModal = () => {
    const existing = editor.getAttributes('link').href ?? '';
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ''
    );
    setLinkUrl(existing);
    setLinkText(selectedText);
    setLinkModal(true);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`;

    if (linkText.trim() && editor.state.selection.empty) {
      // No selection — insert new text with link
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}">${linkText.trim()}</a>`)
        .run();
    } else {
      // Selection exists — wrap it with link
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const handleKeyDown = (e: React.KeyboardEvent, onEnter: () => void) => {
    if (e.key === 'Enter') { e.preventDefault(); onEnter(); }
  };

  return (
    <>
      <div className="border border-input bg-muted/30 rounded-t-md px-3 py-2 flex flex-wrap items-center gap-1">
        {/* Headings */}
        {[
          { icon: <Heading1 className="h-4 w-4" />, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), label: 'H1' },
          { icon: <Heading2 className="h-4 w-4" />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), label: 'H2' },
          { icon: <Heading3 className="h-4 w-4" />, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), label: 'H3' },
          { icon: <Type className="h-4 w-4" />, action: () => editor.chain().focus().setParagraph().run(), active: editor.isActive('paragraph'), label: 'Paragraph' },
        ].map(({ icon, action, active, label }) => (
          <Toggle key={label} size="sm" pressed={active} onPressedChange={action} aria-label={label}>{icon}</Toggle>
        ))}

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Inline formatting */}
        {[
          { icon: <Bold className="h-4 w-4" />, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), label: 'Bold' },
          { icon: <Italic className="h-4 w-4" />, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), label: 'Italic' },
          { icon: <Underline className="h-4 w-4" />, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), label: 'Underline' },
          { icon: <Strikethrough className="h-4 w-4" />, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), label: 'Strike' },
          { icon: <Highlighter className="h-4 w-4" />, action: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive('highlight'), label: 'Highlight' },
        ].map(({ icon, action, active, label }) => (
          <Toggle key={label} size="sm" pressed={active} onPressedChange={action} aria-label={label}>{icon}</Toggle>
        ))}

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Blocks */}
        {[
          { icon: <List className="h-4 w-4" />, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), label: 'Bullet List' },
          { icon: <ListOrdered className="h-4 w-4" />, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), label: 'Ordered List' },
          { icon: <Quote className="h-4 w-4" />, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), label: 'Blockquote' },
          { icon: <Code className="h-4 w-4" />, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code'), label: 'Code' },
        ].map(({ icon, action, active, label }) => (
          <Toggle key={label} size="sm" pressed={active} onPressedChange={action} aria-label={label}>{icon}</Toggle>
        ))}

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Alignment */}
        {[
          { icon: <AlignLeft className="h-4 w-4" />, action: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }), label: 'Left' },
          { icon: <AlignCenter className="h-4 w-4" />, action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }), label: 'Center' },
          { icon: <AlignRight className="h-4 w-4" />, action: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }), label: 'Right' },
          { icon: <AlignJustify className="h-4 w-4" />, action: () => editor.chain().focus().setTextAlign('justify').run(), active: editor.isActive({ textAlign: 'justify' }), label: 'Justify' },
        ].map(({ icon, action, active, label }) => (
          <Toggle key={label} size="sm" pressed={active} onPressedChange={action} aria-label={label}>{icon}</Toggle>
        ))}

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Link */}
        <Toggle
          size="sm"
          pressed={editor.isActive('link')}
          onPressedChange={openLinkModal}
          aria-label="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
        {editor.isActive('link') && (
          <Toggle size="sm" onPressedChange={removeLink} aria-label="Remove Link">
            <Unlink className="h-4 w-4" />
          </Toggle>
        )}

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Image */}
        <Toggle size="sm" onPressedChange={openImageModal} aria-label="Insert Image">
          <ImageIcon className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Custom Blocks */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
              + Block <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem
              onClick={() => (editor.chain().focus() as any).insertContent({ type: 'subscribeBlock' }).run()}
              className="gap-2"
            >
              <Mail className="h-4 w-4 text-primary" /> Email Subscribe Form
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (editor.chain().focus() as any).insertContent({ type: 'ctaButtonBlock' }).run()}
              className="gap-2"
            >
              <MousePointerClick className="h-4 w-4 text-orange-500" /> CTA Button
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (editor.chain().focus() as any).insertContent({ type: 'contactFormBlock' }).run()}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4 text-blue-500" /> Contact Form
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (editor.chain().focus() as any).insertContent({ type: 'downloadBlock' }).run()}
              className="gap-2"
            >
              <Download className="h-4 w-4 text-green-600" /> Download / PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (editor.chain().focus() as any).insertContent({ type: 'popupBlock' }).run()}
              className="gap-2"
            >
              <Zap className="h-4 w-4 text-purple-500" /> Popup Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Undo / Redo */}
        <Toggle size="sm" onPressedChange={() => editor.chain().focus().undo().run()} aria-label="Undo">
          <Undo className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" onPressedChange={() => editor.chain().focus().redo().run()} aria-label="Redo">
          <Redo className="h-4 w-4" />
        </Toggle>
      </div>

      {/* ── Image Modal ── */}
      <Dialog open={imageModal} onOpenChange={setImageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="img-url">Image URL</Label>
              <Input
                id="img-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, insertImage)}
                autoFocus
              />
            </div>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                className="w-full max-h-40 object-cover rounded-md border border-border"
                onError={(e) => (e.currentTarget.style.display = 'none')}
                onLoad={(e) => (e.currentTarget.style.display = 'block')}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageModal(false)}>Cancel</Button>
            <Button onClick={insertImage} disabled={!imageUrl.trim()}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Link Modal ── */}
      <Dialog open={linkModal} onOpenChange={setLinkModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="link-url">URL *</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, insertLink)}
                autoFocus
              />
            </div>
            {editor.state.selection.empty && (
              <div className="space-y-1.5">
                <Label htmlFor="link-text">Link Text</Label>
                <Input
                  id="link-text"
                  placeholder="Click here"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, insertLink)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkModal(false)}>Cancel</Button>
            <Button onClick={insertLink} disabled={!linkUrl.trim()}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
