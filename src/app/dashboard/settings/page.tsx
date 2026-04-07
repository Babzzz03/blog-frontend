'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe, Mail, Share2, Bot, Save, Palette, Check, Layout, Search, ExternalLink } from 'lucide-react';
import { settingsService, SiteSettings } from '@/services/settings.service';
import { useToast } from '@/hooks/use-toast';
import { useTheme, PRESET_COLORS, ThemeColor } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

// ── Skeleton block helpers ──────────────────────────────────────────────────
const Sk = {
  bar: (w = 'w-full', h = 'h-2', extra = '') => (
    <div className={cn('rounded bg-muted-foreground/15 shrink-0', w, h, extra)} />
  ),
  img: (aspect = 'aspect-video', extra = '') => (
    <div className={cn('w-full rounded bg-muted-foreground/20', aspect, extra)} />
  ),
  dot: () => <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />,
};

function SkModern() {
  return (
    <div className="p-2 space-y-2 text-[0px]">
      {/* Hero gradient strip */}
      <div className="w-full rounded-md bg-gradient-to-r from-primary/20 to-muted h-10 flex flex-col items-center justify-center gap-1 px-4">
        <div className="h-1.5 w-24 rounded bg-primary/40" />
        <div className="h-1 w-16 rounded bg-muted-foreground/20" />
      </div>
      {/* Category pills row */}
      <div className="flex gap-1">
        {['w-6','w-8','w-5','w-7'].map((w,i)=> <div key={i} className={cn('h-1.5 rounded-full bg-muted-foreground/20', w)} />)}
      </div>
      {/* Featured banner */}
      <div className="w-full h-8 rounded bg-muted-foreground/20 relative overflow-hidden">
        <div className="absolute bottom-1 left-1.5 space-y-0.5">
          <div className="h-1 w-14 rounded bg-white/40" />
          <div className="h-1 w-10 rounded bg-white/30" />
        </div>
      </div>
      {/* Grid + sidebar */}
      <div className="flex gap-1.5">
        <div className="flex-1 grid grid-cols-2 gap-1">
          {[0,1,2,3].map(i=>(
            <div key={i} className="rounded bg-muted-foreground/10 p-1 space-y-0.5">
              {Sk.img('aspect-video')}
              <div className="h-1 w-10 rounded bg-muted-foreground/20" />
              <div className="h-1 w-7 rounded bg-muted-foreground/10" />
            </div>
          ))}
        </div>
        <div className="w-8 space-y-1">
          {Sk.img('aspect-square')}
          {[0,1,2].map(i=><div key={i} className="h-1 rounded bg-muted-foreground/15 w-full" />)}
        </div>
      </div>
    </div>
  );
}

function SkMinimal() {
  return (
    <div className="p-2 space-y-2">
      {/* Big title left + text right */}
      <div className="flex items-end justify-between gap-2">
        <div className="space-y-0.5">
          <div className="h-3 w-20 rounded bg-muted-foreground/30" />
          <div className="h-1.5 w-14 rounded bg-muted-foreground/15" />
          <div className="flex gap-1 mt-1">
            <div className="h-3 w-12 rounded-full bg-muted-foreground/20" />
            <div className="h-3 w-8 rounded-full bg-primary/40" />
          </div>
        </div>
        <div className="space-y-0.5 text-right">
          <div className="h-1 w-14 rounded bg-muted-foreground/15" />
          <div className="h-1 w-10 rounded bg-muted-foreground/10" />
        </div>
      </div>
      {/* Underline tabs */}
      <div className="flex gap-3 border-b border-muted-foreground/20 pb-0.5">
        {['w-6','w-8','w-5','w-7','w-6'].map((w,i)=>(
          <div key={i} className={cn('h-1.5 rounded-sm', w, i===0 ? 'bg-foreground/60' : 'bg-muted-foreground/20')} />
        ))}
      </div>
      {/* 3-col cards */}
      <div className="grid grid-cols-3 gap-1">
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} className="space-y-0.5">
            <div className="aspect-square rounded bg-muted-foreground/15" />
            <div className="h-1 w-full rounded bg-muted-foreground/20" />
            <div className="h-1 w-8 rounded bg-muted-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkMagazine() {
  return (
    <div className="p-2 space-y-1.5">
      {/* Ticker */}
      <div className="w-full h-2.5 rounded bg-primary/30 flex items-center gap-1 px-1">
        <div className="h-1.5 w-5 rounded bg-primary/60" />
        <div className="h-1 w-16 rounded bg-white/40" />
      </div>
      {/* Hero grid: big left + 2x2 right */}
      <div className="grid grid-cols-[2fr_1fr] gap-1">
        <div className="aspect-video rounded bg-muted-foreground/20 relative overflow-hidden">
          <div className="absolute bottom-1 left-1 space-y-0.5">
            <div className="h-1 w-12 rounded bg-white/40" />
            <div className="h-1 w-8 rounded bg-white/30" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          {[0,1,2,3].map(i=>(
            <div key={i} className="aspect-square rounded bg-muted-foreground/15 relative overflow-hidden">
              <div className="absolute bottom-0.5 left-0.5 h-1 w-6 rounded bg-white/30" />
            </div>
          ))}
        </div>
      </div>
      {/* Category tab strip */}
      <div className="flex gap-2 border-b border-muted-foreground/20 pb-0.5">
        {[0,1,2,3].map(i=><div key={i} className={cn('h-1.5 rounded-sm', i===0?'w-5 bg-primary/50':'w-7 bg-muted-foreground/15')} />)}
      </div>
      {/* List + sidebar */}
      <div className="flex gap-1.5">
        <div className="flex-1 space-y-1">
          {[0,1,2].map(i=>(
            <div key={i} className="flex gap-1 items-center">
              <div className="h-5 w-7 rounded bg-muted-foreground/15 shrink-0" />
              <div className="space-y-0.5 flex-1">
                <div className="h-1 w-full rounded bg-muted-foreground/20" />
                <div className="h-1 w-10 rounded bg-muted-foreground/10" />
              </div>
            </div>
          ))}
        </div>
        <div className="w-7 space-y-0.5">
          {[0,1,2,3].map(i=><div key={i} className="h-1 rounded bg-muted-foreground/15 w-full" />)}
        </div>
      </div>
    </div>
  );
}

function SkSplit() {
  return (
    <div className="p-2 space-y-2">
      {/* Title */}
      <div className="space-y-0.5">
        <div className="h-3 w-20 rounded bg-muted-foreground/30" />
        <div className="h-1 w-14 rounded bg-muted-foreground/15" />
      </div>
      {/* Featured left + list right */}
      <div className="grid grid-cols-[3fr_2fr] gap-1.5">
        <div className="aspect-[4/3] rounded bg-muted-foreground/20 relative overflow-hidden">
          <div className="absolute bottom-1 left-1 space-y-0.5">
            <div className="h-1.5 w-14 rounded bg-white/40" />
            <div className="h-1 w-10 rounded bg-white/25" />
          </div>
        </div>
        <div className="space-y-1.5 pt-0.5">
          <div className="h-1.5 w-10 rounded bg-muted-foreground/25" />
          {[0,1,2,3].map(i=>(
            <div key={i} className="flex gap-1">
              <div className="h-4 w-5 rounded bg-muted-foreground/15 shrink-0" />
              <div className="space-y-0.5 flex-1">
                <div className="h-1 w-full rounded bg-muted-foreground/20" />
                <div className="h-1 w-6 rounded bg-muted-foreground/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Category pills */}
      <div className="flex gap-1 flex-wrap">
        {[0,1,2,3].map(i=><div key={i} className="h-2 w-7 rounded-full bg-muted-foreground/15" />)}
      </div>
      {/* 3-col grid */}
      <div className="grid grid-cols-3 gap-1">
        {[0,1,2].map(i=>(
          <div key={i} className="space-y-0.5">
            <div className="aspect-[4/3] rounded bg-muted-foreground/15" />
            <div className="h-1 w-full rounded bg-muted-foreground/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkCards() {
  return (
    <div className="space-y-0 overflow-hidden rounded-lg">
      {/* Dark header */}
      <div className="bg-foreground/80 p-2 space-y-1">
        <div className="h-1 w-8 rounded bg-white/30" />
        <div className="h-3 w-24 rounded bg-white/70" />
        <div className="h-1.5 w-16 rounded bg-white/40" />
        <div className="flex gap-1 mt-0.5">
          <div className="h-4 w-12 rounded-full bg-white/80" />
          <div className="h-4 w-12 rounded-full border border-white/30" />
        </div>
      </div>
      {/* Category strip */}
      <div className="bg-muted/50 px-2 py-1 flex gap-1.5">
        <div className="h-2 w-6 rounded bg-foreground/40" />
        {[0,1,2].map(i=><div key={i} className="h-2 w-7 rounded bg-muted-foreground/20" />)}
      </div>
      {/* Masonry-like columns */}
      <div className="p-1.5 grid grid-cols-3 gap-1 items-start">
        <div className="space-y-1">
          <div className="h-10 rounded bg-muted-foreground/20" />
          <div className="h-1 w-full rounded bg-muted-foreground/20" />
          <div className="h-1 w-8 rounded bg-muted-foreground/10" />
        </div>
        <div className="space-y-1 mt-3">
          <div className="h-7 rounded bg-muted-foreground/15" />
          <div className="h-1 w-full rounded bg-muted-foreground/20" />
        </div>
        <div className="space-y-1">
          <div className="h-12 rounded bg-muted-foreground/20" />
          <div className="h-1 w-full rounded bg-muted-foreground/20" />
          <div className="h-1 w-6 rounded bg-muted-foreground/10" />
        </div>
      </div>
    </div>
  );
}

const LAYOUT_OPTIONS = [
  { id: 'modern',   label: 'Modern',   desc: 'Gradient hero, card grid + sidebar',       Skeleton: SkModern   },
  { id: 'minimal',  label: 'Minimal',  desc: 'Bold title, underline tabs, clean grid',   Skeleton: SkMinimal  },
  { id: 'magazine', label: 'Magazine', desc: 'Ticker, big/small hero grid, list feed',   Skeleton: SkMagazine },
  { id: 'split',    label: 'Split',    desc: 'Featured + list top, 3-col grid below',    Skeleton: SkSplit    },
  { id: 'cards',    label: 'Cards',    desc: 'Dark header, masonry card grid',            Skeleton: SkCards    },
] as const;

export default function SettingsPage() {
  const { toast } = useToast();
  const { activeColor, setColor } = useTheme();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState({
    siteName: '',
    siteDescription: '',
    logo: '',
    autoEmailNewPosts: false,
    socialLinks: { twitter: '', instagram: '', facebook: '', linkedin: '', github: '' },
    homepage: {
      heroTitle: '',
      heroSubtitle: '',
      heroCtaText: '',
      heroCtaUrl: '',
      showFeaturedPost: true,
      showNewsletter: true,
    },
    homepageLayout: 'modern',
    seo: {
      siteUrl: '',
      metaTitleTemplate: '%post_title% | %site_name%',
      defaultMetaDescription: '',
      defaultOgImage: '',
      robotsConfig: 'User-agent: *\nAllow: /\nDisallow: /dashboard/',
      googleVerification: '',
      bingVerification: '',
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      setSettings(s);
      setForm({
        siteName: s.siteName,
        siteDescription: s.siteDescription,
        logo: s.logo,
        autoEmailNewPosts: s.autoEmailNewPosts,
        socialLinks: { ...s.socialLinks },
        homepage: {
          heroTitle: s.homepage?.heroTitle || '',
          heroSubtitle: s.homepage?.heroSubtitle || '',
          heroCtaText: s.homepage?.heroCtaText || '',
          heroCtaUrl: s.homepage?.heroCtaUrl || '',
          showFeaturedPost: s.homepage?.showFeaturedPost ?? true,
          showNewsletter: s.homepage?.showNewsletter ?? true,
        },
        homepageLayout: s.homepageLayout || 'modern',
        seo: {
          siteUrl: s.seo?.siteUrl || '',
          metaTitleTemplate: s.seo?.metaTitleTemplate || '%post_title% | %site_name%',
          defaultMetaDescription: s.seo?.defaultMetaDescription || '',
          defaultOgImage: s.seo?.defaultOgImage || '',
          robotsConfig: s.seo?.robotsConfig || 'User-agent: *\nAllow: /\nDisallow: /dashboard/',
          googleVerification: s.seo?.googleVerification || '',
          bingVerification: s.seo?.bingVerification || '',
        },
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsService.updateSettings(form);
      setSettings(updated);
      toast({ title: 'Settings saved' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const setSocial = (key: string, value: string) =>
    setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: value } }));
  const setHp = (key: string, value: any) =>
    setForm((p) => ({ ...p, homepage: { ...p.homepage, [key]: value } }));
  const setSeo = (key: string, value: string) =>
    setForm((p) => ({ ...p, seo: { ...p.seo, [key]: value } }));

  if (!settings) return <p className="text-center py-20 text-muted-foreground">Loading settings...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 auto-rows-min">

        {/* Theme Color — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />Theme Color
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a primary color for buttons, links, and accents across the entire site.
            </p>
            <div className="grid grid-cols-5 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => { setColor(color); settingsService.updateSettings({ themeColor: color.name }).catch(() => {}); }}
                  title={color.label}
                  className={cn(
                    'relative h-10 w-full rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
                    activeColor.name === color.name
                      ? 'border-foreground scale-110 shadow-md'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {activeColor.name === color.name && (
                    <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => { setColor(color); settingsService.updateSettings({ themeColor: color.name }).catch(() => {}); }}
                  className={cn(
                    'text-xs px-3 py-1 rounded-full border transition-colors',
                    activeColor.name === color.name
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {color.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
              <div className="h-8 w-8 rounded-md shrink-0" style={{ backgroundColor: activeColor.hex }} />
              <div>
                <p className="text-sm font-medium">Current: {activeColor.label}</p>
                <p className="text-xs text-muted-foreground">Saved to database. Changes apply instantly across all devices and visitors.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding — 1 col */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Site Name</Label>
              <Input value={form.siteName} onChange={(e) => set('siteName', e.target.value)} placeholder="My Blog" />
            </div>
            <div className="space-y-1.5">
              <Label>Site Description</Label>
              <Input value={form.siteDescription} onChange={(e) => set('siteDescription', e.target.value)} placeholder="A modern blog platform" />
            </div>
            <div className="space-y-1.5">
              <Label>Logo URL</Label>
              <Input value={form.logo} onChange={(e) => set('logo', e.target.value)} placeholder="https://example.com/logo.png" />
              {form.logo && (
                <img src={form.logo} alt="logo preview" className="h-12 mt-2 rounded object-contain border p-1"
                  onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email — 1 col */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Email Automation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium text-sm">Auto-email new posts to subscribers</p>
                <p className="text-xs text-muted-foreground mt-0.5">Automatically send an email when a new post is published.</p>
              </div>
              <Switch checked={form.autoEmailNewPosts} onCheckedChange={(v) => set('autoEmailNewPosts', v)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Requires SMTP credentials in the backend <code className="bg-muted px-1 rounded">.env</code> file.
            </p>
          </CardContent>
        </Card>

        {/* AI Features — 1 col */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />AI Features</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                { label: 'Schedule posts', desc: 'Set a future publish date when creating a post.' },
                { label: 'Auto-email new posts', desc: 'Toggle above. Sends to all subscribers automatically on publish.' },
                { label: 'Generate weekly content ideas', desc: 'Use the AI Assistant — ask "Give me 7 blog post ideas for this week".' },
                { label: 'Auto-share to social media', desc: 'Coming soon. Requires social API keys.' },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social — 1 col (moved up before full-width cards) */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" />Social Links</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(['twitter', 'instagram', 'facebook', 'linkedin', 'github'] as const).map((key) => (
              <div key={key} className="space-y-1.5">
                <Label className="capitalize">{key}</Label>
                <Input value={form.socialLinks[key]} onChange={(e) => setSocial(key, e.target.value)} placeholder={`https://${key}.com/yourhandle`} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Landing Page Style — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5" />Landing Page Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose the visual style of your public homepage. Click a preview to select it, then save.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LAYOUT_OPTIONS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => set('homepageLayout', layout.id)}
                  className={cn(
                    'group relative text-left rounded-xl border-2 p-3 transition-all focus:outline-none',
                    form.homepageLayout === layout.id
                      ? 'border-primary shadow-md shadow-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {/* Selected badge */}
                  {form.homepageLayout === layout.id && (
                    <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
                      <Check className="h-2.5 w-2.5" /> Active
                    </span>
                  )}

                  {/* Skeleton preview */}
                  <div className={cn(
                    'w-full rounded-lg overflow-hidden border border-border mb-3 bg-muted/30',
                    form.homepageLayout === layout.id ? 'ring-2 ring-primary/20' : ''
                  )}>
                    <layout.Skeleton />
                  </div>

                  <p className="font-semibold text-sm">{layout.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{layout.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Global SEO — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Global SEO Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label>Site URL</Label>
                <Input value={form.seo.siteUrl} onChange={(e) => setSeo('siteUrl', e.target.value)} placeholder="https://yourblog.com" />
                <p className="text-xs text-muted-foreground">Used to generate sitemap and canonical URLs.</p>
              </div>
              <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
                <Label>Meta Title Template</Label>
                <Input value={form.seo.metaTitleTemplate} onChange={(e) => setSeo('metaTitleTemplate', e.target.value)} placeholder="%post_title% | %site_name%" />
                <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">%post_title%</code> and <code className="bg-muted px-1 rounded">%site_name%</code> as variables.</p>
              </div>
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label>Default Meta Description</Label>
                <Input value={form.seo.defaultMetaDescription} onChange={(e) => setSeo('defaultMetaDescription', e.target.value)} placeholder="Fallback description for pages without one set" />
                <p className="text-xs text-muted-foreground">Used on the homepage and any post that doesn't have a custom meta description.</p>
              </div>
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label>Default Open Graph Image URL</Label>
                <Input value={form.seo.defaultOgImage} onChange={(e) => setSeo('defaultOgImage', e.target.value)} placeholder="https://yourblog.com/og-default.jpg (1200×630)" />
                {form.seo.defaultOgImage && (
                  <img src={form.seo.defaultOgImage} alt="OG preview" className="h-24 w-full max-w-sm object-cover rounded border mt-1"
                    onError={(e) => (e.currentTarget.style.display = 'none')} />
                )}
                <p className="text-xs text-muted-foreground">Shown when sharing pages that have no custom OG image.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Google Search Console Verification</Label>
                <Input value={form.seo.googleVerification} onChange={(e) => setSeo('googleVerification', e.target.value)} placeholder="Verification code from Google" />
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                  <ExternalLink className="h-3 w-3" /> Open Search Console
                </a>
              </div>
              <div className="space-y-1.5">
                <Label>Bing Webmaster Verification</Label>
                <Input value={form.seo.bingVerification} onChange={(e) => setSeo('bingVerification', e.target.value)} placeholder="Verification code from Bing" />
                <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                  <ExternalLink className="h-3 w-3" /> Open Bing Webmaster Tools
                </a>
              </div>
              <div className="space-y-1.5">
                <Label>Sitemap &amp; Robots</Label>
                <div className="flex flex-col gap-2">
                  <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> View sitemap.xml
                  </a>
                  <a href="/robots.txt" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> View robots.txt
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">Auto-generated from your posts and site URL above.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Homepage Layout — 1 col beside Landing Page Style */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5" />Homepage Layout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Customize the hero section and layout of your public homepage. Changes save when you click <strong>Save All</strong>.</p>
            <div className="space-y-1.5">
              <Label>Hero Headline</Label>
              <Input value={form.homepage.heroTitle} onChange={(e) => setHp('heroTitle', e.target.value)} placeholder="Welcome to Our Blog" />
            </div>
            <div className="space-y-1.5">
              <Label>Hero Subtitle</Label>
              <Input value={form.homepage.heroSubtitle} onChange={(e) => setHp('heroSubtitle', e.target.value)} placeholder="Discover stories, tips, and insights from our writers." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>CTA Button Text</Label>
                <Input value={form.homepage.heroCtaText} onChange={(e) => setHp('heroCtaText', e.target.value)} placeholder="Start Reading" />
              </div>
              <div className="space-y-1.5">
                <Label>CTA Button URL</Label>
                <Input value={form.homepage.heroCtaUrl} onChange={(e) => setHp('heroCtaUrl', e.target.value)} placeholder="/blog" />
              </div>
            </div>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">Show Featured Post</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Display the latest post as a banner at the top of the homepage.</p>
                </div>
                <Switch checked={form.homepage.showFeaturedPost} onCheckedChange={(v) => setHp('showFeaturedPost', v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">Show Newsletter Subscribe Box</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Show an email subscription form in the homepage sidebar.</p>
                </div>
                <Switch checked={form.homepage.showNewsletter} onCheckedChange={(v) => setHp('showNewsletter', v)} />
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
