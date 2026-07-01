import { describe, expect, it } from "vitest";
import { CredentialsError, parseCredentials } from "./credentials";

describe("parseCredentials", () => {
  it("accepte un couple valide", () => {
    expect(parseCredentials({ email: "a@b.com", password: "secret" })).toEqual({
      email: "a@b.com",
      password: "secret",
    });
  });

  it("rejette un corps non-objet", () => {
    expect(() => parseCredentials(null)).toThrow(CredentialsError);
    expect(() => parseCredentials("nope")).toThrow(CredentialsError);
  });

  it("rejette un e-mail sans @", () => {
    expect(() => parseCredentials({ email: "invalide", password: "secret" })).toThrow(
      CredentialsError,
    );
  });

  it("applique la longueur minimale du mot de passe", () => {
    expect(() => parseCredentials({ email: "a@b.com", password: "court" }, 8)).toThrow(
      CredentialsError,
    );
    // sous le minimum par défaut (login) : un mot de passe non vide passe
    expect(parseCredentials({ email: "a@b.com", password: "court" }).password).toBe("court");
  });

  it("rejette un mot de passe absent même au login", () => {
    expect(() => parseCredentials({ email: "a@b.com", password: "" })).toThrow(CredentialsError);
  });
});
