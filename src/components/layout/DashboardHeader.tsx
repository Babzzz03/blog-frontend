'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, PenSquare, LogOut, Sparkles, RefreshCw } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/ai.service';

function useCountdown(resetAt: string | null) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!resetAt) return;
    const update = () => {
      const diff = new Date(resetAt).getTime() - Date.now();
      if (diff <= 0) { setLabel('resetting…'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setLabel(`${h}h ${m}m`);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [resetAt]);
  return label;
}

function GeminiUsageWidget() {
  const [usage, setUsage] = useState<{ requestCount: number; totalTokens: number; dailyLimit: number; resetAt: string } | null>(null);
  const countdown = useCountdown(usage?.resetAt ?? null);

  useEffect(() => {
    aiService.getUsage().then(setUsage).catch(() => {});
  }, []);

  if (!usage) return null;

  const pct = Math.min((usage.requestCount / usage.dailyLimit) * 100, 100);
  const color = pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-yellow-500' : 'bg-primary';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/40 cursor-default select-none">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-[80px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-muted-foreground leading-none">Gemini</span>
                <span className="text-[10px] font-semibold leading-none">{usage.requestCount}<span className="font-normal text-muted-foreground">/{usage.dailyLimit}</span></span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs space-y-1">
          <p className="font-semibold">Gemini 2.5 Flash — Daily Usage</p>
          <p>{usage.requestCount} / {usage.dailyLimit} requests used today</p>
          <p>{usage.totalTokens.toLocaleString()} tokens generated</p>
          <p className="flex items-center gap-1 text-muted-foreground">
            <RefreshCw className="h-3 w-3" /> Resets in {countdown}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const mainNavItems = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Categories', href: '/categories' },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signout } = useAuth();
  const { toast } = useToast();

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + arr.slice(0, index + 1).join('/'),
    }));

  const handleSignout = async () => {
    await signout();
    toast({ title: 'Signed out' });
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <Link
                  href={crumb.href}
                  className={index === breadcrumbs.length - 1 ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}
                >
                  {crumb.name}
                </Link>
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <nav className="hidden md:flex items-center space-x-3">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {user?.isAdmin && <GeminiUsageWidget />}

          <Button asChild variant="default" size="sm" className="hidden md:inline-flex">
            <Link href="/dashboard/posts/create">
              <PenSquare className="mr-2 h-4 w-4" /> New Post
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profilePicture} alt={user?.username} />
                  <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignout}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
