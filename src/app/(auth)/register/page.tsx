"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }),
    });

    setLoading(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Failed to create account");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e17] px-4"><Card className="w-full max-w-md p-6"><h1 className="font-heading text-2xl text-[#e8ecf1]">Create account</h1><p className="mt-1 text-sm text-[#8892a4]">Start using CloudVault</p><form className="mt-6 space-y-4" onSubmit={onSubmit}><input name="name" required placeholder="Name" className="w-full rounded-lg border border-[#1e293b] bg-[#0a0e17] px-3 py-2 text-[#e8ecf1] outline-none" /><input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-[#1e293b] bg-[#0a0e17] px-3 py-2 text-[#e8ecf1] outline-none" /><input name="password" type="password" required minLength={6} placeholder="Password" className="w-full rounded-lg border border-[#1e293b] bg-[#0a0e17] px-3 py-2 text-[#e8ecf1] outline-none" />{error && <p className="text-sm text-[#ff4757]">{error}</p>}<Button className="w-full" disabled={loading}>{loading ? "Creating..." : "Register"}</Button></form><p className="mt-4 text-sm text-[#8892a4]">Have an account? <Link className="text-[#00e5c3]" href="/login">Login</Link></p></Card></div>
  );
}
