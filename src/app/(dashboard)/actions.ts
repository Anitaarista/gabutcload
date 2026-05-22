"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function toggleStar(fileId: string) {
  const userId = await ensureAuth();
  const file = await prisma.file.findFirst({ where: { id: fileId, ownerId: userId } });
  if (!file || file.locked) return;
  await prisma.file.update({ where: { id: fileId }, data: { starred: !file.starred } });
  revalidatePath("/dashboard");
}

export async function toggleLock(fileId: string) {
  const userId = await ensureAuth();
  const file = await prisma.file.findFirst({ where: { id: fileId, ownerId: userId } });
  if (!file) return;
  await prisma.file.update({ where: { id: fileId }, data: { locked: !file.locked } });
  revalidatePath("/dashboard");
}

export async function moveToTrash(fileId: string) {
  const userId = await ensureAuth();
  const file = await prisma.file.findFirst({ where: { id: fileId, ownerId: userId } });
  if (!file || file.locked) return;
  await prisma.file.update({ where: { id: fileId }, data: { isTrashed: true, trashedAt: new Date() } });
  revalidatePath("/dashboard");
}
