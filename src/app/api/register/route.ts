import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "Email already used" }, { status: 409 });

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: await hash(parsed.data.password, 10),
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(parsed.data.name)}`,
    },
  });

  return NextResponse.json({ ok: true });
}
