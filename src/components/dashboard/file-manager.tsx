'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Archive, Copy, FolderPlus, Grid2x2, LayoutList, MoreHorizontal, Pencil, Search, Shield, Star, Trash2 } from 'lucide-react';
import type { File as PrismaFile } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/utils';
import { useFileViewStore } from '@/store/use-file-view-store';

type Breadcrumb = { id: string; name: string };

type FileManagerProps = {
  files: PrismaFile[];
  breadcrumbs: Breadcrumb[];
  folderId: string | null;
  search: string;
};

const viewOptions = [
  { value: 'grid' as const, icon: Grid2x2, label: 'Grid' },
  { value: 'list' as const, icon: LayoutList, label: 'List' },
  { value: 'column' as const, icon: MoreHorizontal, label: 'Column' },
  { value: 'gallery' as const, icon: Archive, label: 'Gallery' }
];

function fileIconLabel(file: PrismaFile) {
  if (file.isFolder) return 'folder';
  return file.type;
}

function FileTile({ file, selected, onToggle, onRefresh }: { file: PrismaFile; selected: boolean; onToggle: (id: string) => void; onRefresh: () => void }) {
  const [renameValue, setRenameValue] = useState(file.name);
  const [isRenaming, startTransition] = useTransition();

  async function toggleStar() {
    await fetch(`/api/files/${file.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggleStar' }) });
    onRefresh();
  }

  async function renameFile() {
    startTransition(async () => {
      const response = await fetch(`/api/files/${file.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', name: renameValue })
      });

      if (!response.ok) {
        toast.error('Rename failed');
        return;
      }

      onRefresh();
    });
  }

  return (
    <Card className={cn('group overflow-hidden transition', selected && 'border-[#00e5c3]/40 ring-1 ring-[#00e5c3]/20')}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={() => onToggle(file.id)} className="mt-1 h-4 w-4 rounded border border-border bg-secondary">
            {selected ? <div className="m-0.5 h-2.5 w-2.5 rounded-sm bg-[#00e5c3]" /> : null}
          </button>
          <button type="button" onClick={toggleStar} className={cn('text-muted transition hover:text-[#00e5c3]', file.starred && 'text-[#00e5c3]')}>
            <Star className="h-4 w-4" />
          </button>
        </div>

        <Link href={file.isFolder ? `/dashboard/files?folder=${file.id}` : '#'} className="block rounded-2xl border border-border bg-tertiary/50 p-4">
          <div className="flex items-center justify-between">
            <Badge className="border-white/10 bg-white/5 capitalize">{fileIconLabel(file)}</Badge>
            <span className="text-xs text-muted">{formatBytes(file.size)}</span>
          </div>
          <div className="mt-4 flex h-16 items-center justify-center rounded-2xl bg-black/20 text-sm text-muted">
            {file.isFolder ? 'Folder' : file.type.toUpperCase()}
          </div>
        </Link>

        {isRenaming ? (
          <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onBlur={renameFile} onKeyDown={(event) => event.key === 'Enter' && renameFile()} autoFocus />
        ) : (
          <button type="button" onDoubleClick={() => setRenameValue(file.name)} className="flex w-full items-center justify-between text-left">
            <span className="truncate font-medium">{file.name}</span>
            <Pencil className="h-3.5 w-3.5 text-muted opacity-0 transition group-hover:opacity-100" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export function FileManager({ files, breadcrumbs, folderId, search }: FileManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { viewMode, setViewMode, selectedIds, toggleSelected, clearSelected } = useFileViewStore();
  const [query, setQuery] = useState(search);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isBusy, startTransition] = useTransition();

  const selectedFiles = useMemo(() => files.filter((file) => selectedIds.includes(file.id)), [files, selectedIds]);
  const activeFile = selectedFiles[0] ?? files[0];

  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');

      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }

      if (folderId) {
        params.set('folder', folderId);
      } else {
        params.delete('folder');
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [folderId, pathname, query, router, searchParams]);

  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append('files', file));
    if (folderId) formData.append('parentId', folderId);

    xhr.open('POST', '/api/files/upload');
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      setUploadProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      setUploadProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        toast.success('Files uploaded');
        router.refresh();
        return;
      }
      toast.error('Upload failed');
    };
    xhr.onerror = () => {
      setUploadProgress(null);
      toast.error('Upload failed');
    };
    xhr.send(formData);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  async function createFolder() {
    const name = window.prompt('Folder name');
    if (!name) return;

    const response = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'folder', name, parentId: folderId })
    });

    if (!response.ok) {
      toast.error('Could not create folder');
      return;
    }

    toast.success('Folder created');
    router.refresh();
  }

  async function trashSelected() {
    await Promise.all(selectedIds.map((id) => fetch(`/api/files/${id}`, { method: 'DELETE' })));
    clearSelected();
    toast.success('Moved to trash');
    router.refresh();
  }

  async function toggleStarSelected() {
    await Promise.all(selectedIds.map((id) => fetch(`/api/files/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggleStar' }) })));
    toast.success('Updated stars');
    router.refresh();
  }

  return (
    <section className="flex min-h-[calc(100vh-80px)] flex-col gap-6 p-4 lg:p-6">
      <Card className={cn('border-dashed', isDragActive && 'border-[#00e5c3] bg-[#00e5c3]/5')} {...getRootProps()}>
        <input {...getInputProps()} />
        <CardContent className="flex flex-col items-center justify-between gap-4 py-8 text-center md:flex-row md:text-left">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Upload zone</p>
            <h3 className="font-heading mt-1 text-2xl">Drag and drop files here</h3>
            <CardDescription>Multi-file upload with live progress and secure storage in public/uploads.</CardDescription>
          </div>
          <Button type="button" onClick={() => toast.message('Use drag and drop or the upload button in the sidebar.')}>Browse files</Button>
        </CardContent>
      </Card>

      {uploadProgress !== null ? (
        <div className="h-2 overflow-hidden rounded-full bg-tertiary">
          <div className="h-full rounded-full bg-gradient-to-r from-[#00e5c3] to-[#00b4d8] transition-all" style={{ width: `${uploadProgress}%` }} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files, folders, descriptions..." className="pl-10" />
        </div>
        <Button variant="secondary" onClick={createFolder} disabled={isBusy}>
          <FolderPlus className="h-4 w-4" />
          New folder
        </Button>
        <div className="flex items-center rounded-xl border border-border bg-secondary p-1">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setViewMode(option.value)}
                className={cn('rounded-lg px-3 py-2 text-sm transition', viewMode === option.value ? 'bg-[#00e5c3] text-[#0a0e17]' : 'text-muted hover:text-foreground')}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/dashboard/files" className="hover:text-foreground">All files</Link>
        {breadcrumbs.map((crumb) => (
          <Link key={crumb.id} href={`/dashboard/files?folder=${crumb.id}`} className="flex items-center gap-2 hover:text-foreground">
            <Separator className="h-4 w-px bg-border" />
            {crumb.name}
          </Link>
        ))}
      </div>

      {selectedIds.length ? (
        <Card className="border-[#00e5c3]/20 bg-[#00e5c3]/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-foreground">{selectedIds.length} selected</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={toggleStarSelected}><Star className="h-4 w-4" />Star</Button>
              <Button size="sm" variant="secondary" onClick={() => toast.message('Move dialog will be added in the next slice.')}><Copy className="h-4 w-4" />Move</Button>
              <Button size="sm" variant="danger" onClick={trashSelected}><Trash2 className="h-4 w-4" />Trash</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {viewMode === 'list' ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Modified</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-border/70 hover:bg-tertiary/40">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toggleSelected(file.id)} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#00e5c3]" />
                        {file.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 capitalize">{file.type}</td>
                    <td className="px-4 py-3">{formatBytes(file.size)}</td>
                    <td className="px-4 py-3">{new Date(file.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : viewMode === 'column' ? (
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr_1fr]">
          <Card>
            <CardHeader><CardTitle>Folders</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {files.filter((file) => file.isFolder).map((file) => (
                <Link key={file.id} href={`/dashboard/files?folder=${file.id}`} className="block rounded-xl border border-border bg-tertiary/40 px-4 py-3 hover:bg-tertiary">
                  {file.name}
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {files.map((file) => (
                <button key={file.id} type="button" onClick={() => toggleSelected(file.id)} className="flex w-full items-center justify-between rounded-xl border border-border bg-tertiary/40 px-4 py-3 text-left hover:bg-tertiary">
                  <span>{file.name}</span>
                  <span className="text-xs text-muted">{file.type}</span>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent>{activeFile ? <p className="text-sm text-muted">{activeFile.name} · {formatBytes(activeFile.size)}</p> : null}</CardContent>
          </Card>
        </div>
      ) : (
        <div className={cn('grid gap-4', viewMode === 'gallery' ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-4')}>
          {files.map((file) => <FileTile key={file.id} file={file} selected={selectedIds.includes(file.id)} onToggle={toggleSelected} onRefresh={() => router.refresh()} />)}
        </div>
      )}

      {activeFile ? (
        <Card className="sticky bottom-4 border-[#00e5c3]/15 bg-secondary/95 shadow-2xl">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Details</p>
              <h3 className="font-medium">{activeFile.name}</h3>
              <p className="text-sm text-muted">{activeFile.type} · {formatBytes(activeFile.size)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary"><Shield className="h-4 w-4" />Lock</Button>
              <Button size="sm" variant="secondary"><Archive className="h-4 w-4" />Download</Button>
              <Button size="sm" variant="danger" onClick={trashSelected}><Trash2 className="h-4 w-4" />Trash</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}