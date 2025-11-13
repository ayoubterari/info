# Guide d'installation - Application Info

## Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Un compte Convex (https://convex.dev)

## Installation

### 1. Backend Convex

```bash
cd backend
npm install
```

### 2. Configuration Convex

Le projet est déjà configuré avec l'identifiant : **calculating-magpie-762**

Créez un fichier `.env.local` dans le dossier `backend` :

```env
CONVEX_DEPLOYMENT=calculating-magpie-762
CONVEX_URL=https://calculating-magpie-762.convex.cloud
```

### 3. Démarrer le backend Convex

```bash
cd backend
npm run dev
```

Cette commande va :
- Se connecter à votre projet Convex
- Synchroniser les schémas et fonctions
- Surveiller les changements en temps réel

### 4. Frontend React

```bash
cd frontend
npm install
```

### 5. Configuration Frontend

Créez un fichier `.env.local` dans le dossier `frontend` :

```env
VITE_CONVEX_URL=https://calculating-magpie-762.convex.cloud
```

### 6. Démarrer le frontend

```bash
cd frontend
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Structure du projet

```
info/
├── backend/
│   ├── convex/
│   │   ├── schema.ts          # Schémas de données
│   │   ├── users.ts           # Queries/mutations utilisateurs
│   │   ├── posts.ts           # Queries/mutations posts
│   │   └── comments.ts        # Queries/mutations commentaires
│   ├── convex.json            # Configuration Convex
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── hooks/
    │   │   └── useConvex.js   # Hooks personnalisés Convex
    │   ├── main.jsx           # Point d'entrée avec ConvexProvider
    │   └── App.jsx
    ├── convex/
    │   └── _generated/        # Types générés automatiquement
    └── package.json
```

## Utilisation de Convex

### Dans les composants React

```jsx
import { usePublishedPosts, useCreatePost } from './hooks/useConvex';

function MyComponent() {
  const posts = usePublishedPosts();
  const createPost = useCreatePost();

  const handleCreate = async () => {
    await createPost({
      title: "Mon titre",
      content: "Mon contenu",
      authorId: userId,
      published: true
    });
  };

  return (
    <div>
      {posts?.map(post => (
        <div key={post._id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## API Backend

### Users
- `getUsers` - Récupérer tous les utilisateurs
- `getUserById` - Récupérer un utilisateur par ID
- `getUserByEmail` - Récupérer un utilisateur par email
- `createUser` - Créer un utilisateur
- `updateUser` - Mettre à jour un utilisateur
- `deleteUser` - Supprimer un utilisateur

### Posts
- `getPublishedPosts` - Récupérer les posts publiés
- `getAllPosts` - Récupérer tous les posts
- `getPostById` - Récupérer un post par ID
- `getPostsByAuthor` - Récupérer les posts d'un auteur
- `createPost` - Créer un post
- `updatePost` - Mettre à jour un post
- `deletePost` - Supprimer un post
- `togglePublishPost` - Publier/dépublier un post

### Comments
- `getCommentsByPost` - Récupérer les commentaires d'un post
- `getCommentsByAuthor` - Récupérer les commentaires d'un auteur
- `getCommentById` - Récupérer un commentaire par ID
- `createComment` - Créer un commentaire
- `updateComment` - Mettre à jour un commentaire
- `deleteComment` - Supprimer un commentaire

## Déploiement

### Backend

```bash
cd backend
npm run deploy
```

### Frontend

```bash
cd frontend
npm run build
```

Les fichiers de production seront dans `frontend/dist/`

## Dépannage

### Erreurs TypeScript dans le backend

Les erreurs TypeScript disparaîtront après avoir exécuté `npm install` et `npm run dev` dans le dossier backend.

### Le frontend ne se connecte pas au backend

Vérifiez que :
1. Le backend Convex est démarré (`npm run dev` dans backend)
2. Le fichier `.env.local` du frontend contient la bonne URL Convex
3. L'URL correspond à votre projet : `https://calculating-magpie-762.convex.cloud`

## Ressources

- Documentation Convex : https://docs.convex.dev
- Dashboard Convex : https://dashboard.convex.dev
