import {cn} from '@/lib/utils';

function diffLines(previous: string, next: string) {
  const prevLines = previous.split('\n');
  const nextLines = next.split('\n');
  const maxLength = Math.max(prevLines.length, nextLines.length);
  const rows: Array<{type: 'same' | 'added' | 'removed'; text: string}> = [];
  for (let index = 0; index < maxLength; index += 1) {
    const prev = prevLines[index];
    const curr = nextLines[index];
    if (prev === curr) {
      rows.push({type: 'same', text: curr ?? ''});
    } else {
      if (prev !== undefined) rows.push({type: 'removed', text: prev});
      if (curr !== undefined) rows.push({type: 'added', text: curr});
    }
  }
  return rows;
}

export function VersionDiff({previous, next}: {previous: string; next: string}) {
  const rows = diffLines(previous, next);
  return (
    <div className="rounded-md border border-slate-200 bg-white text-sm">
      {rows.map((row, index) => (
        <div
          key={`${row.type}-${index}`}
          className={cn('border-b border-slate-100 px-3 py-1 font-mono text-xs last:border-0', {
            'bg-green-50 text-green-700': row.type === 'added',
            'bg-red-50 text-red-700': row.type === 'removed',
            'text-slate-700': row.type === 'same'
          })}
        >
          {row.type === 'added' ? '+' : row.type === 'removed' ? '-' : ' '} {row.text}
        </div>
      ))}
    </div>
  );
}
