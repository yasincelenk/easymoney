'use client';

import {useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {saveContractVersionAction} from '@/app/actions/contracts';

export function ContractEditor({contractId, initialBody}: {contractId: string; initialBody: string}) {
  const [value, setValue] = useState(initialBody);
  const [isPending, startTransition] = useTransition();
  const [version, setVersion] = useState<number | null>(null);
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Textarea className="h-72" value={value} onChange={(event) => setValue(event.target.value)} />
      <div className="flex items-center gap-3">
        <Button
          onClick={() =>
            startTransition(async () => {
              const result = await saveContractVersionAction({contractId, body: value});
              setVersion(result.version);
              router.refresh();
            })
          }
          disabled={isPending}
        >
          {isPending ? 'Saving…' : 'Save version'}
        </Button>
        {version ? <span className="text-sm text-slate-500">Created version {version}</span> : null}
      </div>
    </div>
  );
}
