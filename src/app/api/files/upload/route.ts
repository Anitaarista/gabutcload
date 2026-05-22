import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureUploadDir, fileStoragePath } from '@/lib/storage';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const parentId = formData.get('parentId');
  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);

  if (!files.length) {
    return NextResponse.json({ message: 'No files provided' }, { status: 400 });
  }

  await ensureUploadDir();

  const created = [];
  for (const upload of files) {
    const bytes = Buffer.from(await upload.arrayBuffer());
    const record = await prisma.file.create({
      data: {
        name: upload.name,
        type: upload.type.includes('image') ? 'image' : upload.type.includes('video') ? 'video' : upload.type.includes('pdf') ? 'pdf' : 'document',
        mimeType: upload.type,
        size: upload.size,
        ownerId: session.user.id,
        parentId: typeof parentId === 'string' && parentId.length ? parentId : null,
        thumbnail: upload.type.startsWith('image/') ? `/uploads/${upload.name}` : null
      }
    });

    const storagePath = fileStoragePath(record.id, upload.name);
    await fs.writeFile(storagePath, bytes);

    created.push(record);
  }

  return NextResponse.json({ files: created });
}