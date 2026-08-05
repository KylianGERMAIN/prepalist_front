# Changelog

Toutes les évolutions notables du front PrepaList sont documentées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet respecte le [Semantic Versioning](https://semver.org/lang/fr/).

## [0.4.0] - 2026-08-05

### Ajouté

- **Bouton « Vider » le planning**, derrière une confirmation qui énonce exactement ce qui est perdu : tous les créneaux et les items de liste déduits des plats, les items ajoutés à la main étant conservés. La confirmation réutilise le composant Dialog de l'app plutôt que le `confirm` natif, non stylable et bloquant pour le thread principal.
- **CI bloquante** : lint (zéro warning toléré), types, tests et build. Jusqu'ici seul le déploiement sur tag existait, les tests ne tournaient jamais avant la prod et les erreurs de types n'apparaissaient qu'au build post-tag. Ajout d'un script `typecheck`, `next build` ne vérifiant que le graphe de build, ce qui laissait les fichiers de test non vérifiés.

### Modifié

- **Un seul planning, plus de navigation entre semaines** : le front consomme `GET /plan` et `GET /plan/shopping-list` sans paramètre d'URL. L'état vide « aucune semaine à cette date » et le bouton de création disparaissent, le plan existe toujours. Les en-têtes de jour affichent le nom du jour déduit de la date d'ancrage et de l'index du jour, sans date, avec un suffixe de tour au-delà de sept jours (« Mar +1 »). La navigation ne transporte plus la semaine dans l'URL, ce qui retire les frontières Suspense qu'elle imposait au layout.
- **Réglage du jour de courses** : le libellé annonçait des bornes « du dîner de ce jour au déjeuner de la semaine suivante ». Les deux moitiés sont devenues fausses — les créneaux sont symétriques, et le réglage n'agit plus sur un planning existant, il ancre le suivant.

### Corrigé

- **Jour courant mis en évidence sur le mauvais jour entre minuit et 2h** : l'index du jour était calculé dans un composant client, donc le prérendu serveur utilisait le fuseau du déploiement et l'hydratation celui du navigateur. Il est désormais résolu côté serveur dans le fuseau de l'application. Depuis que les dates ont disparu de l'affichage, la mise en évidence est le seul repère temporel restant et un décalage d'un jour n'était plus détectable à l'œil.
- **Liste de courses vide après génération d'un planning** : l'API ne synchronise paresseusement qu'une liste entièrement vide, et un item manuel survivant la rendait non vide pour de bon. La synchronisation est maintenant enchaînée après la génération.
- **« Plan généré » annoncé alors que la liste restait obsolète** : le résultat de la synchronisation était ignoré. L'action revalide dans les deux cas et invite à synchroniser à la main quand cette étape a échoué.
- **Dialogue de confirmation fermable pendant l'action** : il se fermait par Échap, par clic sur le fond ou sur la croix alors que ses deux boutons étaient désactivés.

## [0.3.0] - 2026-07-03

### Ajouté

- **Liste de courses éditable** : cochage persistant (optimistic UI), ajout d'items manuels, édition et suppression de tout item, et un bouton « Synchroniser » qui complète la liste depuis les plats sans écraser les quantités modifiées ni les cochages.
- **Navigation entre semaines** : boutons ← / → pilotés par l'URL (`?week=`), partagés entre le planning et la liste de courses (même semaine des deux côtés), avec repère « semaine courante ».
- **Réglage du jour de courses** : page `/settings` pour choisir le jour qui borne la semaine ; le planning démarre sur ce jour.
- **Planning** : suppression rapide d'un repas, signaux visuels sur les repas et mise en page responsive par jour.
- **Version de l'app en pied de page**.

## [0.2.0] - 2026-07-02

### Modifié

- **Actions repas réservées aux admins** : les boutons créer / éditer / supprimer un repas sont masqués pour les utilisateurs non-administrateurs, en cohérence avec le RBAC de l'API.

## [0.1.0] - 2026-07-01

Refonte v2 du front PrepaList (Next.js App Router + shadcn/ui). Remplace la v1 (préservée sous le tag `legacy-v1`).

### Ajouté

- **Socle v2** : Next.js App Router, React Server Components, Tailwind v4, composants shadcn/ui (variante base-ui).
- **Authentification** : login / register / logout via cookies httpOnly, refresh transparent géré par le proxy, zone applicative protégée.
- **Repas** : liste paginée avec filtres (favori, tag, nom), création / édition avec lignes d'ingrédients (react-hook-form + `useFieldArray`), combobox ingrédient (recherche serveur + création à la volée), marquage « cuisiné », suppression.
- **Planificateur** : grille hebdomadaire 7 jours × midi/soir, assignation de repas et portions par créneau, génération automatique.
- **Liste de courses** : vue agrégée par semaine avec check-off.
- **Design** : design system Graphite.
- **Déploiement** : cible Vercel, déclenché sur tag de version (auto-deploy Git désactivé via `vercel.json`).

[0.3.0]: https://github.com/KylianGERMAIN/prepalist_front/releases/tag/v0.3.0
[0.2.0]: https://github.com/KylianGERMAIN/prepalist_front/releases/tag/v0.2.0
[0.1.0]: https://github.com/KylianGERMAIN/prepalist_front/releases/tag/v0.1.0
