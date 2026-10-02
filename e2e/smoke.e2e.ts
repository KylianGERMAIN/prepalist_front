import type { Page } from "@playwright/test";
import { env, expect, test } from "./fixtures";

// L'UI est optimiste : sans attendre la Server Action, la navigation suivante part avant l'écriture.
const serverAction = (page: Page) =>
  page.waitForResponse((r) => r.request().method() === "POST" && !!r.request().headers()["next-action"]);

test("un repas planifié arrive dans la liste de courses, et la coche tient", async ({ page, account }) => {
  const meal = env("E2E_MEAL");
  const ingredient = env("E2E_INGREDIENT");

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(account.email);
  await page.getByLabel("Mot de passe").fill(account.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Mon plan" })).toBeVisible();

  await page.getByRole("button", { name: /Ajouter/ }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox").click();
  await page.getByPlaceholder("Rechercher un repas…").fill(meal);
  await page.getByRole("option", { name: meal }).click();
  await Promise.all([serverAction(page), dialog.getByRole("button", { name: "Enregistrer" }).click()]);

  await page.goto("/shopping-list");
  const row = page.getByRole("listitem").filter({ hasText: ingredient });
  await expect(row).toBeVisible();
  await Promise.all([serverAction(page), row.getByRole("checkbox").check()]);

  // Son rayon terminé se replie : la case n'est plus visible, d'où `includeHidden`.
  const checkbox = page
    .getByRole("listitem", { includeHidden: true })
    .filter({ hasText: ingredient })
    .getByRole("checkbox", { includeHidden: true });
  await page.reload();
  await expect(checkbox).toBeChecked();
});
