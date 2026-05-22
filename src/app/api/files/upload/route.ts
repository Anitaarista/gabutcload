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
    const originalName = path.basename(file.name);
    const normalizedExtension = path.extname(originalName).toLowerCase().replace(/[^a-z0-9]/g, "");
    const extension = normalizedExtension ? `.${normalizedExtension}` : "";
    const basename = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 120);
    const safeName = `${randomUUID()}-${basename || `file-${Date.now()}`}${extension}`;
    await writeFile(path.join(uploadDir, safeName), buffer);

    const detectedType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : file.type.includes("pdf")
            ? "pdf"
            : file.type.includes("zip") || file.type.includes("rar")
              ? "archive"
              : file.type.includes("javascript") ||
                  file.type.includes("json") ||
                  file.type.includes("xml") ||
                  file.type.includes("typescript")
                ? "code"
                : "document";

    await prisma.file.create({
      data: {
        name: file.name,
        type: detectedType,
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
