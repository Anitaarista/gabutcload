import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-[#0a0e17] text-[#e8ecf1]"><Sidebar /><div className="flex flex-1 flex-col"><Topbar /><main className="p-6">{children}</main></div></div>
    </SessionProvider>
  );
}
