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
  if (!file) return { ok: false, reason: "NOT_FOUND" as const };
  if (file.locked) return { ok: false, reason: "LOCKED" as const };
  await prisma.file.update({ where: { id: fileId }, data: { starred: !file.starred } });
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function toggleLock(fileId: string) {
  const userId = await ensureAuth();
  const file = await prisma.file.findFirst({ where: { id: fileId, ownerId: userId } });
  if (!file) return { ok: false, reason: "NOT_FOUND" as const };
  await prisma.file.update({ where: { id: fileId }, data: { locked: !file.locked } });
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function moveToTrash(fileId: string) {
  const userId = await ensureAuth();
  const file = await prisma.file.findFirst({ where: { id: fileId, ownerId: userId } });
  if (!file) return { ok: false, reason: "NOT_FOUND" as const };
  if (file.locked) return { ok: false, reason: "LOCKED" as const };
  await prisma.file.update({ where: { id: fileId }, data: { isTrashed: true, trashedAt: new Date() } });
  revalidatePath("/dashboard");
  return { ok: true as const };
}
