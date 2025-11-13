# Backend Convex - Application Info

## Configuration

Ce backend utilise Convex comme Backend-as-a-Service.

**Projet Convex:** calculating-magpie-762

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Cette commande lance le serveur de développement Convex et synchronise automatiquement vos fonctions.

## Déploiement

```bash
npm run deploy
```

## Structure

- `convex/` - Contient toutes les fonctions Convex (queries, mutations, actions)
- `convex/schema.ts` - Définition du schéma de données
- `convex.json` - Configuration du projet Convex

## API

Le backend expose des queries (lecture) et des mutations (écriture) accessibles depuis le frontend via le client Convex.
