import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ArrowUpRight, FileText, FolderOpen, ShieldCheck, Star } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { bytesToHuman } from '@/lib/storage';
import { getDashboardStats, getRecentFiles, getRootFolders } from '@/lib/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [stats, files, folders] = await Promise.all([
    getDashboardStats(session.user.id),
    getRecentFiles(session.user.id),
    getRootFolders(session.user.id)
  ]);

  return (
    <main className="min-h-screen p-6 lg:p-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-xl border border-border bg-secondary/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge className="border-[#00e5c3]/20 bg-[#00e5c3]/10 text-[#00e5c3]">Online workspace</Badge>
              <h1 className="font-heading mt-3 text-4xl tracking-tight">CloudVault Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Secure storage, vault isolation, and workspace-driven file management built for fast navigation.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary">
                <Link href="/dashboard/files">Open File Manager</Link>
              </Button>
              <Button>
                <Link href="/dashboard/insights">Storage Insights</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Files', value: stats.files, icon: FileText },
            { label: 'Folders', value: stats.folders, icon: FolderOpen },
            { label: 'Starred', value: stats.starred, icon: Star },
            { label: 'Activity', value: stats.activities, icon: ShieldCheck }
          ].map((item) => (
            <Card key={item.label} className="overflow-hidden">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-muted">{item.label}</p>
                  <div className="mt-2 text-3xl font-semibold">{item.value}</div>
                </div>
                <div className="rounded-2xl border border-[#00e5c3]/15 bg-[#00e5c3]/10 p-3 text-[#00e5c3]">
                  <item.icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Recent files</CardTitle>
              <CardDescription>Latest updates from your vault and shared workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-xl border border-border bg-tertiary/50 p-4">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted">{file.type} · {bytesToHuman(file.size)}</p>
                  </div>
                  <Badge className="border-white/10 bg-white/5 capitalize">{file.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pinned folders</CardTitle>
              <CardDescription>Jump into the highest-value collections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {folders.map((folder) => (
                <Link key={folder.id} href={`/dashboard/files?folder=${folder.id}`} className="flex items-center justify-between rounded-xl border border-border bg-tertiary/50 p-4 transition hover:bg-tertiary">
                  <div>
                    <p className="font-medium">{folder.name}</p>
                    <p className="text-sm text-muted">Open folder</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#00e5c3]" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        <Separator />
        <p className="text-sm text-muted">
          Storage used: {bytesToHuman(stats.storageUsed)} of {bytesToHuman(10 * 1024 * 1024 * 1024)}.
        </p>
      </section>
    </main>
  );
}