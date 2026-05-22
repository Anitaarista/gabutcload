"use client";

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import {
  Archive,
  Copy,
  FolderPlus,
  Grid2x2,
  LayoutList,
  MoreHorizontal,
  Pencil,
  Search,
  Shield,
  Star,
  Tag,
  MessageSquare,
  Share2,
  Trash2,
  FileClock,
  Link2
} from 'lucide-react';
import type { Prisma } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn, formatBytes } from '@/lib/utils';
import { useFileViewStore } from '@/store/use-file-view-store';

type Breadcrumb = { id: string; name: string };
type FileRecord = Prisma.FileGetPayload<{
  include: {
    tags: true;
    shares: true;
    comments: true;
    versions: true;
  };
}>;

type FileManagerProps = {
  files: FileRecord[];
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

function fileIconLabel(file: FileRecord) {
  if (file.isFolder) return 'folder';
  return file.type;
}

function FileTile({
  file,
  selected,
  active,
  onSelect,
  onOpen,
  onRefresh
}: {
  file: FileRecord;
  selected: boolean;
  active: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onRefresh: () => void;
}) {
  const [renameValue, setRenameValue] = useState(file.name);
  const [isRenaming, startTransition] = useTransition();

  async function toggleStar() {
    const response = await fetch(`/api/files/${file.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggleStar' })
    });

    if (!response.ok) {
      toast.error('Could not update star');
      return;
    }

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

      toast.success('Renamed');
      onRefresh();
    });
  }

  return (
    <Card className={cn('group overflow-hidden transition', active && 'border-[#00e5c3]/40 ring-1 ring-[#00e5c3]/20')}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={() => onSelect(file.id)} className="mt-1 h-4 w-4 rounded border border-border bg-secondary">
            {selected ? <div className="m-0.5 h-2.5 w-2.5 rounded-sm bg-[#00e5c3]" /> : null}
          </button>
          <button type="button" onClick={toggleStar} className={cn('text-muted transition hover:text-[#00e5c3]', file.starred && 'text-[#00e5c3]')}>
            <Star className="h-4 w-4" />
          </button>
        </div>

        <button type="button" onClick={() => onOpen(file.id)} className="block w-full rounded-2xl border border-border bg-tertiary/50 p-4 text-left">
          <div className="flex items-center justify-between gap-2">
            <Badge className="border-white/10 bg-white/5 capitalize">{fileIconLabel(file)}</Badge>
            <span className="text-xs text-muted">{formatBytes(file.size)}</span>
          </div>
          <div className="mt-4 flex h-16 items-center justify-center rounded-2xl bg-black/20 text-sm text-muted">
            {file.isFolder ? 'Folder' : file.type.toUpperCase()}
          </div>
        </button>

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
  const [folderName, setFolderName] = useState('');
  const [activeFileId, setActiveFileId] = useState<string | null>(files[0]?.id ?? null);
  const [detailTab, setDetailTab] = useState<'info' | 'tags' | 'versions' | 'comments' | 'share'>('info');
  const [tagName, setTagName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [shareRole, setShareRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [sharePassword, setSharePassword] = useState('');
  const [shareLimit, setShareLimit] = useState('');
  const [shareExpiresAt, setShareExpiresAt] = useState('');
  const [isBusy, startTransition] = useTransition();

  const selectedFiles = useMemo(() => files.filter((file) => selectedIds.includes(file.id)), [files, selectedIds]);
  const activeFile = useMemo(() => files.find((file) => file.id === activeFileId) ?? selectedFiles[0] ?? files[0] ?? null, [activeFileId, files, selectedFiles]);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    if (!activeFileId && files[0]) {
      setActiveFileId(files[0].id);
    }
  }, [activeFileId, files]);

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
    if (!folderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    const response = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'folder', name: folderName.trim(), parentId: folderId })
    });

    if (!response.ok) {
      toast.error('Could not create folder');
      return;
    }

    setFolderName('');
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

  async function addTag() {
    if (!activeFile || !tagName.trim()) return;

    const response = await fetch(`/api/files/${activeFile.id}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tagName.trim() })
    });

    if (!response.ok) {
      toast.error('Could not add tag');
      return;
    }

    setTagName('');
    toast.success('Tag added');
    router.refresh();
  }

  async function removeTag(tagId: string) {
    if (!activeFile) return;

    await fetch(`/api/files/${activeFile.id}/tags?tagId=${tagId}`, { method: 'DELETE' });
    toast.success('Tag removed');
    router.refresh();
  }

  async function addComment() {
    if (!activeFile || !commentText.trim()) return;

    const response = await fetch(`/api/files/${activeFile.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentText.trim() })
    });

    if (!response.ok) {
      toast.error('Could not add comment');
      return;
    }

    setCommentText('');
    toast.success('Comment added');
    router.refresh();
  }

  async function removeComment(commentId: string) {
    if (!activeFile) return;

    await fetch(`/api/files/${activeFile.id}/comments?commentId=${commentId}`, { method: 'DELETE' });
    toast.success('Comment removed');
    router.refresh();
  }

  async function createShare() {
    if (!activeFile) return;

    const response = await fetch(`/api/files/${activeFile.id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: shareRole,
        linkPassword: sharePassword || undefined,
        downloadLimit: shareLimit ? Number(shareLimit) : undefined,
        linkExpiresAt: shareExpiresAt || undefined
      })
    });

    if (!response.ok) {
      toast.error('Could not create share');
      return;
    }

    setSharePassword('');
    setShareLimit('');
    setShareExpiresAt('');
    toast.success('Share created');
    router.refresh();
  }

  async function removeShare(shareId: string) {
    if (!activeFile) return;

    await fetch(`/api/files/${activeFile.id}/share?shareId=${shareId}`, { method: 'DELETE' });
    toast.success('Share removed');
    router.refresh();
  }

  async function toggleLock() {
    if (!activeFile) return;

    await fetch(`/api/files/${activeFile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lock' })
    });

    toast.success(activeFile.locked ? 'Unlocked' : 'Locked');
    router.refresh();
  }

  return (
    <section className="flex min-h-[calc(100vh-80px)] flex-col gap-6 p-4 lg:p-6 xl:grid xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        <Card className={cn('border-dashed', isDragActive && 'border-[#00e5c3] bg-[#00e5c3]/5')} {...getRootProps()}>
          <input {...getInputProps()} />
          <CardContent className="flex flex-col items-center justify-between gap-4 py-8 text-center md:flex-row md:text-left">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">Upload zone</p>
              <h3 className="font-heading mt-1 text-2xl">Drag and drop files here</h3>
              <CardDescription>Multi-file upload with live progress and secure storage in public/uploads.</CardDescription>
            </div>
            <Button type="button" onClick={() => toast.message('Drop files here or use the upload zone.')}>Browse files</Button>
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
          <div className="flex min-w-[260px] flex-1 items-center gap-2">
            <Input value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="New folder name" />
            <Button variant="secondary" onClick={createFolder} disabled={isBusy}>
              <FolderPlus className="h-4 w-4" />
              Create
            </Button>
          </div>
          <div className="flex items-center rounded-xl border border-border bg-secondary p-1">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
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
                  <button key={file.id} type="button" onClick={() => setActiveFileId(file.id)} className="flex w-full items-center justify-between rounded-xl border border-border bg-tertiary/40 px-4 py-3 text-left hover:bg-tertiary">
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
            {files.map((file) => (
              <FileTile
                key={file.id}
                file={file}
                selected={selectedIds.includes(file.id)}
                active={activeFile?.id === file.id}
                onSelect={(id) => toggleSelected(id)}
                onOpen={(id) => setActiveFileId(id)}
                onRefresh={() => router.refresh()}
              />
            ))}
          </div>
        )}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24">
        {activeFile ? (
          <Card className="border-[#00e5c3]/15 bg-secondary/95 shadow-2xl">
            <CardHeader>
              <CardTitle>{activeFile.name}</CardTitle>
              <CardDescription>
                {activeFile.type} · {formatBytes(activeFile.size)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['info', 'tags', 'versions', 'comments', 'share'] as const).map((tab) => (
                  <Button key={tab} size="sm" variant={detailTab === tab ? 'default' : 'secondary'} onClick={() => setDetailTab(tab)}>
                    {tab}
                  </Button>
                ))}
              </div>

              {detailTab === 'info' ? (
                <div className="space-y-3 text-sm text-muted">
                  <p>Type: <span className="text-foreground capitalize">{activeFile.type}</span></p>
                  <p>Mime: <span className="text-foreground">{activeFile.mimeType || 'n/a'}</span></p>
                  <p>Folder: <span className="text-foreground">{activeFile.isFolder ? 'Yes' : 'No'}</span></p>
                  <p>Vault: <span className="text-foreground">{activeFile.isVault ? 'Yes' : 'No'}</span></p>
                  <p>Locked: <span className="text-foreground">{activeFile.locked ? 'Yes' : 'No'}</span></p>
                  <p>Encrypted: <span className="text-foreground">{activeFile.encrypted ? 'Yes' : 'No'}</span></p>
                  <p>Starred: <span className="text-foreground">{activeFile.starred ? 'Yes' : 'No'}</span></p>
                </div>
              ) : null}

              {detailTab === 'tags' ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={tagName} onChange={(event) => setTagName(event.target.value)} placeholder="Add tag" />
                    <Button size="sm" onClick={addTag}><Tag className="h-4 w-4" />Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeFile.tags.map((tag) => (
                      <button key={tag.id} type="button" onClick={() => removeTag(tag.id)} className="rounded-full border border-border bg-tertiary px-3 py-1 text-xs text-foreground">
                        {tag.name}
                      </button>
                    ))}
                    {!activeFile.tags.length ? <p className="text-sm text-muted">No tags yet.</p> : null}
                  </div>
                </div>
              ) : null}

              {detailTab === 'versions' ? (
                <div className="space-y-2">
                  {activeFile.versions.map((version) => (
                    <div key={version.id} className="rounded-xl border border-border bg-tertiary/40 p-3 text-sm">
                      <p className="font-medium text-foreground">Version {version.version}</p>
                      <p className="text-muted">{formatBytes(version.size)} · {new Date(version.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {!activeFile.versions.length ? <p className="text-sm text-muted">No versions available.</p> : null}
                </div>
              ) : null}

              {detailTab === 'comments' ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment" />
                    <Button size="sm" onClick={addComment}><MessageSquare className="h-4 w-4" />Add</Button>
                  </div>
                  <div className="space-y-2">
                    {activeFile.comments.map((comment) => (
                      <div key={comment.id} className="rounded-xl border border-border bg-tertiary/40 p-3 text-sm">
                        <p className="text-foreground">{comment.text}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted">
                          <span>{new Date(comment.createdAt).toLocaleString()}</span>
                          <button type="button" onClick={() => removeComment(comment.id)} className="text-[#00e5c3]">Remove</button>
                        </div>
                      </div>
                    ))}
                    {!activeFile.comments.length ? <p className="text-sm text-muted">No comments yet.</p> : null}
                  </div>
                </div>
              ) : null}

              {detailTab === 'share' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <select value={shareRole} onChange={(event) => setShareRole(event.target.value as typeof shareRole)} className="h-10 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground">
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Input value={sharePassword} onChange={(event) => setSharePassword(event.target.value)} placeholder="Password (optional)" />
                    <Input value={shareLimit} onChange={(event) => setShareLimit(event.target.value)} placeholder="Download limit" />
                    <Input value={shareExpiresAt} onChange={(event) => setShareExpiresAt(event.target.value)} type="datetime-local" />
                  </div>
                  <Button className="w-full" onClick={createShare}><Share2 className="h-4 w-4" />Create share</Button>
                  <div className="space-y-2">
                    {activeFile.shares.map((share) => (
                      <div key={share.id} className="rounded-xl border border-border bg-tertiary/40 p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 text-foreground"><Link2 className="h-4 w-4" />{share.shareLink ?? 'private share'}</span>
                          <button type="button" onClick={() => removeShare(share.id)} className="text-[#00e5c3]">Remove</button>
                        </div>
                        <p className="mt-1 text-muted">Role: {share.role} · Downloads: {share.downloadCount}</p>
                      </div>
                    ))}
                    {!activeFile.shares.length ? <p className="text-sm text-muted">No shares yet.</p> : null}
                  </div>
                </div>
              ) : null}

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={toggleLock}><Shield className="h-4 w-4" />{activeFile.locked ? 'Unlock' : 'Lock'}</Button>
                <a href={`/api/files/download/${activeFile.id}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-tertiary px-3 text-sm text-foreground transition hover:bg-slate-700">
                  <Archive className="h-4 w-4" />
                  Download
                </a>
                <Button size="sm" variant="danger" onClick={() => fetch(`/api/files/${activeFile.id}`, { method: 'DELETE' }).then(() => router.refresh())}><Trash2 className="h-4 w-4" />Trash</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/70 bg-secondary/80">
            <CardContent className="p-5 text-sm text-muted">Select a file to see details, tags, versions, comments, and sharing controls.</CardContent>
          </Card>
        )}

        <Card className="border-border/70 bg-secondary/80">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-muted">
            <FileClock className="h-4 w-4 text-[#00e5c3]" />
            <span>Double-click a filename to rename inline. Select multiple files to batch actions.</span>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
}