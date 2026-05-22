import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getBreadcrumbs, getFolderById, listFiles } from '@/lib/queries';
import { FileManager } from '@/components/dashboard/file-manager';

type FilesPageProps = {
  searchParams?: {
    folder?: string;
    q?: string;
  };
};

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const folderId = searchParams?.folder ?? null;
  const query = searchParams?.q ?? '';

  if (folderId) {
    const folder = await getFolderById(session.user.id, folderId);
    if (!folder) redirect('/dashboard/files');
  }

  const [breadcrumbs, files] = await Promise.all([
    getBreadcrumbs(session.user.id, folderId),
    listFiles(session.user.id, folderId, query)
  ]);

  return <FileManager files={files} breadcrumbs={breadcrumbs} folderId={folderId} search={query} />;
}