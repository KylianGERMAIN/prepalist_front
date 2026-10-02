import { expect, test } from "@playwright/test";

const env = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} absent : global-setup n'a pas tourné`);
  return value;
};

test("un repas planifié arrive dans la liste de courses, et la coche tient", async ({ page }) => {
  const meal = env("E2E_MEAL");
  const ingredient = env("E2E_INGREDIENT");

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(env("E2E_EMAIL"));
  await page.getByLabel("Mot de passe").fill(env("E2E_PASSWORD"));
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Mon plan" })).toBeVisible();

  await page.getByRole("button", { name: /Ajouter/ }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox").click();
  await page.getByPlaceholder("Rechercher un repas…").fill(meal);
  await page.getByRole("option", { name: meal }).click();
  await dialog.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText(meal).first()).toBeVisible();

  await page.goto("/shopping-list");
  const row = page.getByRole("listitem").filter({ hasText: ingredient });
  await expect(row).toBeVisible();
  await row.getByRole("checkbox").check();

  // Son rayon terminé se replie : la case n'est plus visible, d'où `includeHidden`.
  const checkbox = page
    .getByRole("listitem", { includeHidden: true })
    .filter({ hasText: ingredient })
    .getByRole("checkbox", { includeHidden: true });
  await expect(checkbox).toBeChecked();
  await page.reload();
  await expect(checkbox).toBeChecked();
});
