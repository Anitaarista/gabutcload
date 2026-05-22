import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';
import archiver from 'archiver';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fileStoragePath } from '@/lib/storage';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

async function collectFolderFiles(folderId: string, ownerId: string, currentPath = ''): Promise<Array<{ id: string; name: string; path: string; isFolder: boolean }>> {
  const children = await prisma.file.findMany({ where: { parentId: folderId, ownerId, isTrashed: false } });
  const collected: Array<{ id: string; name: string; path: string; isFolder: boolean }> = [];

  for (const child of children) {
    const childPath = path.posix.join(currentPath, child.name);
    collected.push({ id: child.id, name: child.name, path: childPath, isFolder: child.isFolder });

    if (child.isFolder) {
      const nested = await collectFolderFiles(child.id, ownerId, childPath);
      collected.push(...nested);
    }
  }

  return collected;
}

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const file = await prisma.file.findFirst({ where: { id, ownerId: session.user.id, isTrashed: false } });
  if (!file) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  if (!file.isFolder) {
    const storagePath = fileStoragePath(file.id, file.name);
    if (!fs.existsSync(storagePath)) {
      return NextResponse.json({ message: 'File not available on disk yet' }, { status: 404 });
    }

    const stream = fs.createReadStream(storagePath);
    return new NextResponse(stream as never, {
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`
      }
    });
  }

  const archive = archiver('zip', { zlib: { level: 9 } });
  const body = new PassThrough();
  archive.pipe(body);

  const entries = await collectFolderFiles(file.id, session.user.id, file.name);
  for (const entry of entries) {
    if (entry.isFolder) {
      archive.append('', { name: `${entry.path}/` });
      continue;
    }

    const childFile = await prisma.file.findFirst({ where: { id: entry.id, ownerId: session.user.id } });
    if (!childFile) continue;

    const storagePath = fileStoragePath(childFile.id, childFile.name);
    if (fs.existsSync(storagePath)) {
      archive.file(storagePath, { name: entry.path });
    }
  }

  void archive.finalize();

  return new NextResponse(body as never, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}.zip"`
    }
  });
}