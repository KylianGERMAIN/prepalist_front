export type ActionResult = { ok: true } | { ok: false; error: string };

/** NestJS renvoie `message` en string ou en string[] selon l'erreur. */
export function errorText(error: unknown, fallback = "Erreur inattendue."): string {
  const msg = (error as { message?: unknown } | null)?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return fallback;
}
