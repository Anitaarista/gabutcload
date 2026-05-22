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
  const name = String(body?.name ?? '').trim();

  if (!name) {
    return NextResponse.json({ message: 'Tag name is required' }, { status: 400 });
  }

  const file = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!file) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const tag = await prisma.tag.create({
    data: {
      name,
      fileId: id
    }
  });

  return NextResponse.json({ tag });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const url = new URL(request.url);
  const tagId = url.searchParams.get('tagId');

  if (!tagId) {
    return NextResponse.json({ message: 'tagId is required' }, { status: 400 });
  }

  const file = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!file) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  await prisma.tag.deleteMany({ where: { id: tagId, fileId: id } });
  return NextResponse.json({ ok: true });
}