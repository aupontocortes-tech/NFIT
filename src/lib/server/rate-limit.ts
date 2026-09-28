const buckets = new Map<string, number[]>();

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function tooFast(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  const list = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  buckets.set(key, list);
  return list.length > limit;
}

export function rateLimitResponse() {
  return Response.json(
    { error: { code: "RATE_LIMITED", message: "Muitas tentativas. Aguarde 1 minuto." } },
    { status: 429 },
  );
}
