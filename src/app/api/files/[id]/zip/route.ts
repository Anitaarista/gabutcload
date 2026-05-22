import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { PassThrough } from "stream";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const folder = await prisma.file.findFirst({ where: { id, ownerId: session.user.id, isFolder: true }, include: { children: true } });
  if (!folder) return new Response("Folder not found", { status: 404 });

  const passThrough = new PassThrough();
  const archiverModule = await import("archiver");
  const archive = archiverModule.default("zip", { zlib: { level: 9 } });
  archive.pipe(passThrough);

  for (const child of folder.children) {
    if (child.isFolder || !child.description) continue;
    const abs = path.join(process.cwd(), "public", child.description.replace(/^\//, ""));
    try {
      await stat(abs);
      archive.append(createReadStream(abs), { name: child.name });
    } catch {
      continue;
    }
  }

  void archive.finalize();

  return new Response(passThrough as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${folder.name}.zip"`,
    },
  });
}
