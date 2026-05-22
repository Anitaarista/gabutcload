"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");

    const response = await signIn("credentials", { email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""), redirect: false });

    setLoading(false);
    if (response?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e17] px-4"><Card className="w-full max-w-md p-6"><h1 className="font-heading text-2xl text-[#e8ecf1]">Welcome back</h1><p className="mt-1 text-sm text-[#8892a4]">Login to CloudVault</p><form className="mt-6 space-y-4" onSubmit={onSubmit}><input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-[#1e293b] bg-[#0a0e17] px-3 py-2 text-[#e8ecf1] outline-none" /><input name="password" type="password" required placeholder="Password" className="w-full rounded-lg border border-[#1e293b] bg-[#0a0e17] px-3 py-2 text-[#e8ecf1] outline-none" />{error && <p className="text-sm text-[#ff4757]">{error}</p>}<Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Login"}</Button></form><p className="mt-4 text-sm text-[#8892a4]">No account? <Link className="text-[#00e5c3]" href="/register">Create one</Link></p></Card></div>
  );
}
