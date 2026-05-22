import 'server-only';

import fs from 'fs/promises';
import path from 'path';

export const UPLOAD_ROOT = path.join(process.cwd(), 'public/uploads');

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
}

export function fileStoragePath(fileId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '_');
  return path.join(UPLOAD_ROOT, `${fileId}-${safeName}`);
}

export function folderStoragePath(folderId: string) {
  return path.join(UPLOAD_ROOT, folderId);
}

export function bytesToHuman(bytes: number) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** index).toFixed(1)} ${units[index]}`;
}