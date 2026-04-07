'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, Sparkles, X, Trash2,
  Loader2, ExternalLink, Calendar as CalendarIcon, List,
  LayoutGrid, FileEdit, Settings2, Tag,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isToday, addMonths, subMonths, parseISO, compareAsc,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  calendarService, CalendarItem, CalendarStatus,
  AiSuggestion, AiSettings,
} from '@/services/calendar.service';
import { categoryService } from '@/services/category.service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<CalendarStatus, { label: string; color: string; dot: string; pill: string }> = {
  idea:          { label: 'Idea',        color: 'bg-slate-100 text-slate-700 border-slate-200',         dot: 'bg-slate-400',   pill: 'bg-slate-100 text-slate-600' },
  planned:       { label: 'Planned',     color: 'bg-blue-50 text-blue-700 border-blue-200',             dot: 'bg-blue-500',    pill: 'bg-blue-50 text-blue-700' },
  'in-progress': { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200',          dot: 'bg-amber-500',   pill: 'bg-amber-50 text-amber-700' },
  scheduled:     { label: 'Scheduled',   color: 'bg-violet-50 text-violet-700 border-violet-200',       dot: 'bg-violet-500',  pill: 'bg-violet-50 text-violet-700' },
  published:     { label: 'Published',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200',    dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700' },
};
const STATUSES = Object.keys(STATUS_CONFIG) as CalendarStatus[];
const TONES = ['professional', 'casual', 'educational', 'entertaining', 'inspirational'];

const emptyForm = () => ({
  title: '',
  description: '',
  scheduledDate: '',
  status: 'idea' as CalendarStatus,
  category: '',
  linkedPostId: null as string | null,
  aiGenerated: false,
});

const defaultAiSettings = (): AiSettings => ({
  count: 7,
  tone: 'professional',
  audience: '',
  customTopics: '',
  selectedCategories: [],
});

// ── Item chip (grid) ───────────────────────────────────────────────────────
function ItemChip({ item, onClick, onDragStart }: {
  item: CalendarItem;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, item: CalendarItem) => void;
}) {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        'flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border truncate cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow',
        cfg.color
      )}
      title={item.title}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
      <span className="truncate">{item.title}</span>
    </div>
  );
}

// ── Item dialog ────────────────────────────────────────────────────────────
function ItemDialog({ open, item, defaultDate, categories, onClose, onSave, onDelete, onCreatePost }: {
  open: boolean;
  item: CalendarItem | null;
  defaultDate: string;
  categories: string[];
  onClose: () => void;
  onSave: (data: ReturnType<typeof emptyForm>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreatePost: (item: CalendarItem) => void;
}) {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        description: item.description,
        scheduledDate: item.scheduledDate.slice(0, 10),
        status: item.status,
        category: item.category,
        linkedPostId: item.linkedPostId,
        aiGenerated: item.aiGenerated,
      });
    } else {
      setForm({ ...emptyForm(), scheduledDate: defaultDate });
    }
  }, [item, defaultDate, open]);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    await onDelete(item._id);
    setDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-4 w-4 text-primary" />
            {item ? 'Edit Content Item' : 'New Content Item'}
            {item?.aiGenerated && (
              <Badge variant="secondary" className="text-[10px] ml-1 py-0">
                <Sparkles className="h-2.5 w-2.5 mr-1" /> AI
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="Post title or content idea" autoFocus />
          </div>

          <div className="space-y-1.5">
            <Label>Notes / Description</Label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Brief notes about this idea..." rows={2} className="resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', STATUS_CONFIG[s].dot)} />
                        {STATUS_CONFIG[s].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category || '__none__'} onValueChange={(v) => set('category', v === '__none__' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No category</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {item?.linkedPostId && (
            <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">Linked to a published post</span>
              <Link href={`/dashboard/posts/${item.linkedPostId}/edit`}
                className="text-xs text-primary hover:underline ml-auto">Edit post →</Link>
            </div>
          )}

          {/* Create Post button — only for existing saved items */}
          {item && item.status !== 'published' && (
            <div className="pt-1 border-t border-border">
              <button
                type="button"
                onClick={() => onCreatePost(item)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <FileEdit className="h-4 w-4" />
                Write Post from This Idea
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-1.5">
                Opens the post editor with this title & notes prefilled and AI assistant ready
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2 flex-row">
          <div>
            {item && (
              <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10">
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span className="ml-1">Delete</span>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              {item ? 'Save' : 'Add Item'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── AI Suggest panel ───────────────────────────────────────────────────────
function AiSuggestPanel({ year, month, items, allCategories, onAccept, onClose,
  suggestions, setSuggestions, selected, setSelected, settings, setSettings,
}: {
  year: number;
  month: number;
  items: CalendarItem[];
  allCategories: string[];
  onAccept: (suggestions: AiSuggestion[]) => void;
  onClose: () => void;
  suggestions: AiSuggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<AiSuggestion[]>>;
  selected: Set<number>;
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
  settings: AiSettings;
  setSettings: React.Dispatch<React.SetStateAction<AiSettings>>;
}) {
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const setSetting = (k: keyof AiSettings, v: any) => setSettings((p) => ({ ...p, [k]: v }));

  const toggleCategory = (cat: string) => {
    setSettings((p) => {
      const s = new Set(p.selectedCategories);
      s.has(cat) ? s.delete(cat) : s.add(cat);
      return { ...p, selectedCategories: Array.from(s) };
    });
  };

  const generate = async () => {
    setLoading(true);
    setSuggestions([]);
    setSelected(new Set<number>());
    try {
      const res = await calendarService.suggestItems(year, month, items, settings);
      setSuggestions(res.suggestions);
      setSelected(new Set(res.suggestions.map((_, i) => i)));
    } catch {
      toast({ title: 'AI error', description: 'Failed to generate suggestions.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (i: number) =>
    setSelected((p) => { const s = new Set(p); s.has(i) ? s.delete(i) : s.add(i); return s; });

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="w-full lg:w-80 shrink-0 border border-border rounded-xl bg-card flex flex-col overflow-hidden shadow-md"
      style={{ maxHeight: 'calc(100vh - 180px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">AI Content Ideas</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setShowSettings((v) => !v)} title="Settings">
            <Settings2 className={cn('h-3.5 w-3.5', showSettings && 'text-primary')} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border shrink-0"
          >
            <div className="p-4 space-y-3 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generation Settings</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Ideas to generate</Label>
                  <Select value={String(settings.count)} onValueChange={(v) => setSetting('count', Number(v))}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10, 14].map((n) => <SelectItem key={n} value={String(n)}>{n} ideas</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tone</Label>
                  <Select value={settings.tone} onValueChange={(v) => setSetting('tone', v)}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Target Audience</Label>
                <Input
                  className="h-7 text-xs"
                  placeholder="e.g. developers, small business owners"
                  value={settings.audience}
                  onChange={(e) => setSetting('audience', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Custom Topics / Focus Areas</Label>
                <Textarea
                  className="text-xs resize-none"
                  rows={2}
                  placeholder="e.g. AI trends, remote work, productivity tools"
                  value={settings.customTopics}
                  onChange={(e) => setSetting('customTopics', e.target.value)}
                />
              </div>

              {allCategories.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Limit to categories
                    <span className="text-muted-foreground font-normal">(all if none selected)</span>
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {allCategories.map((cat) => {
                      const active = settings.selectedCategories.includes(cat);
                      return (
                        <button key={cat} onClick={() => toggleCategory(cat)}
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors',
                            active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'
                          )}>
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate button */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <Button className="w-full" size="sm" onClick={generate} disabled={loading}>
          {loading
            ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Generating...</>
            : <><Sparkles className="h-3.5 w-3.5 mr-2" /> Generate Ideas</>}
        </Button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-center">Generating ideas based on your categories and settings...</p>
          </div>
        )}

        {!loading && suggestions.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs">Configure your settings above and click Generate</p>
          </div>
        )}

        {suggestions.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-muted-foreground">{selected.size}/{suggestions.length} selected</p>
              <button className="text-xs text-primary hover:underline"
                onClick={() => setSelected(selected.size === suggestions.length
                  ? new Set()
                  : new Set(suggestions.map((_, i) => i)))}>
                {selected.size === suggestions.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            {suggestions.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => toggle(i)}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  selected.has(i) ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 opacity-50'
                )}>
                <div className="flex gap-2">
                  <div className={cn(
                    'h-4 w-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center',
                    selected.has(i) ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                  )}>
                    {selected.has(i) && <span className="text-primary-foreground text-[8px] font-bold">✓</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-snug">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px] py-0 h-4">{s.category}</Badge>
                      <span className="text-[10px] text-muted-foreground">Day {s.suggestedDay}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="px-4 py-3 border-t border-border shrink-0">
          <Button className="w-full" size="sm"
            onClick={() => onAccept(suggestions.filter((_, i) => selected.has(i)))}
            disabled={selected.size === 0}>
            Add {selected.size} {selected.size === 1 ? 'idea' : 'ideas'} to calendar
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ── List / Row view ────────────────────────────────────────────────────────
function ListView({ items, onEdit }: { items: CalendarItem[]; onEdit: (item: CalendarItem) => void }) {
  const sorted = [...items].sort((a, b) =>
    compareAsc(parseISO(a.scheduledDate), parseISO(b.scheduledDate))
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">No items this month. Add some ideas!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((item, i) => {
        const cfg = STATUS_CONFIG[item.status];
        return (
          <motion.div key={item._id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => onEdit(item)}
            className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className={cn('h-2 w-2 rounded-full mt-2 shrink-0', cfg.dot)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-1">{item.title}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.aiGenerated && <Sparkles className="h-3 w-3 text-muted-foreground" />}
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', cfg.pill)}>
                    {cfg.label}
                  </span>
                </div>
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                <span>{format(parseISO(item.scheduledDate), 'EEE, MMM d')}</span>
                {item.category && <><span>·</span><span>{item.category}</span></>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ContentCalendarPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAi, setShowAi] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);
  const [defaultDate, setDefaultDate] = useState('');

  // AI panel state — lifted so closing panel doesn't wipe suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [aiSelected, setAiSelected] = useState<Set<number>>(new Set());
  const [aiSettings, setAiSettings] = useState<AiSettings>(defaultAiSettings());

  const draggingItem = useRef<CalendarItem | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await calendarService.getItems(year, month);
      setItems(data);
    } catch {
      toast({ title: 'Error loading calendar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // Clear AI suggestions when month changes — they're month-specific
    setAiSuggestions([]);
    setAiSelected(new Set());
  }, [year, month]);
  useEffect(() => {
    categoryService.getCategories()
      .then((cats) => setCategories(cats.map((c) => c.name)))
      .catch(() => {});
  }, []);

  // Build grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days: Date[] = [];
  let d = gridStart;
  while (d <= gridEnd) { days.push(d); d = addDays(d, 1); }

  const itemsByDate = items.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    const key = item.scheduledDate.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Handlers
  const openCreate = (dateStr: string) => { setEditingItem(null); setDefaultDate(dateStr); setDialogOpen(true); };
  const openEdit = (item: CalendarItem) => { setEditingItem(item); setDefaultDate(item.scheduledDate.slice(0, 10)); setDialogOpen(true); };

  const handleSave = async (form: ReturnType<typeof emptyForm>) => {
    try {
      if (editingItem) {
        const updated = await calendarService.updateItem(editingItem._id, form as any);
        setItems((prev) => prev.map((i) => i._id === updated._id ? updated : i));
      } else {
        const created = await calendarService.createItem(form as any);
        setItems((prev) => [...prev, created]);
      }
      setDialogOpen(false);
      toast({ title: editingItem ? 'Item updated' : 'Item added' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await calendarService.deleteItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setDialogOpen(false);
      toast({ title: 'Item deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreatePost = (item: CalendarItem) => {
    setDialogOpen(false);
    const params = new URLSearchParams({
      title: item.title,
      category: item.category || '',
      excerpt: item.description || '',
      fromCalendar: 'true',
    });
    router.push(`/dashboard/posts/create?${params.toString()}`);
  };

  // Drag & drop
  const handleDragStart = (e: React.DragEvent, item: CalendarItem) => {
    draggingItem.current = item;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(dateStr);
  };
  const handleDrop = async (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const item = draggingItem.current;
    if (!item || item.scheduledDate.slice(0, 10) === dateStr) return;
    try {
      const updated = await calendarService.updateItem(item._id, { scheduledDate: dateStr } as any);
      setItems((prev) => prev.map((i) => i._id === updated._id ? updated : i));
      toast({ title: 'Rescheduled' });
    } catch {
      toast({ title: 'Failed to reschedule', variant: 'destructive' });
    }
    draggingItem.current = null;
  };

  // AI
  const handleAiAccept = async (suggestions: AiSuggestion[]) => {
    try {
      const created = await Promise.all(
        suggestions.map((s) =>
          calendarService.createItem({
            title: s.title,
            description: s.description,
            category: s.category,
            scheduledDate: new Date(year, month - 1, s.suggestedDay).toISOString(),
            status: 'idea',
            linkedPostId: null,
            aiGenerated: true,
          })
        )
      );
      setItems((prev) => [...prev, ...created]);
      toast({ title: `${created.length} ideas added to calendar` });
    } catch {
      toast({ title: 'Failed to add ideas', variant: 'destructive' });
    }
  };

  const statusCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Content Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Plan, schedule, and write your content pipeline</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={cn('px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors',
                view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors',
                view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
            >
              <List className="h-3.5 w-3.5" /> <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <Button variant={showAi ? 'default' : 'outline'} size="sm" onClick={() => setShowAi((v) => !v)}>
            <Sparkles className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">AI Ideas</span>
          </Button>
          <Button size="sm" onClick={() => openCreate(format(new Date(), 'yyyy-MM-dd'))}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <div key={s} className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium', STATUS_CONFIG[s].color)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_CONFIG[s].dot)} />
            <span className="hidden sm:inline">{STATUS_CONFIG[s].label}</span>
            <span className="sm:hidden">{STATUS_CONFIG[s].label.split(' ')[0]}</span>
            {statusCounts[s] ? <span className="opacity-60">({statusCounts[s]})</span> : null}
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Calendar / List */}
        <div className="flex-1 min-w-0 w-full">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-base sm:text-lg font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
            </div>
          ) : view === 'list' ? (
            <ListView items={items} onEdit={openEdit} />
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground py-1">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day[0]}</span>
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayItems = itemsByDate[dateStr] || [];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDropTarget = dragOverDate === dateStr;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => isCurrentMonth && openCreate(dateStr)}
                      onDragOver={(e) => handleDragOver(e, dateStr)}
                      onDragLeave={() => setDragOverDate(null)}
                      onDrop={(e) => handleDrop(e, dateStr)}
                      className={cn(
                        'rounded-lg border p-1 sm:p-1.5 min-h-[60px] sm:min-h-[90px] flex flex-col gap-0.5 sm:gap-1 transition-colors',
                        isCurrentMonth ? 'bg-card hover:bg-muted/40 cursor-pointer' : 'bg-muted/10 opacity-40 cursor-default',
                        isToday(day) && 'ring-2 ring-primary ring-offset-1',
                        isDropTarget && isCurrentMonth && 'bg-primary/10 border-primary border-dashed'
                      )}
                    >
                      {/* Date number */}
                      <div className={cn(
                        'text-[10px] sm:text-xs font-semibold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shrink-0 self-end',
                        isToday(day) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      )}>
                        {format(day, 'd')}
                      </div>

                      {/* Items — show dots on mobile, chips on desktop */}
                      <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                        {/* Mobile: dot indicators */}
                        <div className="flex flex-wrap gap-0.5 sm:hidden">
                          {dayItems.slice(0, 3).map((item) => (
                            <button key={item._id}
                              onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                              className={cn('h-2 w-2 rounded-full', STATUS_CONFIG[item.status].dot)}
                              title={item.title}
                            />
                          ))}
                          {dayItems.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">+{dayItems.length - 3}</span>
                          )}
                        </div>

                        {/* Desktop: text chips */}
                        <div className="hidden sm:flex flex-col gap-0.5">
                          {dayItems.slice(0, 3).map((item) => (
                            <ItemChip key={item._id} item={item}
                              onClick={() => openEdit(item)}
                              onDragStart={handleDragStart}
                            />
                          ))}
                          {dayItems.length > 3 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(dayItems[3]); }}
                              className="text-[10px] text-muted-foreground hover:text-foreground pl-1 text-left"
                            >
                              +{dayItems.length - 3} more
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* AI Panel — below on mobile, side on desktop */}
        <AnimatePresence>
          {showAi && (
            <div className="w-full lg:w-80 lg:shrink-0">
              <AiSuggestPanel
                year={year}
                month={month}
                items={items}
                allCategories={categories}
                onAccept={handleAiAccept}
                onClose={() => setShowAi(false)}
                suggestions={aiSuggestions}
                setSuggestions={setAiSuggestions}
                selected={aiSelected}
                setSelected={setAiSelected}
                settings={aiSettings}
                setSettings={setAiSettings}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Item dialog */}
      <ItemDialog
        open={dialogOpen}
        item={editingItem}
        defaultDate={defaultDate}
        categories={categories}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onCreatePost={handleCreatePost}
      />
    </div>
  );
}
