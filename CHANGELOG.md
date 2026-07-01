# Changelog

Toutes les évolutions notables du front PrepaList sont documentées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet respecte le [Semantic Versioning](https://semver.org/lang/fr/).

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

[0.1.0]: https://github.com/KylianGERMAIN/prepalist_front/releases/tag/v0.1.0
