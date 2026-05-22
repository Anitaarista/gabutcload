'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setLoading(true);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        password: String(data.get('password') ?? '')
      })
    });
    setLoading(false);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? 'Unable to create account');
      return;
    }

    toast.success('Account created');
    router.push('/login');
  }

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader>
        <CardTitle className="font-heading text-3xl">Create account</CardTitle>
        <CardDescription>Start with a clean workspace and secure vault access.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input name="name" placeholder="Your name" required />
          <Input name="email" type="email" placeholder="you@company.com" required />
          <Input name="password" type="password" placeholder="Create a password" required minLength={8} />
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}