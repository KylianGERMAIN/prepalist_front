# Changelog

Toutes les évolutions notables du front PrepaList sont documentées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet respecte le [Semantic Versioning](https://semver.org/lang/fr/).

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
