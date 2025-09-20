import {ReactNode} from 'react';
import Link from 'next/link';

export default function AuthLayout({children}: {children: ReactNode}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <Link href="/" className="mb-6 text-2xl font-semibold text-slate-900">
        Signloop
      </Link>
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">{children}</div>
    </div>
  );
}
