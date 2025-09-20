'use server';

import Stripe from 'stripe';
import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {Plan} from '@prisma/client';
import {z} from 'zod';

const CheckoutSchema = z.object({
  plan: z.nativeEnum(Plan)
});

function getPriceId(plan: Plan) {
  switch (plan) {
    case Plan.STARTER:
      return process.env.STRIPE_PRICE_STARTER;
    case Plan.PRO:
      return process.env.STRIPE_PRICE_PRO;
    default:
      return process.env.STRIPE_PRICE_FREE;
  }
}

export async function createCheckoutSessionAction(input: z.infer<typeof CheckoutSchema>) {
  const session = await auth();
  if (!session?.user?.id || !session.activeAccountId) {
    throw new Error('Unauthorized');
  }

  const data = CheckoutSchema.parse(input);
  const priceId = getPriceId(data.plan);
  if (!priceId || !process.env.STRIPE_SECRET_KEY) {
    return {url: '#', message: 'Stripe not configured'};
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
  });

  const checkout = await stripe.checkout.sessions.create({
    success_url: `${process.env.APP_URL ?? 'http://localhost:3000'}/settings/billing?success=1`,
    cancel_url: `${process.env.APP_URL ?? 'http://localhost:3000'}/settings/billing`,
    mode: 'subscription',
    customer_email: session.user.email ?? undefined,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    metadata: {
      accountId: session.activeAccountId
    }
  });

  await prisma.auditLog.create({
    data: {
      accountId: session.activeAccountId,
      actorId: session.user.id,
      action: 'billing.checkout_created',
      targetType: 'subscription',
      targetId: checkout.id
    }
  });

  return {url: checkout.url};
}
