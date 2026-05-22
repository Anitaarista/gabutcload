import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const file = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!file) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const share = await prisma.share.create({
    data: {
      fileId: id,
      shareLink: `share-${id}`,
      linkPassword: body?.linkPassword ? String(body.linkPassword) : null,
      linkExpiresAt: body?.linkExpiresAt ? new Date(body.linkExpiresAt) : null,
      downloadLimit: body?.downloadLimit ? Number(body.downloadLimit) : null,
      sharedWithId: body?.sharedWithId ? String(body.sharedWithId) : null,
      role: body?.role ? String(body.role) : 'viewer'
    }
  });

  return NextResponse.json({ share });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const url = new URL(request.url);
  const shareId = url.searchParams.get('shareId');

  if (!shareId) {
    return NextResponse.json({ message: 'shareId is required' }, { status: 400 });
  }

  const file = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!file) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  await prisma.share.deleteMany({ where: { id: shareId, fileId: id } });
  return NextResponse.json({ ok: true });
}