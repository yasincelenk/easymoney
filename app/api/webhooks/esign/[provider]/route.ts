import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function POST(request: Request, {params}: {params: {provider: string}}) {
  const payload = await request.json().catch(() => ({}));
  console.info('Received e-sign webhook', params.provider, payload);
  if (payload.contractId && payload.status) {
    await prisma.signature.updateMany({
      where: {contractId: payload.contractId},
      data: {status: payload.status}
    });
  }
  return NextResponse.json({received: true});
}
