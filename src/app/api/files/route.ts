import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureUploadDir } from '@/lib/storage';
import { listFiles } from '@/lib/queries';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const parentId = url.searchParams.get('parentId');
  const search = url.searchParams.get('q') ?? '';

  const files = await listFiles(session.user.id, parentId, search);
  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.type) {
    return NextResponse.json({ message: 'Name and type are required' }, { status: 400 });
  }

  const file = await prisma.file.create({
    data: {
      name: body.name,
      type: body.type,
      ownerId: session.user.id,
      parentId: body.parentId ?? null,
      isFolder: body.type === 'folder',
      size: body.size ?? 0,
      mimeType: body.mimeType ?? ''
    }
  });

  if (body.type !== 'folder') {
    await ensureUploadDir();
  }

  return NextResponse.json({ file });
}