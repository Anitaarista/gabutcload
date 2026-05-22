import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
  }

  const password = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(body.name)}`
    }
  });

  return NextResponse.json({ id: user.id, email: user.email });
}