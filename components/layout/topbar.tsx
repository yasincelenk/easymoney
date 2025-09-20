'use client';

import {Bell, Search, UserCircle} from 'lucide-react';
import {useSession, signOut} from 'next-auth/react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {OrgSwitcher} from './org-switcher';

export function Topbar() {
  const {data: session} = useSession();
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <OrgSwitcher />
        <div className="hidden md:flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <Input className="h-8 border-0 bg-transparent p-0 text-sm" placeholder="Search contracts" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" aria-hidden />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              <span className="hidden text-sm font-medium sm:inline">
                {session?.user?.name ?? session?.user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>{session?.user?.email}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => signOut()}>{'Sign out'}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
