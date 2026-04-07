'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Trash2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aiService, ChatMessage } from '@/services/ai.service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MarkdownMessage from '@/components/common/MarkdownMessage';

const QUICK_PROMPTS = [
  'Give me 5 blog post ideas for a tech blog',
  'Write an engaging introduction for a post about remote work',
  'How do I improve SEO for my blog posts?',
  'What makes a good blog post headline?',
  'Suggest a content calendar for next month',
  'How to write a strong call to action?',
];

export default function AiAssistantPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: message };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const { reply } = await aiService.adminChat(message, messages);
      setMessages([...updated, { role: 'model', text: reply }]);
    } catch {
      toast({ title: 'Error', description: 'Failed to get a response. Check your API key.', variant: 'destructive' });
      setMessages(updated); // remove user message on fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">AI Assistant</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ask anything — generate ideas, get writing help, or improve your content strategy.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setMessages([])}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear chat
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
        {/* Chat window */}
        <Card className="flex flex-col h-[600px]">
          <CardContent className="flex flex-col h-full p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Your AI writing assistant</p>
                    <p className="text-sm mt-1">Ask me to generate ideas, write content, or give advice.</p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'model' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm text-sm leading-relaxed'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    )}
                  >
                    {msg.role === 'user'
                      ? msg.text
                      : <MarkdownMessage text={msg.text} prose />}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-4 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                placeholder="Ask anything about your blog..."
                disabled={loading}
                className="flex-1"
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick prompts */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Ask for blog post ideas in any niche</p>
              <p>• Request full post drafts with a topic</p>
              <p>• Get SEO and engagement advice</p>
              <p>• Paste content to get improvement tips</p>
              <p>• Ask for headline variations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
