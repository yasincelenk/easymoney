const buckets = new Map<string, {tokens: number; updatedAt: number}>();

export function rateLimit({
  key,
  windowMs,
  tokens
}: {
  key: string;
  windowMs: number;
  tokens: number;
}) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, {tokens: tokens - 1, updatedAt: now});
    return {success: true};
  }

  const elapsed = now - bucket.updatedAt;
  if (elapsed > windowMs) {
    bucket.tokens = tokens - 1;
    bucket.updatedAt = now;
    return {success: true};
  }

  if (bucket.tokens <= 0) {
    return {success: false};
  }

  bucket.tokens -= 1;
  bucket.updatedAt = now;
  return {success: true};
}
