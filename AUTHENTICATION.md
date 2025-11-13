# Guide d'authentification

## Configuration

L'authentification est entièrement configurée entre le frontend et le backend Convex.

### Backend (Convex)

Le backend expose les mutations et queries suivantes dans `convex/auth.ts` :

#### Queries
- `getCurrentUser()` - Récupère l'utilisateur actuellement connecté

#### Mutations
- `signUp({ name, email, password })` - Inscription d'un nouvel utilisateur
- `signIn({ email, password })` - Connexion d'un utilisateur existant
- `signOut()` - Déconnexion

### Frontend (React)

#### Composants créés

1. **Header** (`src/components/Header.jsx`)
   - Affiche les boutons "Sign In" et "Sign Up"
   - Affiche le nom de l'utilisateur connecté
   - Bouton de déconnexion

2. **AuthModal** (`src/components/AuthModal.jsx`)
   - Modal popup pour l'authentification
   - Formulaire de connexion/inscription
   - Validation des champs
   - Gestion des erreurs

3. **Hook useAuth** (`src/hooks/useAuth.js`)
   - Gère l'état d'authentification
   - Fonctions `signUp`, `signIn`, `signOut`
   - Persistance dans localStorage
   - Communication avec le backend Convex

## Utilisation

### Dans un composant React

```jsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <p>Veuillez vous connecter</p>;
  }

  return (
    <div>
      <p>Bienvenue {user.name}</p>
      <button onClick={signOut}>Se déconnecter</button>
    </div>
  );
}
```

### Créer un compte

1. Cliquez sur le bouton "Sign Up" dans le header
2. Remplissez le formulaire :
   - Nom complet
   - Email
   - Mot de passe (minimum 6 caractères)
3. Cliquez sur "Créer mon compte"

### Se connecter

1. Cliquez sur le bouton "Sign In" dans le header
2. Entrez votre email et mot de passe
3. Cliquez sur "Se connecter"

### Se déconnecter

Cliquez sur le bouton "Déconnexion" dans le header (visible uniquement quand vous êtes connecté)

## Sécurité

⚠️ **Note importante** : Cette implémentation est une démonstration. Pour une application en production, vous devriez :

1. **Hasher les mots de passe** - Utiliser bcrypt ou argon2
2. **Utiliser JWT ou sessions** - Pour une authentification sécurisée
3. **Ajouter la validation côté serveur** - Valider tous les inputs
4. **Implémenter le rate limiting** - Prévenir les attaques par force brute
5. **Ajouter la vérification d'email** - Confirmer les adresses email
6. **Implémenter la réinitialisation de mot de passe**
7. **Utiliser HTTPS** - Toujours en production

## Intégration avec Convex Auth

Pour une authentification production-ready, considérez d'utiliser Convex Auth qui supporte :
- OAuth (Google, GitHub, etc.)
- Magic links
- Gestion sécurisée des sessions
- Tokens JWT

Documentation : https://docs.convex.dev/auth

## Structure des données

### Table Users

```typescript
{
  _id: Id<"users">,
  name: string,
  email: string,
  role: "admin" | "user",
  createdAt: number,
  tokenIdentifier?: string
}
```

### Données stockées dans localStorage

```json
{
  "userId": "k17...",
  "name": "Jean Dupont",
  "email": "jean@exemple.com",
  "role": "user"
}
```

## Dépannage

### L'utilisateur n'est pas persisté après rafraîchissement

Vérifiez que le localStorage n'est pas désactivé dans votre navigateur.

### Erreur "Un utilisateur avec cet email existe déjà"

Cet email est déjà enregistré. Utilisez "Sign In" à la place.

### Les mutations ne fonctionnent pas

1. Vérifiez que le backend Convex est démarré (`npm run dev` dans `/backend`)
2. Vérifiez la variable d'environnement `VITE_CONVEX_URL` dans `/frontend/.env.local`
3. Vérifiez la console du navigateur pour les erreurs
