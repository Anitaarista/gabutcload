import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { bytesToHuman } from '@/lib/storage';

export default async function WorkspacesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const members = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: { workspace: true }
  });

  return (
    <section className="space-y-6 p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>Team spaces, roles, and storage allocation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {members.map((member) => (
            <div key={member.id} className="rounded-xl border border-border bg-tertiary/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{member.workspace.name}</p>
                  <p className="text-sm text-muted">{member.workspace.description ?? 'No description'}</p>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-xs uppercase text-muted">{member.role}</span>
              </div>
              <p className="mt-4 text-sm text-muted">Storage used: {bytesToHuman(member.workspace.storageUsed)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}