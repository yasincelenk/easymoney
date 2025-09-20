'use client';

import {SignatureProvider} from '@prisma/client';
import {useState, useTransition} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {updateEsignProviderAction} from '@/app/actions/esign';
import {Textarea} from '@/components/ui/textarea';

export function EsignSettingsForm({initialProvider}: {initialProvider: SignatureProvider}) {
  const [provider, setProvider] = useState<SignatureProvider>(initialProvider);
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          await updateEsignProviderAction({provider});
          setSaved(true);
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Provider</label>
        <Select value={provider} onValueChange={(value) => setProvider(value as SignatureProvider)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SignatureProvider.MANUAL}>Manual (PDF upload)</SelectItem>
            <SelectItem value={SignatureProvider.EGUVEN}>EGüven (stub)</SelectItem>
            <SelectItem value={SignatureProvider.TURKTRUST}>TURKTRUST (stub)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Credential notes</label>
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Describe where to configure credentials in production."
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save settings'}
      </Button>
      {saved && <p className="text-sm text-green-600">Settings saved.</p>}
    </form>
  );
}
