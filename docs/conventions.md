# Conventions

Chaque convention cite le fichier et le symbole qui l'appliquent, jamais un numéro de ligne. Une PR qui change une convention met ce document à jour.

## Mutation optimiste : `useOptimistic` + transition + toast « Annuler »

Schéma suivi par les trois écrans éditables : `PlanGrid` (`src/app/(app)/plan-grid.tsx`), `MealsTable` (`src/app/(app)/meals/meals-table.tsx`), `ShoppingListView` (`src/app/(app)/shopping-list/shopping-list-view.tsx`).

1. `useOptimistic(props, reducer)` dérive l'état affiché des props serveur. Le reducer est une fonction pure : `stateReducer` dans `meals-table.tsx`, `slotsReducer` dans `planner-utils.ts` (testé dans `planner-utils.test.ts`), `shoppingItemsReducer` dans `shopping-list-utils.ts`.
2. Dans `startTransition(async () => …)` : `dispatch` de l'action optimiste, puis `await` de la Server Action.
3. Sur `!res.ok` : `toast.error(res.error)`. L'état optimiste est abandonné à la fin de la transition.
4. Sur succès, quand l'action détruit quelque chose : `toast.success(…, { action: { label: "Annuler", onClick } })`, où `onClick` rejoue l'opération inverse.

Exemple réel, `handleClear` dans `PlanGrid` :

```tsx
  function handleClear(slot: PlanSlot) {
    if (!slot.meal && !slot.away) return;
    const meal = slot.meal;
    const servings = slot.servings;
    startTransition(async () => {
      dispatch({ type: "clear", slotId: slot.id });
      const res = await assignSlot(slot.id, null);
      if (!res.ok) toast.error(res.error);
      else if (meal) {
        toast.success("Créneau vidé", {
          action: { label: "Annuler", onClick: () => handleUndo(slot.id, meal, servings) },
        });
      } else {
        toast.success("Créneau vidé");
      }
    });
  }
```

Les valeurs nécessaires à l'annulation (`meal`, `servings`) sont capturées avant la transition. `handleUndo` repasse par le même schéma.

Autres « Annuler » : `handleMove` dans `PlanGrid`, qui rejoue le déplacement en sens inverse ; `removeOne` dans `ShoppingListView`, qui recrée l'article manuel par `addManualItem` ; `checkInStore` dans `ShoppingListView`, qui décoche en mode magasin.

## `ActionResult` et `errorText`

`src/lib/action-result.ts` :

```ts
export type ActionResult = { ok: true } | { ok: false; error: string };

/** NestJS renvoie `message` en string ou en string[] selon l'erreur. */
export function errorText(error: unknown, fallback = "Erreur inattendue."): string {
  const msg = (error as { message?: unknown } | null)?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return fallback;
}
```

- `ActionResult` est le type de retour des Server Actions de mutation : l'erreur arrive au client comme une valeur, pas comme une exception.
- Une action de création qui doit rendre la ressource étend la même union en ligne : `createQuickMeal` (`planner-actions.ts`), `createIngredient` (`meals/actions.ts`).
- Les actions de lecture renvoient la donnée ou une valeur vide, pas un `ActionResult` : `getMeal`, `searchIngredients`, `searchMeals`.
- `errorText` sert aussi à `postAuth` (`src/lib/auth.ts`), côté Route Handlers d'auth.

Forme type d'une action, `toggleChecked` dans `src/app/(app)/shopping-list/shopping-list-actions.ts` :

```ts
export async function toggleChecked(
  itemId: string,
  checked: boolean,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/plan/shopping-list/items/{itemId}", {
    params: { path: { itemId } },
    body: { checked },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}
```

## Composition base-ui : `render=`, pas `asChild`

Les composants de `src/components/ui/` enveloppent `@base-ui/react`, pas Radix (imports de `button.tsx` et `dialog.tsx`, style `base-nova` dans `components.json`). Pour rendre un primitif avec un autre élément, on passe l'élément en prop `render` ; `asChild` n'existe pas et n'apparaît nulle part dans `src/`.

```tsx
<DialogTrigger render={trigger} />
```

Extrait de `ConfirmDialog` (`src/components/confirm-dialog.tsx`). Autres cas : un `Badge` rendu en `Link` pour filtrer sur un tag (`MealRow`, `meals-table.tsx`), le bouton de fermeture rendu en `Button` (`DialogFooter`, `dialog.tsx`). `Badge` s'appuie sur `useRender` de base-ui (`src/components/ui/badge.tsx`).

Attention, `render={({ field }) => …}` dans `MealDialog` (`src/app/(app)/meals/meal-dialog.tsx`) est la prop de `Controller` (react-hook-form), pas de base-ui.

## Structure des dossiers

```text
src/
  proxy.ts                garde des routes + refresh (ex-middleware)
  app/
    (auth)/               /login, /register : pages publiques
    (app)/                zone connectée : planner (/), meals/, shopping-list/, settings/
      *actions.ts         Server Actions de l'écran ("use server") : planner-actions.ts, meals/actions.ts…
      *-utils.ts          logique pure (reducers, formatage)
    api/auth/*/route.ts   Route Handlers login, register, logout
    globals.css           tokens de thème, variantes Tailwind
  components/
    ui/                   composants shadcn (base-ui)
    *.tsx                 composants partagés du projet (confirm-dialog, tag-input…)
  hooks/                  hooks partagés (use-live-refresh, use-wake-lock)
  lib/                    client API, auth, cookies, types, utilitaires
```

- Les fichiers d'un écran sont colocalisés dans son segment de route (`src/app/(app)/shopping-list/`).
- Les tests sont à côté du fichier testé, en `*.test.ts(x)` (`planner-utils.test.ts`, `use-live-refresh.test.tsx`).
- `src/lib/models.ts` réexporte sous des noms courts les types générés ; il est purement typé, donc importable côté serveur comme côté client.

## Tokens de thème

`src/app/globals.css` :

- Les valeurs sont des variables CSS en `oklch`, définies dans `:root` et redéfinies sous `.dark`.
- `@theme inline` les expose à Tailwind sous forme de classes (`bg-primary`, `text-muted-foreground`…).
- Le mode sombre suit la classe `.dark` (`@custom-variant dark`), posée par `next-themes` avec `attribute="class"` (`ThemeProvider` dans `RootLayout`, `src/app/layout.tsx`).
- Ajouts au jeu shadcn : `--warning` / `--warning-foreground`, utilisés par le bandeau des repas incomplets de `ShoppingListPage` ; la classe `.tnum` pour les chiffres tabulaires.
- Palette « Graphite » : encre en `primary` pour l'action, bleu en `accent` pour l'état (commit `bdbdc56`).

À ce jour, aucune couleur en dur (hex, `oklch`, palette Tailwind `bg-red-500`…) n'apparaît dans `src/` hors de `globals.css`.

## Variante Tailwind `store:`

Déclarée dans `globals.css` par `@custom-variant store (&:where([data-store-mode] *));`. Elle s'applique quand un ancêtre porte `data-store-mode`.

- `ShoppingListView` pose l'attribut sur `body` tant que le mode magasin est actif et le retire au démontage (`useEffect` sur `storeMode`).
- Les éléments à masquer en magasin portent `store:hidden` : `BottomNav` (`nav-links.tsx`), `Footer` (`footer.tsx`), le bouton Restaurer et le bandeau d'alerte de `ShoppingListPage`.

Intérêt : des Server Components comme le footer réagissent à un état client sans devenir Client Components.

## Types générés depuis l'OpenAPI

- `src/lib/api-types.ts` est généré par `pnpm gen:api` : ne pas l'éditer à la main.
- Un changement de contrat API se reprend par un commit dédié `chore(api-types): …`.
- Les composants importent les alias de `src/lib/models.ts`, pas `components["schemas"]` directement.

Contexte, source du schéma et conséquences : [ADR 0002](adr/0002-client-openapi-genere.md).
