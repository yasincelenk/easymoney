'use client';

import {FormEvent, useState} from 'react';
import {signIn} from 'next-auth/react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    await signIn('email', {email, redirect: false});
    setStatus('success');
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <Input id="email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending magic link…' : 'Send magic link'}
      </Button>
      <Button type="button" variant="secondary" className="w-full" onClick={() => signIn('google')}>
        Continue with Google
      </Button>
      {status === 'success' ? (
        <p className="text-sm text-green-600">Check your inbox to finish signing in.</p>
      ) : null}
    </form>
  );
}
