'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Download, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { subscriberService } from '@/services/subscriber.service';

// ── Individual block renderers ────────────────────────────────────────────

function SubscribeBlockRenderer({ title, subtitle }: { title: string; subtitle: string }) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await subscriberService.subscribe(email, '', 'post-inline');
      setSuccess(true);
    } catch {
      setSuccess(true); // show success anyway for UX
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="my-6 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 p-5 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        <p className="text-sm font-medium text-green-700 dark:text-green-400">You're subscribed! Thanks for joining.</p>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl border border-border bg-muted/40 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-base">{title || 'Subscribe to our newsletter'}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{subtitle || 'Get the latest posts delivered to your inbox.'}</p>
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading} size="sm">
          {loading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    </div>
  );
}

function CtaButtonRenderer({ text, url, style }: { text: string; url: string; style: string }) {
  const cls =
    style === 'outline'
      ? 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground'
      : style === 'secondary'
      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      : 'bg-primary text-primary-foreground hover:bg-primary/90';

  return (
    <div className="my-6 flex justify-center">
      <a
        href={url || '#'}
        target={url?.startsWith('http') ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold transition-colors no-underline ${cls}`}
      >
        {text || 'Click Here'}
      </a>
    </div>
  );
}

function ContactFormRenderer({ heading }: { heading: string }) {
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send — replace with your contact API
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="my-6 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 p-5 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        <p className="text-sm font-medium text-green-700 dark:text-green-400">Message sent! We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl border border-border bg-muted/40 p-5">
      <h3 className="font-semibold text-base mb-4">{heading || 'Get in Touch'}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input placeholder="Your name" value={fields.name} onChange={(e) => setFields((p) => ({ ...p, name: e.target.value }))} />
        <Input type="email" placeholder="your@email.com" required value={fields.email} onChange={(e) => setFields((p) => ({ ...p, email: e.target.value }))} />
        <Textarea placeholder="Your message..." rows={4} required value={fields.message} onChange={(e) => setFields((p) => ({ ...p, message: e.target.value }))} />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}

function DownloadBlockRenderer({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="my-6 rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
          <FileText className="h-6 w-6 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{title || 'Download Resource'}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <a
          href={url || '#'}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors no-underline shrink-0"
        >
          <Download className="h-4 w-4" /> Download
        </a>
      </div>
    </div>
  );
}

function PopupBlockRenderer({ triggerText, title, content, ctaText, ctaUrl }: any) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="my-6 flex justify-center">
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
        >
          {triggerText || 'Open Popup'}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-background rounded-xl border border-border p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg">{title || 'Special Offer'}</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{content || ''}</p>
            {ctaUrl && (
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors no-underline"
              >
                {ctaText || 'Learn More'}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Main PostContent component ────────────────────────────────────────────

interface Part {
  type: 'html' | 'block';
  html?: string;
  blockType?: string;
  attrs?: Record<string, string>;
}

function parsePostContent(html: string): Part[] {
  if (typeof window === 'undefined') return [{ type: 'html', html }];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const parts: Part[] = [];
  let currentHtml = '';

  const flush = () => {
    if (currentHtml.trim()) {
      parts.push({ type: 'html', html: currentHtml });
      currentHtml = '';
    }
  };

  Array.from(doc.body.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const blockType = el.getAttribute('data-tiptap-block');
      if (blockType) {
        flush();
        const attrs: Record<string, string> = {};
        Array.from(el.attributes).forEach((a) => {
          attrs[a.name] = a.value;
        });
        parts.push({ type: 'block', blockType, attrs });
        return;
      }
    }
    const div = document.createElement('div');
    div.appendChild(node.cloneNode(true));
    currentHtml += div.innerHTML;
  });

  flush();
  return parts;
}

export default function PostContent({ html }: { html: string }) {
  const parts = parsePostContent(html);

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'html') {
          return <div key={i} dangerouslySetInnerHTML={{ __html: part.html! }} />;
        }

        const a = part.attrs || {};
        switch (part.blockType) {
          case 'subscribe':
            return <SubscribeBlockRenderer key={i} title={a['data-title']} subtitle={a['data-subtitle']} />;
          case 'cta-button':
            return <CtaButtonRenderer key={i} text={a['data-text']} url={a['data-url']} style={a['data-style']} />;
          case 'contact-form':
            return <ContactFormRenderer key={i} heading={a['data-heading']} />;
          case 'download':
            return <DownloadBlockRenderer key={i} title={a['data-title']} description={a['data-description']} url={a['data-url']} />;
          case 'popup':
            return <PopupBlockRenderer key={i} triggerText={a['data-trigger-text']} title={a['data-title']} content={a['data-content']} ctaText={a['data-cta-text']} ctaUrl={a['data-cta-url']} />;
          default:
            return null;
        }
      })}
    </>
  );
}
