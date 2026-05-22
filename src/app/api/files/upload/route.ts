import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const parentId = formData.get("parentId")?.toString() ?? null;
  if (!files.length) return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await writeFile(path.join(uploadDir, safeName), buffer);

    await prisma.file.create({
      data: {
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "document",
        mimeType: file.type,
        size: file.size,
        ownerId: session.user.id,
        parentId,
        isFolder: false,
        description: `/uploads/${safeName}`,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
