# Démarrage rapide

## 1. Installation des dépendances

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 2. Configuration des variables d'environnement

### Backend - Créer `.env.local`
```bash
cd backend
# Créer le fichier .env.local avec :
CONVEX_DEPLOYMENT=calculating-magpie-762
CONVEX_URL=https://calculating-magpie-762.convex.cloud
```

### Frontend - Créer `.env.local`
```bash
cd frontend
# Créer le fichier .env.local avec :
VITE_CONVEX_URL=https://calculating-magpie-762.convex.cloud
```

## 3. Démarrer le backend Convex

```bash
cd backend
npm run dev
```

Cette commande va :
- Se connecter à votre projet Convex (calculating-magpie-762)
- Synchroniser les schémas et fonctions
- Surveiller les changements en temps réel

⚠️ **Important** : Laissez cette fenêtre de terminal ouverte pendant le développement.

## 4. Démarrer le frontend

Dans un nouveau terminal :

```bash
cd frontend
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

## 5. Tester l'authentification

1. Ouvrez l'application dans votre navigateur
2. Cliquez sur "Sign Up" dans le header
3. Créez un compte de test :
   - Nom : Test User
   - Email : test@example.com
   - Mot de passe : test123
4. Vous serez automatiquement connecté
5. Testez la déconnexion avec le bouton "Déconnexion"

## Structure du projet

```
info/
├── backend/                 # Backend Convex
│   ├── convex/
│   │   ├── auth.ts         # Authentification
│   │   ├── users.ts        # Gestion utilisateurs
│   │   ├── posts.ts        # Gestion posts
│   │   ├── comments.ts     # Gestion commentaires
│   │   └── schema.ts       # Schémas de données
│   ├── convex.json         # Config Convex
│   └── package.json
│
└── frontend/               # Frontend React
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx       # Header avec auth
    │   │   └── AuthModal.jsx    # Modal connexion/inscription
    │   ├── hooks/
    │   │   ├── useAuth.js       # Hook authentification
    │   │   └── useConvex.js     # Hooks Convex
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json

```

## Commandes utiles

### Backend
- `npm run dev` - Démarrer en mode développement
- `npm run deploy` - Déployer en production

### Frontend
- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Build pour la production
- `npm run preview` - Prévisualiser le build de production

## Fonctionnalités disponibles

✅ Authentification complète (Sign In / Sign Up)  
✅ Gestion des utilisateurs  
✅ Gestion des posts  
✅ Gestion des commentaires  
✅ Interface moderne avec TailwindCSS  
✅ Communication temps réel avec Convex  

## Prochaines étapes

1. Personnaliser l'interface utilisateur
2. Ajouter des fonctionnalités métier
3. Implémenter la gestion des posts et commentaires
4. Ajouter des tests
5. Déployer en production

## Besoin d'aide ?

- Documentation Convex : https://docs.convex.dev
- Dashboard Convex : https://dashboard.convex.dev
- Voir `AUTHENTICATION.md` pour plus de détails sur l'authentification
- Voir `SETUP.md` pour la documentation complète
