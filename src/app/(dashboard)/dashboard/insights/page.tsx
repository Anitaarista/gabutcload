import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { bytesToHuman } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StorageDonut } from '@/components/dashboard/storage-donut';

export default async function InsightsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const files = await prisma.file.findMany({
    where: { ownerId: session.user.id, isTrashed: false, isFolder: false },
    orderBy: { size: 'desc' }
  });

  const grouped = files.reduce<Record<string, number>>((accumulator, file) => {
    accumulator[file.type] = (accumulator[file.type] ?? 0) + file.size;
    return accumulator;
  }, {});

  const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }));
  const largeFiles = files.slice(0, 8);
  const duplicates = Object.values(
    files.reduce<Record<string, typeof files>>((accumulator, file) => {
      const key = `${file.name}-${file.size}`;
      accumulator[key] = accumulator[key] ?? [];
      accumulator[key].push(file);
      return accumulator;
    }, {})
  ).filter((group) => group.length > 1);

  const storageUsed = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <section className="space-y-6 p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Storage insights</CardTitle>
          <CardDescription>Type distribution, largest files, and duplicate detection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <StorageDonut data={chartData.length ? chartData : [{ name: 'empty', value: 1 }]} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-tertiary/40"><CardContent className="p-4"><p className="text-sm text-muted">Storage used</p><p className="mt-2 text-3xl font-semibold">{bytesToHuman(storageUsed)}</p></CardContent></Card>
              <Card className="bg-tertiary/40"><CardContent className="p-4"><p className="text-sm text-muted">File count</p><p className="mt-2 text-3xl font-semibold">{files.length}</p></CardContent></Card>
              <Card className="bg-tertiary/40"><CardContent className="p-4"><p className="text-sm text-muted">Largest file</p><p className="mt-2 text-lg font-medium">{largeFiles[0]?.name ?? 'No files'}</p></CardContent></Card>
              <Card className="bg-tertiary/40"><CardContent className="p-4"><p className="text-sm text-muted">Duplicate groups</p><p className="mt-2 text-3xl font-semibold">{duplicates.length}</p></CardContent></Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Largest files</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {largeFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded-xl border border-border bg-tertiary/50 p-4">
                <span>{file.name}</span>
                <span className="text-muted">{bytesToHuman(file.size)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Duplicate finder</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {duplicates.length ? duplicates.map((group) => (
              <div key={group[0].id} className="rounded-xl border border-border bg-tertiary/50 p-4">
                <p className="font-medium">{group[0].name}</p>
                <p className="text-sm text-muted">{group.length} duplicates · {bytesToHuman(group[0].size)} each</p>
              </div>
            )) : <p className="text-sm text-muted">No duplicates found.</p>}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}