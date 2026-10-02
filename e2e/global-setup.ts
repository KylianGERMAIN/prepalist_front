import { execFileSync } from "node:child_process";

const API = process.env.API_URL ?? "http://localhost:3000";

async function call<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

/**
 * Compte admin et repas à un ingrédient, propres au run. Les specs les lisent
 * dans `process.env`, hérité par les workers.
 */
export default async function globalSetup() {
  const run = Date.now().toString(36);
  const email = `e2e-${run}@example.com`;
  const password = "e2e-password";
  await call("/auth/register", { email, password });
  // Seul l'admin crée des repas, et ADMIN_EMAILS n'agit qu'au démarrage de l'API.
  execFileSync("psql", ["-v", "ON_ERROR_STOP=1", "-c", `UPDATE users SET role = 'ADMIN' WHERE email = '${email}'`]);
  const { accessToken } = await call<{ accessToken: string }>("/auth/login", { email, password });

  const ingredientName = `Tomate ${run}`;
  const mealName = `Salade ${run}`;
  const ingredient = await call<{ id: string }>(
    "/ingredients",
    { name: ingredientName, defaultUnit: "pièce", aisle: "PRODUCE" },
    accessToken,
  );
  await call(
    "/meals",
    { name: mealName, ingredients: [{ ingredientId: ingredient.id, quantity: 2, unit: "pièce" }] },
    accessToken,
  );

  Object.assign(process.env, {
    E2E_EMAIL: email,
    E2E_PASSWORD: password,
    E2E_MEAL: mealName,
    E2E_INGREDIENT: ingredientName,
  });
}
