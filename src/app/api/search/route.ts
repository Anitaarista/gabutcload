import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listFiles } from '@/lib/queries';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';

  const files = await listFiles(session.user.id, null, query);
  return NextResponse.json({ files });
}