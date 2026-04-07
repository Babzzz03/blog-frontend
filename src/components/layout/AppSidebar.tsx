'use client';

import * as React from 'react';
import {
  GalleryVerticalEnd, Sparkles, Users, Mail, BarChart2,
  FileText, FolderOpen, Settings, LayoutDashboard, CalendarDays, DollarSign,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub,
  SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';

const navItems = [
  {
    title: 'Overview',
    url: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: 'Posts',
    url: '#',
    icon: <FileText className="h-4 w-4" />,
    items: [
      { title: 'All Posts', url: '/dashboard/posts' },
      { title: 'Create Post', url: '/dashboard/posts/create' },
    ],
  },
  {
    title: 'Content',
    url: '#',
    icon: <FolderOpen className="h-4 w-4" />,
    items: [
      { title: 'Categories', url: '/dashboard/categories' },
      { title: 'Comments', url: '/dashboard/comments' },
    ],
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: 'Subscribers',
    url: '/dashboard/subscribers',
    icon: <Mail className="h-4 w-4" />,
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    title: 'Monetization',
    url: '/dashboard/monetization',
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    title: 'Content Calendar',
    url: '/dashboard/calendar',
    icon: <CalendarDays className="h-4 w-4" />,
  },
  {
    title: 'AI Assistant',
    url: '/dashboard/ai',
    icon: <Sparkles className="h-4 w-4 text-primary" />,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Blog Dashboard</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    pathname === item.url
                      ? 'bg-primary/20 text-primary border-l-4 border-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  <Link href={item.url} className="font-medium flex items-center gap-2">
                    {item.icon}
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((sub) => (
                      <SidebarMenuSubItem key={sub.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            pathname === sub.url
                              ? 'bg-primary/20 text-primary border-l-4 border-primary'
                              : 'hover:bg-muted'
                          )}
                        >
                          <Link href={sub.url}>{sub.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Card>
          <CardHeader className="text-sm font-medium pb-2">Ready to write?</CardHeader>
          <div className="px-4 pb-4">
            <Button className="w-full" asChild>
              <Link href="/dashboard/posts/create">Create Post</Link>
            </Button>
          </div>
        </Card>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
