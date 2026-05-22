import { prisma } from '@/lib/prisma';

export async function getDashboardStats(userId: string) {
  const [files, folders, storage, starred, activities] = await Promise.all([
    prisma.file.count({ where: { ownerId: userId, isTrashed: false, isFolder: false } }),
    prisma.file.count({ where: { ownerId: userId, isTrashed: false, isFolder: true } }),
    prisma.file.aggregate({ where: { ownerId: userId, isTrashed: false }, _sum: { size: true } }),
    prisma.file.count({ where: { ownerId: userId, isTrashed: false, starred: true } }),
    prisma.activity.count({ where: { userId } })
  ]);

  return {
    files,
    folders,
    starred,
    activities,
    storageUsed: storage._sum.size ?? 0
  };
}

export async function getRecentFiles(userId: string) {
  return prisma.file.findMany({
    where: { ownerId: userId, isTrashed: false },
    orderBy: { updatedAt: 'desc' },
    take: 8,
    include: {
      tags: true,
      workspace: true
    }
  });
}

export async function getRootFolders(userId: string) {
  return prisma.file.findMany({
    where: { ownerId: userId, isTrashed: false, isFolder: true, parentId: null },
    orderBy: { name: 'asc' }
  });
}

export async function getFolderById(userId: string, folderId: string) {
  return prisma.file.findFirst({
    where: { id: folderId, ownerId: userId, isFolder: true, isTrashed: false }
  });
}

export async function getBreadcrumbs(userId: string, folderId: string | null) {
  if (!folderId) return [];

  const breadcrumbs: Array<{ id: string; name: string }> = [];
  let current: { id: string; name: string; parentId: string | null } | null = await prisma.file.findFirst({
    where: { id: folderId, ownerId: userId, isFolder: true, isTrashed: false },
    select: { id: true, name: true, parentId: true }
  });

  while (current) {
    breadcrumbs.unshift({ id: current.id, name: current.name });
    if (!current.parentId) break;

    current = await prisma.file.findFirst({
      where: { id: current.parentId, ownerId: userId, isFolder: true, isTrashed: false },
      select: { id: true, name: true, parentId: true }
    });
  }

  return breadcrumbs;
}

export async function listFiles(userId: string, parentId: string | null, search?: string) {
  return prisma.file.findMany({
    where: {
      ownerId: userId,
      isTrashed: false,
      parentId,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {})
    },
    orderBy: [{ isFolder: 'desc' }, { starred: 'desc' }, { updatedAt: 'desc' }],
    include: { tags: true, shares: true }
  });
}