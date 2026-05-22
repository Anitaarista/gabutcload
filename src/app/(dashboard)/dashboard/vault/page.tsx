import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function VaultPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const vaultFiles = await prisma.file.findMany({
    where: { ownerId: session.user.id, isTrashed: false, isVault: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <section className="space-y-6 p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Private vault</CardTitle>
          <CardDescription>Encrypted files isolated behind your PIN.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {vaultFiles.length ? vaultFiles.map((file) => (
            <div key={file.id} className="rounded-xl border border-border bg-tertiary/40 p-4">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted">Encrypted: {file.encrypted ? 'Yes' : 'No'} · Locked: {file.locked ? 'Yes' : 'No'}</p>
            </div>
          )) : <p className="text-sm text-muted">No vault files have been marked yet.</p>}
        </CardContent>
      </Card>
    </section>
  );
}