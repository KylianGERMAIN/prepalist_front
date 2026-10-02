import { execFileSync } from "node:child_process";
import { call } from "./api";

/**
 * Catalogue commun au run : un repas à un ingrédient, créé par un admin. Les specs
 * le lisent dans `process.env`, hérité par les workers.
 */
export default async function globalSetup() {
  const run = Date.now().toString(36);
  const admin = { email: `e2e-admin-${run}@example.com`, password: "e2e-password" };
  await call("/auth/register", admin);
  // Seul l'admin crée des repas, et ADMIN_EMAILS n'agit qu'au démarrage de l'API.
  execFileSync("psql", ["-v", "ON_ERROR_STOP=1", "-v", `email=${admin.email}`], {
    input: "UPDATE users SET role = 'ADMIN' WHERE email = :'email';",
  });
  const { accessToken } = await call<{ accessToken: string }>("/auth/login", admin);

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

  Object.assign(process.env, { E2E_MEAL: mealName, E2E_INGREDIENT: ingredientName });
}
