import {promises as fs} from 'fs';
import {join, resolve} from 'path';
import crypto from 'crypto';

const storageDir = resolve(process.env.STORAGE_DIR ?? './public/storage');

async function ensureDir() {
  await fs.mkdir(storageDir, {recursive: true});
}

export async function saveFile(buffer: Buffer, originalName: string) {
  await ensureDir();
  const ext = originalName.split('.').pop();
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext ?? 'dat'}`;
  const destination = join(storageDir, filename);
  await fs.writeFile(destination, buffer);
  return {path: destination, filename};
}

export async function readFile(path: string) {
  return fs.readFile(path);
}
