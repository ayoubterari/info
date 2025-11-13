# Module de Gestion de Profil Utilisateur

## 📋 Vue d'ensemble

Le module de gestion de profil permet aux utilisateurs de visualiser et modifier leurs informations personnelles depuis le dashboard.

## ✨ Fonctionnalités

### 1. **Affichage du Profil**
- Avatar avec initiales de l'utilisateur
- Nom complet
- Email
- Rôle (admin/user)
- Date d'inscription

### 2. **Modification du Profil**
- Édition du nom complet
- Modification de l'email (avec vérification d'unicité)
- Validation en temps réel
- Messages de succès/erreur

### 3. **Gestion du Compte**
- Suppression du compte (avec confirmation)
- Suppression automatique de toutes les données associées:
  - Conversations
  - Demandes
  - Offres

## 🗂️ Structure des Fichiers

### Frontend
```
frontend/src/
├── pages/
│   └── Profile.jsx              # Page principale du profil
├── components/
│   └── ui/
│       ├── input.jsx            # Composant Input
│       ├── label.jsx            # Composant Label
│       ├── avatar.jsx           # Composant Avatar
│       ├── separator.jsx        # Composant Separator
│       └── alert.jsx            # Composant Alert
```

### Backend
```
backend/convex/
└── users.js                     # Mutations et queries pour les utilisateurs
    ├── getUser()                # Récupérer un utilisateur
    ├── updateProfile()          # Mettre à jour le profil
    ├── changePassword()         # Changer le mot de passe
    └── deleteAccount()          # Supprimer le compte
```

## 🚀 Utilisation

### Accéder au Profil
1. Connectez-vous à l'application
2. Accédez au dashboard (`/dashboard`)
3. Cliquez sur le bouton "Mon Profil" dans le menu de navigation
4. Ou cliquez sur votre nom dans le header

### Modifier le Profil
1. Sur la page de profil, cliquez sur "Modifier le profil"
2. Modifiez les champs souhaités (nom, email)
3. Cliquez sur "Enregistrer"
4. Les modifications sont sauvegardées et le profil est mis à jour

### Supprimer le Compte
1. Descendez jusqu'à la "Zone dangereuse"
2. Cliquez sur "Supprimer"
3. Confirmez la suppression dans la boîte de dialogue
4. Le compte et toutes les données associées sont supprimés

## 🔧 API Backend

### `getUser(userId)`
Récupère les informations d'un utilisateur.

**Paramètres:**
- `userId`: ID de l'utilisateur (type: `Id<"users">`)

**Retour:**
```javascript
{
  userId: string,
  name: string,
  email: string,
  role: "admin" | "user",
  createdAt: number,
  questionsAsked: number,
  questionsLimit: number
}
```

### `updateProfile(userId, name?, email?)`
Met à jour le profil d'un utilisateur.

**Paramètres:**
- `userId`: ID de l'utilisateur (type: `Id<"users">`)
- `name`: Nouveau nom (optionnel)
- `email`: Nouvel email (optionnel)

**Retour:**
```javascript
{
  success: true,
  message: "Profil mis à jour avec succès",
  userId: string,
  name: string,
  email: string,
  role: string
}
```

**Erreurs:**
- "Utilisateur non trouvé"
- "Cet email est déjà utilisé"

### `deleteAccount(userId)`
Supprime un compte utilisateur et toutes ses données.

**Paramètres:**
- `userId`: ID de l'utilisateur (type: `Id<"users">`)

**Retour:**
```javascript
{
  success: true,
  message: "Compte supprimé avec succès"
}
```

## 🎨 Composants UI

### Input
Champ de saisie stylisé avec support de validation.

```jsx
<Input
  id="name"
  name="name"
  type="text"
  value={value}
  onChange={handleChange}
  disabled={!isEditing}
  required
/>
```

### Avatar
Affichage d'avatar avec fallback sur les initiales.

```jsx
<Avatar className="h-24 w-24">
  <AvatarFallback className="text-2xl bg-black text-white">
    {initials}
  </AvatarFallback>
</Avatar>
```

### Label
Label pour les champs de formulaire.

```jsx
<Label htmlFor="email">
  <Mail className="inline mr-2 h-4 w-4" />
  Email
</Label>
```

## 🔐 Sécurité

- Validation des emails (unicité)
- Confirmation avant suppression de compte
- Protection des routes (redirection si non authentifié)
- Mise à jour du localStorage après modification

## 📱 Responsive Design

Le module est entièrement responsive:
- **Mobile**: Layout en colonne unique
- **Tablet**: Grid à 2 colonnes
- **Desktop**: Grid à 3 colonnes avec sidebar

## 🎯 Prochaines Améliorations

- [ ] Upload d'image de profil
- [ ] Changement de mot de passe fonctionnel
- [ ] Historique des modifications
- [ ] Préférences utilisateur (langue, notifications)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Export des données personnelles (RGPD)

## 🐛 Dépannage

### Le profil ne se charge pas
- Vérifiez que l'utilisateur est bien connecté
- Vérifiez le localStorage (`user` doit être présent)
- Vérifiez la console pour les erreurs

### Les modifications ne sont pas sauvegardées
- Vérifiez que le backend Convex est en cours d'exécution
- Vérifiez les permissions de la mutation `updateProfile`
- Vérifiez que l'email n'est pas déjà utilisé

### Erreur lors de la suppression
- Vérifiez que toutes les relations sont bien supprimées
- Vérifiez les index dans le schéma Convex
