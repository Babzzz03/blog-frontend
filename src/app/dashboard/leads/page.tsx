'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, MousePointerClick, Megaphone, Zap } from 'lucide-react';
import { settingsService, CTA, SiteSettings } from '@/services/settings.service';
import { useToast } from '@/hooks/use-toast';

const TYPE_LABELS: Record<string, string> = { banner: 'Banner', inline: 'Inline Block', popup: 'Popup' };

const defaultForm = { title: '', description: '', buttonText: 'Learn More', buttonUrl: '', type: 'inline' as CTA['type'], isActive: true };

export default function LeadsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CTA | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { settingsService.getSettings().then(setSettings).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit = (cta: CTA) => { setEditing(cta); setForm({ title: cta.title, description: cta.description, buttonText: cta.buttonText, buttonUrl: cta.buttonUrl, type: cta.type, isActive: cta.isActive }); setModal(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      let updated: SiteSettings;
      if (editing) {
        updated = await settingsService.updateCta(editing._id, form);
      } else {
        updated = await settingsService.createCta(form);
      }
      setSettings(updated);
      toast({ title: editing ? 'CTA updated' : 'CTA created' });
      setModal(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this CTA?')) return;
    try {
      const updated = await settingsService.deleteCta(id);
      setSettings(updated);
      toast({ title: 'CTA deleted' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const toggleActive = async (cta: CTA) => {
    try {
      const updated = await settingsService.updateCta(cta._id, { ...cta, isActive: !cta.isActive });
      setSettings(updated);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const ctas = settings?.ctas || [];
  const activeCtas = ctas.filter((c) => c.isActive).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Lead Capture & CTAs</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage call-to-action blocks that appear inside your blog posts.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New CTA</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Zap className="h-4 w-4" />Total CTAs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{ctas.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><MousePointerClick className="h-4 w-4" />Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{activeCtas}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Megaphone className="h-4 w-4" />Inactive</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-muted-foreground">{ctas.length - activeCtas}</div></CardContent></Card>
      </div>

      {/* CTA preview info */}
      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">How CTAs work:</strong> Active CTAs are available via the <code className="text-xs bg-muted px-1 rounded">GET /api/v1/settings</code> endpoint.
            Your blog post view component can fetch and render them as inline blocks, banners, or popups inside posts.
          </p>
        </CardContent>
      </Card>

      {ctas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No CTAs yet. Create your first call-to-action button to capture leads from your posts.</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create First CTA</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {ctas.map((cta) => (
            <Card key={cta._id} className={cta.isActive ? '' : 'opacity-60'}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base">{cta.title}</CardTitle>
                    <Badge variant="outline">{TYPE_LABELS[cta.type]}</Badge>
                    <Badge variant={cta.isActive ? 'default' : 'secondary'}>{cta.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cta)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cta._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {cta.description && <p className="text-sm text-muted-foreground">{cta.description}</p>}
                <div className="flex items-center justify-between">
                  <a href={cta.buttonUrl || '#'} className="inline-block text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md">
                    {cta.buttonText}
                  </a>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{cta.isActive ? 'Active' : 'Inactive'}</span>
                    <Switch checked={cta.isActive} onCheckedChange={() => toggleActive(cta)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit CTA' : 'Create CTA'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder='e.g. "Book a Free Call"' value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Short description shown under the title" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Button Text</Label>
                <Input placeholder="Learn More" value={form.buttonText} onChange={(e) => setForm((p) => ({ ...p, buttonText: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v: CTA['type']) => setForm((p) => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inline">Inline Block</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="popup">Popup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Button URL</Label>
              <Input placeholder="https://example.com/contact" value={form.buttonUrl} onChange={(e) => setForm((p) => ({ ...p, buttonUrl: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer">Active</Label>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
