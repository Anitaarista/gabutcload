import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.activity.deleteMany();
  await prisma.share.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.fileVersion.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.file.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@cloudvault.dev",
      password: await hash("password123", 10),
      avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Demo%20User",
      plan: "pro",
      twoFactor: true,
      vaultPin: "1234",
    },
  });

  const folders = await Promise.all(
    ["Documents", "Media", "Projects", "Private Vault", "Archives"].map((name, i) =>
      prisma.file.create({
        data: {
          name,
          type: "folder",
          isFolder: true,
          ownerId: user.id,
          isVault: i === 3,
          colorLabel: ["blue", "green", "purple", "red", "orange"][i],
        },
      }),
    ),
  );

  for (let i = 1; i <= 35; i++) {
    const folder = folders[i % folders.length];
    await prisma.file.create({
      data: {
        name: `File-${i}.txt`,
        type: i % 2 === 0 ? "document" : "code",
        mimeType: "text/plain",
        size: 2048 * i,
        ownerId: user.id,
        parentId: folder.id,
        starred: i % 3 === 0,
        locked: i % 10 === 0,
        isVault: folder.isVault,
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
