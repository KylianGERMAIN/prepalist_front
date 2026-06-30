/**
 * Validation des identifiants à la frontière de confiance (Route Handlers).
 * Le back revalide via class-validator ; cette garde évite un aller-retour réseau
 * sur un corps manifestement invalide et normalise les messages côté front.
 */
export class CredentialsError extends Error {}

/**
 * Parse et valide un corps de requête en couple email/mot de passe.
 * @param body corps JSON brut (non fiable)
 * @param minPassword longueur minimale du mot de passe (8 à l'inscription, 1 à la connexion
 *   — on ne réimpose pas la règle d'inscription au login, un compte legacy pourrait y échouer)
 */
export function parseCredentials(
  body: unknown,
  minPassword = 1,
): { email: string; password: string } {
  if (typeof body !== "object" || body === null) {
    throw new CredentialsError("Corps de requête invalide.");
  }
  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== "string" || !email.includes("@")) {
    throw new CredentialsError("Adresse e-mail invalide.");
  }
  if (typeof password !== "string" || password.length < minPassword) {
    throw new CredentialsError(
      minPassword > 1
        ? `Le mot de passe doit faire au moins ${minPassword} caractères.`
        : "Mot de passe requis.",
    );
  }
  return { email, password };
}
