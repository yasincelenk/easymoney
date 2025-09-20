import {NextResponse} from 'next/server';
import Stripe from 'stripe';
import {prisma} from '@/lib/prisma';
import {Plan} from '@prisma/client';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {apiVersion: '2023-10-16'})
  : null;

function planFromPrice(priceId: string | null): Plan {
  switch (priceId) {
    case process.env.STRIPE_PRICE_PRO:
      return Plan.PRO;
    case process.env.STRIPE_PRICE_STARTER:
      return Plan.STARTER;
    default:
      return Plan.FREE;
  }
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  let event: Stripe.Event;

  try {
    if (stripe && process.env.STRIPE_WEBHOOK_SECRET && signature) {
      event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(payload) as Stripe.Event;
    }
  } catch (error) {
    console.error('Invalid webhook signature', error);
    return new NextResponse('Invalid signature', {status: 400});
  }

  const data = event.data.object as any;

  try {
    if (event.type === 'checkout.session.completed') {
      const accountId = data.metadata?.accountId;
      if (accountId) {
        await prisma.subscription.upsert({
          where: {id: data.subscription ?? `${accountId}-sub`},
          update: {
            accountId,
            status: data.status ?? 'active',
            plan: planFromPrice(data.metadata?.priceId ?? data.display_items?.[0]?.price?.id ?? null),
            currentPeriodEnd: data.expires_at ? new Date(data.expires_at * 1000) : null
          },
          create: {
            id: data.subscription ?? `${accountId}-sub`,
            accountId,
            status: data.status ?? 'active',
            plan: planFromPrice(data.metadata?.priceId ?? data.display_items?.[0]?.price?.id ?? null),
            currentPeriodEnd: data.expires_at ? new Date(data.expires_at * 1000) : null
          }
        });
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = data as Stripe.Subscription;
      const accountId = subscription.metadata.accountId;
      if (accountId) {
        await prisma.subscription.upsert({
          where: {id: subscription.id},
          update: {
            status: subscription.status,
            plan: planFromPrice(subscription.items.data[0]?.price.id ?? null),
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null
          },
          create: {
            id: subscription.id,
            accountId,
            status: subscription.status,
            plan: planFromPrice(subscription.items.data[0]?.price.id ?? null),
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null
          }
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = data as Stripe.Subscription;
      const accountId = subscription.metadata.accountId;
      if (accountId) {
        await prisma.subscription.updateMany({
          where: {accountId},
          data: {plan: Plan.FREE, status: 'canceled'}
        });
      }
    }
  } catch (error) {
    console.error('Failed to process Stripe webhook', error);
    return new NextResponse('Webhook error', {status: 500});
  }

  return NextResponse.json({received: true});
}
