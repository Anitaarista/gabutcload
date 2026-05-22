import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const file = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!file) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  if (body?.action === 'rename' && typeof body.name === 'string' && body.name.trim()) {
    const updated = await prisma.file.update({ where: { id }, data: { name: body.name.trim() } });
    return NextResponse.json({ file: updated });
  }

  if (body?.action === 'toggleStar') {
    const updated = await prisma.file.update({ where: { id }, data: { starred: !file.starred } });
    return NextResponse.json({ file: updated });
  }

  if (body?.action === 'trash') {
    const updated = await prisma.file.update({ where: { id }, data: { isTrashed: true, trashedAt: new Date() } });
    return NextResponse.json({ file: updated });
  }

  if (body?.action === 'lock') {
    const updated = await prisma.file.update({ where: { id }, data: { locked: !file.locked } });
    return NextResponse.json({ file: updated });
  }

  if (body?.action === 'move' && typeof body.parentId === 'string') {
    const updated = await prisma.file.update({ where: { id }, data: { parentId: body.parentId || null } });
    return NextResponse.json({ file: updated });
  }

  return NextResponse.json({ message: 'Unsupported action' }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const file = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!file) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  await prisma.file.update({ where: { id }, data: { isTrashed: true, trashedAt: new Date() } });
  return NextResponse.json({ ok: true });
}