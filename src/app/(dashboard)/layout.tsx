import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRootFolders } from '@/lib/queries';
import { DashboardShell } from '@/components/dashboard/shell';

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      avatar: true,
      plan: true,
      storageUsed: true,
      storageTotal: true
    }
  });

  if (!user) {
    redirect('/login');
  }

  const pinnedFolders = await getRootFolders(session.user.id);

  return (
    <DashboardShell
      user={{
        ...user,
        storageTotal: Number(user.storageTotal)
      }}
      pinnedFolders={pinnedFolders.slice(0, 4).map((folder) => ({ id: folder.id, name: folder.name }))}
    >
      {children}
    </DashboardShell>
  );
}