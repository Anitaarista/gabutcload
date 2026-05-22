"use client";

import { Grid2X2, List, Search } from "lucide-react";
import { useFileViewStore } from "@/store/file-view";

export function Topbar() {
  const { mode, setMode } = useFileViewStore();

  return (
    <div className="flex items-center justify-between border-b border-[#1e293b] px-6 py-4">
      <div>
        <p className="text-sm text-[#8892a4]">CloudVault / Dashboard</p>
        <h2 className="font-heading text-xl font-semibold text-[#e8ecf1]">My Files</h2>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm text-[#8892a4]">
          <Search className="h-4 w-4" />
          <input placeholder="Search files" className="w-44 bg-transparent text-[#e8ecf1] outline-none placeholder:text-[#4a5568]" />
        </label>
        <div className="flex rounded-lg border border-[#1e293b] bg-[#111827] p-1">
          <button type="button" className={`rounded p-2 ${mode === "grid" ? "bg-[#1a2332] text-[#e8ecf1]" : "text-[#8892a4]"}`} onClick={() => setMode("grid")}>
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button type="button" className={`rounded p-2 ${mode === "list" ? "bg-[#1a2332] text-[#e8ecf1]" : "text-[#8892a4]"}`} onClick={() => setMode("list")}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
