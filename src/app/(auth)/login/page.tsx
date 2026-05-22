'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setLoading(true);
    const result = await signIn('credentials', {
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
      redirect: false
    });
    setLoading(false);

    if (result?.error) {
      toast.error('Invalid credentials');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader>
        <CardTitle className="font-heading text-3xl">CloudVault</CardTitle>
        <CardDescription>Sign in to your encrypted storage workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input name="email" type="email" placeholder="demo@cloudvault.app" defaultValue="demo@cloudvault.app" required />
          <Input name="password" type="password" placeholder="password123" defaultValue="password123" required />
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}