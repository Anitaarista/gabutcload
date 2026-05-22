import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { name?: string; parentId?: string | null; starred?: boolean; locked?: boolean; colorLabel?: string | null };

  const current = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (current.locked && (body.name || body.parentId !== undefined)) {
    return NextResponse.json({ error: "Locked file" }, { status: 409 });
  }

  const file = await prisma.file.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.parentId !== undefined ? { parentId: body.parentId } : {}),
      ...(body.starred !== undefined ? { starred: body.starred } : {}),
      ...(body.locked !== undefined ? { locked: body.locked } : {}),
      ...(body.colorLabel !== undefined ? { colorLabel: body.colorLabel } : {}),
    },
  });

  return NextResponse.json({ file });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const current = await prisma.file.findFirst({ where: { id, ownerId: session.user.id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (current.locked) return NextResponse.json({ error: "Locked file" }, { status: 409 });

  await prisma.file.update({ where: { id }, data: { isTrashed: true, trashedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
