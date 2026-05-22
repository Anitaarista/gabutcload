'use client';

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronRight, LayoutGrid, Settings2, Shield, Star, UploadCloud, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatBytes } from '@/lib/utils';

type DashboardShellProps = {
  user: {
    name: string;
    email: string;
    avatar: string;
    plan: string;
    storageUsed: number;
    storageTotal: number;
  };
  pinnedFolders: Array<{ id: string; name: string }>;
  children: React.ReactNode;
};

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { href: '/dashboard/files', label: 'Files', icon: FolderOpen },
  { href: '/dashboard/insights', label: 'Insights', icon: Star },
  { href: '/dashboard/workspaces', label: 'Workspaces', icon: Shield }
];

export function DashboardShell({ user, pinnedFolders, children }: DashboardShellProps) {
  const pathname = usePathname();
  const usage = Math.min(100, Math.round((user.storageUsed / user.storageTotal) * 100));

  return (
    <div className="grid min-h-screen bg-transparent xl:grid-cols-[288px_1fr]">
      <aside className="hidden border-r border-border bg-secondary/70 p-5 backdrop-blur-xl xl:flex xl:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00e5c3] to-[#00b4d8] text-[#0a0e17] font-heading text-lg font-bold">
            CV
          </div>
          <div>
            <p className="font-heading text-xl">CloudVault</p>
            <p className="text-xs text-muted">Secure storage platform</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition',
                  active
                    ? 'border-[#00e5c3]/30 bg-[#00e5c3]/10 text-[#00e5c3]'
                    : 'border-transparent bg-transparent text-foreground hover:border-border hover:bg-tertiary'
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted">Storage</span>
            <span className="text-foreground">{usage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-tertiary">
            <div className="h-full rounded-full bg-gradient-to-r from-[#00e5c3] to-[#00b4d8]" style={{ width: `${usage}%` }} />
          </div>
          <p className="mt-3 text-xs text-muted">
            {formatBytes(user.storageUsed)} used of {formatBytes(user.storageTotal)}
          </p>
        </div>

        <Separator className="my-6 bg-border/70" />

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Pinned folders</p>
          {pinnedFolders.map((folder) => (
            <Link key={folder.id} href={`/dashboard/files?folder=${folder.id}`} className="flex items-center justify-between rounded-xl border border-border bg-tertiary/50 px-4 py-3 text-sm transition hover:bg-tertiary">
              <span className="truncate">{folder.name}</span>
              <FolderOpen className="h-4 w-4 text-[#00e5c3]" />
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <Card className="border-border/70 bg-tertiary/40 p-4">
            <div className="flex items-center gap-3">
              <Image src={user.avatar} alt={user.name} width={44} height={44} className="h-11 w-11 rounded-full border border-border object-cover" />
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge className="border-white/10 bg-white/5 capitalize">{user.plan}</Badge>
              <Button size="sm" variant="ghost">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">CloudVault</p>
              <h2 className="font-heading text-2xl">Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <UploadCloud className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}