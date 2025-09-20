'use client';

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import {cn} from '@/lib/utils';

const DropdownMenu = DropdownPrimitive.Root;
const DropdownMenuTrigger = DropdownPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>>(
  ({className, sideOffset = 4, ...props}, ref) => (
    <DropdownPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-700 shadow-md', className)}
      {...props}
    />
  )
);
DropdownMenuContent.displayName = DropdownPrimitive.Content.displayName;

const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownPrimitive.Label>, React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>>(
  ({className, ...props}, ref) => (
    <DropdownPrimitive.Label ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold text-slate-500', className)} {...props} />
  )
);
DropdownMenuLabel.displayName = DropdownPrimitive.Label.displayName;

const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>>(
  ({className, ...props}, ref) => (
    <DropdownPrimitive.Item
      ref={ref}
      className={cn(
        'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-slate-100 focus:text-slate-900',
        className
      )}
      {...props}
    />
  )
);
DropdownMenuItem.displayName = DropdownPrimitive.Item.displayName;

const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>>(
  ({className, ...props}, ref) => (
    <DropdownPrimitive.Separator ref={ref} className={cn('my-1 h-px bg-slate-200', className)} {...props} />
  )
);
DropdownMenuSeparator.displayName = DropdownPrimitive.Separator.displayName;

export {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel};
