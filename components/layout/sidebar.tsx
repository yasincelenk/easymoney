'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {LayoutDashboard, ScrollText, Layers, Users, Settings} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useTranslations} from 'next-intl';

const navigation = [
  {href: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard'},
  {href: '/contracts', icon: ScrollText, label: 'nav.contracts'},
  {href: '/templates', icon: Layers, label: 'nav.templates'},
  {href: '/team', icon: Users, label: 'nav.team'},
  {href: '/settings/billing', icon: Settings, label: 'nav.settings'}
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b px-6 text-lg font-semibold">Signloop</div>
      <nav className="space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/settings/billing'
              ? pathname?.startsWith('/settings')
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                isActive && 'bg-slate-100 text-slate-900'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.label.replace('nav.', ''))}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
