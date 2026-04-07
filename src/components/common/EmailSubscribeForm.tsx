'use client';

import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { subscriberService } from '@/services/subscriber.service';
import { cn } from '@/lib/utils';

interface Props {
  source?: string;
  className?: string;
  compact?: boolean;
}

export default function EmailSubscribeForm({ source = 'website', className, compact = false }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await subscriberService.subscribe(email, name, source);
      setSuccess(res.message);
      setEmail('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={cn('flex items-center gap-2 text-green-600', className)}>
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{success}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
        <Input
          type="email"
          placeholder={t('subscribe.placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading} size="sm">
          {loading ? t('subscribe.subscribing') : t('subscribe.btn')}
        </Button>
      </form>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-muted/40 p-6', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">{t('subscribe.title')}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t('subscribe.subtitle')}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder={t('auth.username')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder={t('subscribe.placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          <Mail className="h-4 w-4 mr-2" />
          {loading ? t('subscribe.subscribing') : t('subscribe.btn')}
        </Button>
      </form>
    </div>
  );
}
