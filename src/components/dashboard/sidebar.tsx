"use client";

import Link from "next/link";
import { Folder, LayoutGrid, Shield, Star } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const menu = [
  { href: "/dashboard", icon: LayoutGrid, label: "My Files" },
  { href: "/dashboard/starred", icon: Star, label: "Starred" },
  { href: "/dashboard/vault", icon: Shield, label: "Private Vault" },
  { href: "/dashboard/folders", icon: Folder, label: "Folders" },
];

export function Sidebar() {
  const { data } = useSession();

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-[#1e293b] bg-[#111827] p-4">
      <h1 className="font-heading text-2xl font-bold text-[#e8ecf1]">CloudVault</h1>
      <p className="mt-1 text-sm text-[#8892a4]">Secure next-gen storage</p>
      <nav className="mt-6 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#8892a4] transition hover:bg-[#1a2332] hover:text-[#e8ecf1]"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <Card className="mt-6 p-4">
        <p className="text-xs text-[#8892a4]">Storage</p>
        <div className="mt-2 h-2 rounded-full bg-[#1a2332]">
          <div className="h-2 w-1/4 rounded-full bg-gradient-to-r from-[#00e5c3] to-[#00b4d8]" />
        </div>
        <p className="mt-2 text-xs text-[#e8ecf1]">{data?.user.plan ?? "free"} plan</p>
      </Card>
      <div className="mt-auto pt-6">
        <p className="text-sm text-[#e8ecf1]">{data?.user.name}</p>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
