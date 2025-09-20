import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth';
import {saveFile} from '@/lib/storage';
import {prisma} from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !session.activeAccountId) {
    return new NextResponse('Unauthorized', {status: 401});
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const contractId = formData.get('contractId')?.toString();
  if (!(file instanceof File)) {
    return new NextResponse('No file', {status: 400});
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await saveFile(buffer, file.name);

  await prisma.fileAsset.create({
    data: {
      accountId: session.activeAccountId,
      contractId: contractId ?? undefined,
      path: stored.path,
      mime: file.type,
      size: file.size
    }
  });

  return NextResponse.json({path: stored.path});
}
