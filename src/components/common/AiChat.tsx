'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, MessageCircle, Shield, Trash2, ChevronDown } from 'lucide-react';
import { aiService, ChatMessage } from '@/services/ai.service';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import MarkdownMessage from './MarkdownMessage';

// ─── Quick prompts per role ───────────────────────────────────────────────

const USER_PROMPTS = [
  'What topics does this blog cover?',
  'Show me the latest posts',
  'Search for posts about technology',
  'What categories are available?',
];

const ADMIN_PROMPTS = [
  'Show me the blog statistics',
  'Who are the most recent users?',
  'What are the top liked posts?',
  'Analyze SEO for my latest post',
  'Show recent comments',
  'Create a test user',
  'Which category has the most posts?',
];

// ─── Main Component ───────────────────────────────────────────────────────

export default function AiChat() {
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Reset when role changes
  useEffect(() => {
    setMessages([]);
    setShowPrompts(true);
  }, [isAdmin]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    if (showPrompts) setShowPrompts(false);
    const userMsg: ChatMessage = { role: 'user', text: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const { reply } = isAdmin
        ? await aiService.adminChat(msg, messages)
        : await aiService.chat(msg, messages);
      setMessages([...updated, { role: 'model', text: reply }]);
    } catch (err: any) {
      const errText = err?.message?.includes('403')
        ? 'Admin session expired. Please sign in again.'
        : 'Something went wrong. Please try again.';
      setMessages([...updated, { role: 'model', text: errText }]);
    } finally {
      setLoading(false);
    }
  };

  const prompts = isAdmin ? ADMIN_PROMPTS : USER_PROMPTS;

  const welcomeText = isAdmin
    ? "Hi Admin! I have full access to your blog database. Ask me for stats, user info, post analysis, SEO insights, and more."
    : "Hi! I'm your blog assistant. I can help you find posts, explore topics, and discover content. What are you looking for?";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col w-80 sm:w-[400px] h-[540px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between px-4 py-3',
            isAdmin ? 'bg-zinc-900 text-white' : 'bg-primary text-primary-foreground'
          )}>
            <div className="flex items-center gap-2">
              {isAdmin ? <Shield className="h-4 w-4" /> : <Bot className="h-5 w-5" />}
              <span className="font-semibold text-sm">
                {isAdmin ? 'Admin AI Assistant' : 'AI Assistant'}
              </span>
              {isAdmin && (
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">ADMIN</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => { setMessages([]); setShowPrompts(true); }}
                  className="rounded-full p-1 hover:bg-white/20 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome + quick prompts */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-2.5">
                  <div className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    isAdmin ? 'bg-zinc-900' : 'bg-primary/10'
                  )}>
                    {isAdmin
                      ? <Shield className="h-3.5 w-3.5 text-white" />
                      : <Bot className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-foreground max-w-[85%]">
                    {welcomeText}
                  </div>
                </div>

                {showPrompts && (
                  <div className="pl-9 space-y-1.5">
                    <button
                      className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => setShowPrompts(false)}
                    >
                      <ChevronDown className="h-3 w-3" /> Quick prompts
                    </button>
                    <div className="flex flex-col gap-1.5">
                      {prompts.map((p) => (
                        <button
                          key={p}
                          onClick={() => sendMessage(p)}
                          disabled={loading}
                          className="text-left text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:border-primary/40 transition-colors disabled:opacity-40"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message history */}
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'model' && (
                  <div className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    isAdmin ? 'bg-zinc-900' : 'bg-primary/10'
                  )}>
                    {isAdmin
                      ? <Shield className="h-3.5 w-3.5 text-white" />
                      : <Bot className="h-3.5 w-3.5 text-primary" />}
                  </div>
                )}
                <div className={cn(
                  'max-w-[82%] rounded-2xl px-4 py-2.5',
                  msg.role === 'user'
                    ? cn('text-sm rounded-tr-sm', isAdmin ? 'bg-zinc-900 text-white' : 'bg-primary text-primary-foreground')
                    : 'bg-muted text-foreground rounded-tl-sm'
                )}>
                  {msg.role === 'model'
                    ? <MarkdownMessage text={msg.text} />
                    : <p className="text-sm leading-relaxed">{msg.text}</p>}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex gap-2.5">
                <div className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                  isAdmin ? 'bg-zinc-900' : 'bg-primary/10'
                )}>
                  {isAdmin
                    ? <Shield className="h-3.5 w-3.5 text-white" />
                    : <Bot className="h-3.5 w-3.5 text-primary" />}
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder={isAdmin ? 'Ask anything about your blog...' : 'Ask me anything...'}
              className="flex-1 text-sm bg-muted rounded-full px-4 py-2 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={cn(
                'flex items-center justify-center h-9 w-9 rounded-full disabled:opacity-40 hover:opacity-90 transition-opacity',
                isAdmin ? 'bg-zinc-900 text-white' : 'bg-primary text-primary-foreground'
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center justify-center h-14 w-14 rounded-full shadow-lg hover:opacity-90 transition-all',
          isAdmin ? 'bg-zinc-900 text-white' : 'bg-primary text-primary-foreground'
        )}
      >
        {open
          ? <X className="h-6 w-6" />
          : isAdmin
            ? <Shield className="h-6 w-6" />
            : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
