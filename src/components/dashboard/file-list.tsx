"use client";

import { Folder, Lock, Star, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { moveToTrash, toggleLock, toggleStar } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFileViewStore } from "@/store/file-view";

type Item = { id: string; name: string; type: string; size: number; isFolder: boolean; locked: boolean; starred: boolean; colorLabel: string | null; };

export function FileList({ items }: { items: Item[] }) {
  const { mode } = useFileViewStore();
  const [pending, startTransition] = useTransition();

  if (mode === "list") {
    return (
      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1a2332] text-[#8892a4]"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {items.map((file) => (
              <tr key={file.id} className="border-t border-[#1e293b]"><td className="px-4 py-3 text-[#e8ecf1]">{file.name}</td><td className="px-4 py-3 text-[#8892a4]">{file.type}</td><td className="px-4 py-3 text-[#8892a4]">{Math.max(file.size / 1024, 0).toFixed(1)} KB</td><td className="px-4 py-3"><ItemActions id={file.id} locked={file.locked} starred={file.starred} pending={pending} onRun={startTransition} /></td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((file) => (
        <Card key={file.id} className="p-4 hover:bg-[#1a2332]"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="rounded-lg bg-[#1a2332] p-2"><Folder className="h-5 w-5 text-[#00e5c3]" /></div><div><h3 className="font-medium text-[#e8ecf1]">{file.name}</h3><p className="text-xs text-[#8892a4]">{file.type}</p></div></div>{file.locked && <Lock className="h-4 w-4 text-[#ffa502]" />}</div><div className="mt-4"><ItemActions id={file.id} locked={file.locked} starred={file.starred} pending={pending} onRun={startTransition} /></div></Card>
      ))}
    </div>
  );
}

function ItemActions({ id, locked, starred, pending, onRun }: { id: string; locked: boolean; starred: boolean; pending: boolean; onRun: (callback: () => void) => void; }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" disabled={pending} onClick={() => onRun(() => void toggleStar(id))}><Star className={`h-4 w-4 ${starred ? "fill-[#00e5c3] text-[#00e5c3]" : ""}`} /></Button>
      <Button variant="ghost" disabled={pending} onClick={() => onRun(() => void toggleLock(id))}><Lock className={`h-4 w-4 ${locked ? "text-[#ffa502]" : ""}`} /></Button>
      <Button variant="ghost" disabled={pending || locked} onClick={() => onRun(() => void moveToTrash(id))}><Trash2 className="h-4 w-4 text-[#ff4757]" /></Button>
    </div>
  );
}
