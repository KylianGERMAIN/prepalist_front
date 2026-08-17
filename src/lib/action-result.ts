/**
 * `ok: false` = l'effet principal n'a pas eu lieu ; `warning` = il a eu lieu mais un
 * effet secondaire a échoué. Ne pas conflater les deux, `ok` seul est trompeur.
 */
export type ActionResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

/** NestJS renvoie `message` en string ou en string[] selon l'erreur. */
export function errorText(error: unknown, fallback = "Erreur inattendue."): string {
  const msg = (error as { message?: unknown } | null)?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return fallback;
}
