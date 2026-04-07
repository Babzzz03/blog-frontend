import { AppSidebar } from '@/components/layout/AppSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import AdminGuard from '@/components/dashboard/AdminGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
        </SidebarInset>
        <div className="fixed right-4 bottom-8 md:hidden">
          <Button asChild variant="default" size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Link href="/dashboard/posts/create">
              <Plus className="h-6 w-6" />
              <span className="sr-only">New Post</span>
            </Link>
          </Button>
        </div>
      </SidebarProvider>
    </AdminGuard>
  );
}
