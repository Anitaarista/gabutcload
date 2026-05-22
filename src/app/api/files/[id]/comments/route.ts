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
  const text = String(body?.text ?? '').trim();

  if (!text) {
    return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
  }

  const file = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!file) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      text,
      fileId: id,
      authorId: session.user.id
    }
  });

  return NextResponse.json({ comment });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const url = new URL(request.url);
  const commentId = url.searchParams.get('commentId');

  if (!commentId) {
    return NextResponse.json({ message: 'commentId is required' }, { status: 400 });
  }

  const file = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!file) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  await prisma.comment.deleteMany({ where: { id: commentId, fileId: id } });
  return NextResponse.json({ ok: true });
}