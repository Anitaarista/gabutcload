import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const activities = await prisma.activity.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { file: true },
    take: 25
  });

  return (
    <section className="space-y-6 p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity log</CardTitle>
          <CardDescription>File operations, shares, and workspace events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="rounded-xl border border-border bg-tertiary/40 p-4">
              <p className="font-medium capitalize">{activity.action}</p>
              <p className="text-sm text-muted">
                {activity.file?.name ?? 'System'} · {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}