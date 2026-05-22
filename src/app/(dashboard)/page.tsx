import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileList } from "@/components/dashboard/file-list";
import { UploadZone } from "@/components/dashboard/upload-zone";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const items = await prisma.file.findMany({
    where: { ownerId: session?.user.id, isTrashed: false, parentId: null },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, type: true, size: true, isFolder: true, locked: true, starred: true, colorLabel: true },
  });

  return <div><UploadZone /><FileList items={items} /></div>;
}
