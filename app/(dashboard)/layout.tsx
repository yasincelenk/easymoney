import {ReactNode} from 'react';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {Sidebar} from '@/components/layout/sidebar';
import {Topbar} from '@/components/layout/topbar';

export default async function DashboardLayout({children}: {children: ReactNode}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
