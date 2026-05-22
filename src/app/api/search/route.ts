import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ files: [] });

  const files = await prisma.file.findMany({
    where: { ownerId: session.user.id, isTrashed: false, name: { contains: q } },
    take: 30,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ files });
}
