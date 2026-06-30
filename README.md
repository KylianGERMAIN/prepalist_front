# PrepaList — Front

Front web de PrepaList (meal-prep : planifier ses repas de la semaine + liste de courses).

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind v4 + shadcn/ui (variante base-ui) ·
react-hook-form + zod · openapi-fetch (client typé généré depuis le Swagger du back) ·
next-themes (dark mode). pnpm.

## Architecture

- **Auth par cookies httpOnly.** Le navigateur ne tape jamais le back en direct : il passe
  par les Route Handlers `src/app/api/auth/*` qui posent les tokens (`pl_access` / `pl_refresh`)
  en cookies httpOnly.
- **`src/proxy.ts`** (ex-middleware Next 16) garde les routes et rafraîchit le token de façon
  transparente (l'access expire à 15 min → refresh via le cookie refresh).
- **Server Components + Server Actions** pour les données et les mutations : `serverApi()`
  (`src/lib/api.ts`) lit le cookie access et le relaie en `Authorization: Bearer` au back.
- **Types API** générés depuis le Swagger du back (`pnpm gen:api`).

## Prérequis

- Node 22, pnpm.
- Le **back NestJS** (`prepalist_api`) lancé et accessible (Swagger sur `/docs-json` pour la
  génération de types).

## Variables d'environnement

| Variable  | Description                               | Requis                       |
|-----------|-------------------------------------------|------------------------------|
| `API_URL` | URL du back NestJS (lue **côté serveur**) | en prod (fail-fast au boot)  |

Copier `.env.example` → `.env.local` pour le dev (défaut `http://localhost:3000`).

## Développement

```bash
pnpm install
pnpm gen:api        # génère src/lib/api-types.ts depuis http://localhost:3000/docs-json (back lancé)
pnpm dev            # http://localhost:3001 (3000 étant pris par le back)
```

## Qualité

```bash
pnpm lint
pnpm test           # vitest
pnpm build
```

## Déploiement

Build autonome activé (`output: "standalone"` dans `next.config.ts`).

- **Vercel** : connecter le repo, définir `API_URL`. Rien d'autre.
- **Docker** :
  ```bash
  docker build -t prepalist-front .
  docker run -p 3000:3000 -e API_URL=https://api.exemple.com prepalist-front
  ```
  `API_URL` est un besoin **runtime** (injecté au `run`, pas au build).
