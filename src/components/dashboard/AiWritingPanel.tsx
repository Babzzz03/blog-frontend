'use client';

import { useState } from 'react';
import { Sparkles, Wand2, Type, FileText, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { aiService, GeneratedPost } from '@/services/ai.service';
import { cn } from '@/lib/utils';

interface AiWritingPanelProps {
  currentContent: string;
  onGenerated: (post: GeneratedPost) => void;
  onContentRefined: (content: string) => void;
  onTitleSelected: (title: string) => void;
  onExcerptGenerated: (excerpt: string) => void;
  initialTopic?: string;
}

const QUICK_REFINE_OPTIONS = [
  { label: 'Fix grammar', instruction: 'Fix all grammar, spelling and punctuation errors. Keep the same structure and meaning.' },
  { label: 'Improve clarity', instruction: 'Rewrite for clarity. Use simpler sentences and clearer language. Keep the same structure.' },
  { label: 'Make shorter', instruction: 'Shorten the content by removing redundant sentences and trimming verbose sections. Keep all key points.' },
  { label: 'Make longer', instruction: 'Expand the content with more detail, examples, and explanations. Keep the original structure.' },
  { label: 'More engaging', instruction: 'Make the content more engaging and compelling. Use active voice, vivid language, and stronger hooks.' },
  { label: 'More formal', instruction: 'Rewrite in a professional, formal tone suitable for a business or academic audience.' },
];

export default function AiWritingPanel({
  currentContent,
  onGenerated,
  onContentRefined,
  onTitleSelected,
  onExcerptGenerated,
  initialTopic = '',
}: AiWritingPanelProps) {
  const { toast } = useToast();

  // Generate post state
  const [topic, setTopic] = useState(initialTopic);
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState<'informative' | 'casual' | 'professional' | 'persuasive' | 'storytelling'>('informative');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [generating, setGenerating] = useState(false);

  // Refine state — tracks which button is currently loading
  const [activeRefineBtn, setActiveRefineBtn] = useState<string | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [refineWordCount, setRefineWordCount] = useState<string>('none');  // 'none' = no target

  // Titles state
  const [titleTopic, setTitleTopic] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [suggestingTitles, setSuggestingTitles] = useState(false);

  // Summarize state
  const [summarizing, setSummarizing] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: 'Topic required', description: 'Enter a topic to generate a post.', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    try {
      const post = await aiService.generatePost({ topic, keywords, tone, length });
      onGenerated(post);
      toast({ title: 'Post generated!', description: 'Review and edit before publishing.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate post. Check your API key.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleRefine = async (btnLabel: string, instruction: string) => {
    if (!currentContent || currentContent === '<p></p>') {
      toast({ title: 'No content', description: 'Write or generate some content first.', variant: 'destructive' });
      return;
    }
    if (activeRefineBtn) return;

    const wordCount = refineWordCount && refineWordCount !== 'none' ? parseInt(refineWordCount) : undefined;
    setActiveRefineBtn(btnLabel);
    try {
      const { content } = await aiService.refinePost(currentContent, instruction, wordCount);
      onContentRefined(content);
      toast({ title: `Done: ${btnLabel}`, description: 'Your content has been updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to refine content. Try again.', variant: 'destructive' });
    } finally {
      setActiveRefineBtn(null);
    }
  };

  const handleCustomRefine = () => {
    if (!refineInstruction.trim()) {
      toast({ title: 'Instruction required', description: 'Describe how to improve the content.', variant: 'destructive' });
      return;
    }
    handleRefine('custom', refineInstruction.trim());
  };

  const handleSuggestTitles = async () => {
    if (!titleTopic.trim() && (!currentContent || currentContent === '<p></p>')) {
      toast({ title: 'Input required', description: 'Enter a topic or write some content first.', variant: 'destructive' });
      return;
    }
    setSuggestingTitles(true);
    try {
      const { titles: suggested } = await aiService.suggestTitles(
        titleTopic || undefined,
        currentContent || undefined
      );
      setTitles(suggested);
    } catch {
      toast({ title: 'Error', description: 'Failed to suggest titles.', variant: 'destructive' });
    } finally {
      setSuggestingTitles(false);
    }
  };

  const handleSummarize = async () => {
    if (!currentContent || currentContent === '<p></p>') {
      toast({ title: 'No content', description: 'Write or generate some content first.', variant: 'destructive' });
      return;
    }
    setSummarizing(true);
    try {
      const { excerpt } = await aiService.summarize(currentContent);
      onExcerptGenerated(excerpt);
      toast({ title: 'Excerpt generated!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate excerpt.', variant: 'destructive' });
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Generate Post */}
      <Section icon={<Sparkles className="h-4 w-4" />} title="Generate Post">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Topic *</Label>
            <Input
              placeholder="e.g. The future of AI in healthcare"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Keywords (optional)</Label>
            <Input
              placeholder="e.g. machine learning, diagnosis, data"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tone</Label>
              <Select value={tone} onValueChange={(v: typeof tone) => setTone(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Length</Label>
              <Select value={length} onValueChange={(v: typeof length) => setLength(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (~400w)</SelectItem>
                  <SelectItem value="medium">Medium (~750w)</SelectItem>
                  <SelectItem value="long">Long (~1200w)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full" size="sm">
            {generating
              ? <><Loader2 className="h-3 w-3 mr-2 animate-spin" />Generating...</>
              : <><Sparkles className="h-3 w-3 mr-2" />Generate Full Post</>}
          </Button>
        </div>
      </Section>

      {/* Refine & Format Content */}
      <Section icon={<Wand2 className="h-4 w-4" />} title="Refine & Format Content">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Works on both plain text and HTML. Plain text will be converted to a properly structured blog post.
          </p>

          {/* Word count target */}
          <div className="space-y-1.5">
            <Label className="text-xs">Target word count <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Select value={refineWordCount} onValueChange={setRefineWordCount}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="No target (keep current length)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No target</SelectItem>
                <SelectItem value="300">~300 words (short)</SelectItem>
                <SelectItem value="500">~500 words</SelectItem>
                <SelectItem value="750">~750 words (medium)</SelectItem>
                <SelectItem value="1000">~1000 words</SelectItem>
                <SelectItem value="1500">~1500 words (long)</SelectItem>
                <SelectItem value="2000">~2000 words</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_REFINE_OPTIONS.map(({ label, instruction }) => {
              const isThis = activeRefineBtn === label;
              const isAnyLoading = activeRefineBtn !== null;
              return (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'text-xs h-9 justify-start gap-2',
                    isThis && 'border-primary text-primary',
                  )}
                  disabled={isAnyLoading}
                  onClick={() => handleRefine(label, instruction)}
                >
                  {isThis
                    ? <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                    : <Wand2 className="h-3 w-3 shrink-0 opacity-50" />}
                  {label}
                </Button>
              );
            })}
          </div>

          {/* Format only button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-start gap-2"
            disabled={activeRefineBtn !== null}
            onClick={() => handleRefine('format', 'Format this content into a well-structured blog post with proper headings, paragraphs, and HTML. Do not change the words or meaning — only improve the structure and formatting.')}
          >
            {activeRefineBtn === 'format'
              ? <Loader2 className="h-3 w-3 animate-spin shrink-0" />
              : <Wand2 className="h-3 w-3 shrink-0 opacity-50" />}
            Format & structure only (no rewriting)
          </Button>

          <div className="space-y-1.5 pt-1 border-t border-border">
            <Label className="text-xs">Custom instruction</Label>
            <Textarea
              placeholder="e.g. Add statistics and real-world examples..."
              value={refineInstruction}
              onChange={(e) => setRefineInstruction(e.target.value)}
              rows={2}
              className="text-sm resize-none"
              disabled={activeRefineBtn !== null}
            />
            <Button
              onClick={handleCustomRefine}
              disabled={activeRefineBtn !== null || !refineInstruction.trim()}
              variant="secondary"
              className="w-full"
              size="sm"
            >
              {activeRefineBtn === 'custom'
                ? <><Loader2 className="h-3 w-3 mr-2 animate-spin" />Applying...</>
                : <><Wand2 className="h-3 w-3 mr-2" />Apply Custom</>}
            </Button>
          </div>
        </div>
      </Section>

      {/* Suggest Titles */}
      <Section icon={<Type className="h-4 w-4" />} title="Suggest Titles">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Topic (or leave blank to use content)</Label>
            <Input
              placeholder="e.g. productivity for developers"
              value={titleTopic}
              onChange={(e) => setTitleTopic(e.target.value)}
            />
          </div>
          <Button onClick={handleSuggestTitles} disabled={suggestingTitles} variant="secondary" className="w-full" size="sm">
            {suggestingTitles
              ? <><Loader2 className="h-3 w-3 mr-2 animate-spin" />Generating...</>
              : <><Type className="h-3 w-3 mr-2" />Suggest 5 Titles</>}
          </Button>
          {titles.length > 0 && (
            <div className="space-y-1.5">
              {titles.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { onTitleSelected(t); toast({ title: 'Title applied' }); }}
                  className="w-full text-left text-xs px-3 py-2 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors flex items-start gap-2"
                >
                  <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-primary opacity-50" />
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Generate Excerpt */}
      <Section icon={<FileText className="h-4 w-4" />} title="Generate Excerpt">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Auto-generate a short excerpt from your current content.</p>
          <Button onClick={handleSummarize} disabled={summarizing} variant="secondary" className="w-full" size="sm">
            {summarizing
              ? <><Loader2 className="h-3 w-3 mr-2 animate-spin" />Summarizing...</>
              : <><FileText className="h-3 w-3 mr-2" />Generate Excerpt</>}
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border border-border bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-accent/50 transition-colors rounded-lg">
          <span className="flex items-center gap-2 text-primary">
            {icon}
            {title}
          </span>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-1">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
