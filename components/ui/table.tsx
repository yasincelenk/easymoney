import * as React from 'react';
import {cn} from '@/lib/utils';

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({className, ...props}, ref) => (
  <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
));
Table.displayName = 'Table';

export const TableHeader = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('[&_tr]:border-b', className)} {...props} />
);

export const TableBody = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);

export const TableRow = ({className, ...props}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('border-b border-slate-200 transition-colors hover:bg-slate-50 data-[state=selected]:bg-slate-100', className)} {...props} />
);

export const TableHead = ({className, ...props}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('h-10 px-2 text-left align-middle font-medium text-slate-500', className)} {...props} />
);

export const TableCell = ({className, ...props}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('p-2 align-middle', className)} {...props} />
);
