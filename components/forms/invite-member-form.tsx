'use client';

import {useState, useTransition} from 'react';
import {Role} from '@prisma/client';
import {inviteMemberAction} from '@/app/actions/team';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

export function InviteMemberForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.MEMBER);
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <form
      className="flex flex-col gap-3 md:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          await inviteMemberAction({email, role});
          setSent(true);
          setEmail('');
        });
      }}
    >
      <Input placeholder="invite@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <Select value={role} onValueChange={(value) => setRole(value as Role)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={Role.MEMBER}>Member</SelectItem>
          <SelectItem value={Role.ADMIN}>Admin</SelectItem>
          <SelectItem value={Role.VIEWER}>Viewer</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Sending…' : 'Send invite'}
      </Button>
      {sent && <span className="text-sm text-green-600">Invite sent!</span>}
    </form>
  );
}
