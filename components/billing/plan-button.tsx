'use client';

import {Plan} from '@prisma/client';
import {useTransition} from 'react';
import {createCheckoutSessionAction} from '@/app/actions/billing';
import {Button} from '@/components/ui/button';

export function PlanButton({plan, label}: {plan: Plan; label: string}) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          const result = await createCheckoutSessionAction({plan});
          if (result.url && result.url !== '#') {
            window.location.href = result.url;
          }
        })
      }
      disabled={isPending}
    >
      {isPending ? 'Redirecting…' : label}
    </Button>
  );
}
