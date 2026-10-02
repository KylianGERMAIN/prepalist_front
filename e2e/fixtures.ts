import { randomUUID } from "node:crypto";
import { test as base, expect } from "@playwright/test";
import { call } from "./api";

type Account = { email: string; password: string };

/** Un compte neuf par test : le plan est un singleton par utilisateur, partagé il serait piétiné en parallèle. */
export const test = base.extend<{ account: Account }>({
  account: async ({}, provide) => {
    const account = { email: `e2e-${randomUUID()}@example.com`, password: "e2e-password" };
    await call("/auth/register", account);
    await provide(account);
  },
});

export { expect };

export function env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} absent : global-setup n'a pas tourné`);
  return value;
}
