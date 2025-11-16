# Dashboard Administrateur

## Description

Le dashboard administrateur est une interface complète basée sur le template [shadcn-admin](https://github.com/satnaing/shadcn-admin) qui permet aux administrateurs de gérer l'application.

## Fonctionnalités

### 🔐 Accès Sécurisé
- Seuls les utilisateurs avec le rôle `admin` peuvent accéder au dashboard
- Redirection automatique vers `/admin` après connexion pour les admins
- Redirection vers `/dashboard` pour les utilisateurs normaux
- Protection de la route avec vérification du rôle

### 📊 Tableau de Bord Principal
- **Statistiques en temps réel** :
  - Total des utilisateurs
  - Total des demandes
  - Demandes complétées
  - Demandes en attente
- **Cartes de statistiques** avec indicateurs de tendance
- **Activité récente** : Affichage des dernières actions des utilisateurs
- **Table des utilisateurs** : Vue d'ensemble des utilisateurs inscrits

### 🎨 Interface Utilisateur
- Design moderne et responsive basé sur shadcn/ui
- Sidebar avec navigation intuitive
- Header avec barre de recherche et notifications
- Support du mode mobile avec menu hamburger
- Thème cohérent avec le reste de l'application

## Structure des Fichiers

```
frontend/src/
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.jsx      # Barre latérale de navigation
│   │   ├── AdminHeader.jsx       # En-tête avec recherche et profil
│   │   ├── StatsCard.jsx         # Carte de statistique réutilisable
│   │   ├── RecentActivity.jsx    # Composant d'activité récente
│   │   ├── UsersTable.jsx        # Table des utilisateurs
│   │   └── index.js              # Export des composants
│   └── ui/
│       ├── select.jsx            # Composant Select (nouveau)
│       ├── switch.jsx            # Composant Switch (nouveau)
│       └── ...                   # Autres composants UI
├── pages/
│   └── Admin.jsx                 # Page principale du dashboard admin
└── hooks/
    └── useAuth.js                # Hook d'authentification (modifié)
```

## Backend (Convex)

### Nouvelles Fonctions Ajoutées

**users.ts** :
```typescript
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
```

**offres.ts** :
```typescript
export const getAllOffres = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("offres").order("desc").collect();
  },
});
```

## Utilisation

### Accès au Dashboard

1. **Créer un utilisateur admin** :
   - Connectez-vous à la console Convex
   - Modifiez le rôle d'un utilisateur existant en `admin`
   - Ou créez un nouvel utilisateur avec le rôle `admin`

2. **Se connecter** :
   - Utilisez le formulaire de connexion
   - Si votre rôle est `admin`, vous serez automatiquement redirigé vers `/admin`

### Navigation

Le dashboard admin contient les sections suivantes :
- **Dashboard** (`/admin`) : Vue d'ensemble avec statistiques
- **Utilisateurs** (`/admin/users`) : Gestion des utilisateurs (à venir)
- **Demandes** (`/admin/demandes`) : Gestion des demandes (à venir)
- **Statistiques** (`/admin/stats`) : Statistiques détaillées (à venir)
- **Paramètres** (`/admin/settings`) : Configuration (à venir)

## Composants UI Ajoutés

### Select
Composant de sélection basé sur `@radix-ui/react-select`
```jsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
```

### Switch
Composant d'interrupteur basé sur `@radix-ui/react-switch`
```jsx
import { Switch } from '@/components/ui/switch'
```

## Dépendances Installées

```json
{
  "@radix-ui/react-select": "^latest",
  "@radix-ui/react-switch": "^latest",
  "@radix-ui/react-tooltip": "^latest"
}
```

## Personnalisation

### Modifier les Statistiques

Dans `Admin.jsx`, vous pouvez personnaliser les statistiques affichées :

```jsx
const stats = {
  totalUsers: allUsers.length,
  totalDemandes: allDemandes.length,
  completedDemandes: allDemandes.filter(d => d.status === 'completed').length,
  pendingDemandes: allDemandes.filter(d => d.status === 'pending').length,
}
```

### Ajouter des Sections

Pour ajouter une nouvelle section dans la sidebar, modifiez `AdminSidebar.jsx` :

```jsx
const menuItems = [
  // ... items existants
  {
    title: 'Nouvelle Section',
    icon: IconName,
    href: '/admin/nouvelle-section',
  },
]
```

## Sécurité

- ✅ Vérification du rôle côté client
- ✅ Redirection automatique pour les non-admins
- ⚠️ **Important** : Ajoutez une vérification côté serveur (Convex) pour sécuriser les mutations et queries sensibles

### Exemple de Sécurisation Backend

```typescript
export const adminOnlyMutation = mutation({
  args: { userId: v.id("users"), /* ... */ },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Accès non autorisé');
    }
    // ... logique de la mutation
  },
});
```

## Prochaines Étapes

- [ ] Implémenter la gestion complète des utilisateurs
- [ ] Ajouter la gestion des demandes depuis le dashboard
- [ ] Créer des graphiques de statistiques détaillées
- [ ] Ajouter un système de notifications en temps réel
- [ ] Implémenter les paramètres de configuration
- [ ] Ajouter des filtres et recherche avancée
- [ ] Créer des exports de données (CSV, PDF)

## Support

Pour toute question ou problème, consultez :
- [Documentation shadcn/ui](https://ui.shadcn.com)
- [Documentation Radix UI](https://www.radix-ui.com)
- [Template shadcn-admin](https://github.com/satnaing/shadcn-admin)
