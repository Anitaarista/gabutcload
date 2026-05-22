import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function bytes(seed: number) {
  return seed * 1024 * 1024 * 7;
}

async function main() {
  const password = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@cloudvault.app' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@cloudvault.app',
      password,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CloudVault'
    }
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: 'workspace-demo' },
    update: {},
    create: {
      id: 'workspace-demo',
      name: 'CloudVault Team',
      description: 'Design and product assets'
    }
  });

  await prisma.workspaceMember.upsert({
    where: { id: 'workspace-member-demo' },
    update: {},
    create: {
      id: 'workspace-member-demo',
      userId: user.id,
      workspaceId: workspace.id,
      role: 'admin'
    }
  });

  const rootFolders = [
    { name: 'Design System', type: 'folder' },
    { name: 'Product Launch', type: 'folder' },
    { name: 'Media Library', type: 'folder' },
    { name: 'Reports', type: 'folder' }
  ];

  const createdFolders: Array<{ id: string; name: string }> = [];

  for (const folder of rootFolders) {
    const record = await prisma.file.create({
      data: {
        name: folder.name,
        type: folder.type,
        isFolder: true,
        ownerId: user.id,
        workspaceId: workspace.id,
        size: 0
      }
    });

    createdFolders.push({ id: record.id, name: record.name });
  }

  const fileFactories = [
    { name: 'brand-guide.pdf', type: 'pdf', size: bytes(4), mimeType: 'application/pdf', parentName: 'Design System' },
    { name: 'hero-banner.png', type: 'image', size: bytes(8), mimeType: 'image/png', parentName: 'Media Library', dimensions: '2560x1440' },
    { name: 'launch-deck.key', type: 'presentation', size: bytes(12), mimeType: 'application/vnd.apple.keynote', parentName: 'Product Launch' },
    { name: 'q1-financials.xlsx', type: 'spreadsheet', size: bytes(5), mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', parentName: 'Reports' },
    { name: 'app-shell.tsx', type: 'code', size: bytes(1), mimeType: 'text/x-typescript', parentName: 'Design System' },
    { name: 'onboarding.mp4', type: 'video', size: bytes(18), mimeType: 'video/mp4', parentName: 'Media Library', duration: '00:03:45' }
  ] as const;

  for (let index = 0; index < 30; index += 1) {
    const base = fileFactories[index % fileFactories.length];
    const parent = createdFolders.find((folder) => folder.name === base.parentName);

    await prisma.file.create({
      data: {
        name: index < fileFactories.length ? base.name : `${base.name.replace(/\.[^/.]+$/, '')}-${index}${base.name.includes('.') ? base.name.slice(base.name.lastIndexOf('.')) : ''}`,
        type: base.type,
        mimeType: base.mimeType,
        size: base.size + index * 1024,
        isFolder: false,
        dimensions: 'dimensions' in base ? base.dimensions : undefined,
        duration: 'duration' in base ? base.duration : undefined,
        ownerId: user.id,
        workspaceId: workspace.id,
        parentId: parent?.id,
        starred: index % 7 === 0,
        colorLabel: ['green', 'blue', 'purple', 'yellow'][index % 4]
      }
    });
  }

  await prisma.activity.createMany({
    data: [
      { action: 'upload', userId: user.id, metadata: JSON.stringify({ name: 'brand-guide.pdf' }) },
      { action: 'share', userId: user.id, metadata: JSON.stringify({ name: 'launch-deck.key' }) },
      { action: 'rename', userId: user.id, metadata: JSON.stringify({ name: 'hero-banner.png' }) }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });