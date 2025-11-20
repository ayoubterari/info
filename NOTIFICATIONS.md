# Système de Notifications Push

## Vue d'ensemble

Le système de notifications push permet aux utilisateurs de recevoir des notifications en temps réel lorsqu'ils reçoivent une nouvelle offre sur leurs demandes.

## Fonctionnalités

### 1. Notifications en base de données
- **Table `notifications`** dans Convex avec les champs :
  - `userId` : Destinataire de la notification
  - `type` : Type de notification (new_offre, offre_accepted, etc.)
  - `title` : Titre de la notification
  - `message` : Message détaillé
  - `relatedId` : ID de l'entité liée (offre, demande)
  - `relatedType` : Type de l'entité liée
  - `read` : Statut de lecture
  - `createdAt` : Date de création

### 2. Notifications Push du navigateur
- Demande automatique de permission au chargement
- Affichage de notifications natives du système d'exploitation
- Support sur desktop et mobile (si le navigateur le permet)
- Auto-fermeture après 5 secondes
- Clic sur la notification pour naviguer vers la page appropriée

### 3. Interface utilisateur
- **Icône de cloche** dans le header avec badge de compteur
- **Dropdown** affichant toutes les notifications
- Distinction visuelle entre notifications lues/non lues
- Bouton "Tout marquer comme lu"
- Formatage intelligent des dates (il y a Xmin, Xh, Xj)

## Backend (Convex)

### Fichiers modifiés/créés

#### `backend/convex/schema.ts`
Ajout de la table `notifications` avec indexes optimisés :
```typescript
notifications: defineTable({
  userId: v.id("users"),
  type: v.union(...),
  title: v.string(),
  message: v.string(),
  relatedId: v.optional(v.string()),
  relatedType: v.optional(v.string()),
  read: v.boolean(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_read", ["read"])
  .index("by_user_read", ["userId", "read"])
  .index("by_date", ["createdAt"])
```

#### `backend/convex/notifications.ts`
Nouvelles mutations et queries :
- `createNotification` : Créer une notification
- `getUserNotifications` : Récupérer toutes les notifications d'un utilisateur
- `getUnreadNotifications` : Récupérer les notifications non lues
- `countUnreadNotifications` : Compter les notifications non lues
- `markNotificationAsRead` : Marquer une notification comme lue
- `markAllNotificationsAsRead` : Marquer toutes les notifications comme lues
- `deleteNotification` : Supprimer une notification
- `deleteReadNotifications` : Supprimer toutes les notifications lues

#### `backend/convex/offres.ts`
Modification de `createOffre` pour créer automatiquement une notification :
```typescript
// Créer une notification pour le demandeur
if (demande.userId) {
  await ctx.db.insert("notifications", {
    userId: demande.userId,
    type: "new_offre",
    title: "Nouvelle offre reçue !",
    message: `${offreurName} a proposé son aide pour "${demande.title}" au prix de ${args.proposedPrice.toFixed(2)}€`,
    relatedId: offreId,
    relatedType: "offre",
    read: false,
    createdAt: Date.now(),
  });
}
```

## Frontend (React)

### Fichiers créés/modifiés

#### `frontend/src/components/NotificationBell.jsx`
Composant principal de notifications avec :
- Affichage du badge de compteur
- Dropdown des notifications
- Gestion des notifications push du navigateur
- Détection des nouvelles notifications en temps réel
- Navigation vers les pages appropriées

#### `frontend/src/components/Header.jsx`
Intégration du composant `NotificationBell` dans le header

## Utilisation

### Pour l'utilisateur

1. **Première visite** : Le navigateur demande la permission d'afficher des notifications
2. **Réception d'une offre** : 
   - Une notification push apparaît sur le téléphone/ordinateur
   - Le badge de la cloche affiche le nombre de notifications non lues
   - La notification est visible dans le dropdown
3. **Clic sur une notification** :
   - Marque la notification comme lue
   - Redirige vers la page appropriée (/mes-demandes pour les offres)

### Pour le développeur

#### Créer une notification personnalisée
```javascript
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

const createNotification = useMutation(api.notifications.createNotification)

await createNotification({
  userId: targetUserId,
  type: "new_offre",
  title: "Titre de la notification",
  message: "Message détaillé",
  relatedId: "id_de_l_entite",
  relatedType: "offre"
})
```

#### Récupérer les notifications
```javascript
const notifications = useQuery(
  api.notifications.getUserNotifications,
  { userId: user.userId }
)
```

## Types de notifications supportés

- `new_offre` : Nouvelle offre reçue
- `offre_accepted` : Offre acceptée
- `offre_rejected` : Offre rejetée
- `payment_received` : Paiement reçu
- `demande_completed` : Demande terminée

## Permissions navigateur

### Desktop
- Chrome/Edge : ✅ Support complet
- Firefox : ✅ Support complet
- Safari : ✅ Support complet (macOS 10.14+)

### Mobile
- Chrome Android : ✅ Support complet
- Safari iOS : ⚠️ Support limité (nécessite PWA installée)
- Firefox Android : ✅ Support complet

## Améliorations futures possibles

1. **Notifications par email** pour les utilisateurs qui n'ont pas activé les notifications push
2. **Notifications SMS** pour les événements critiques
3. **Paramètres de notification** permettant aux utilisateurs de choisir quels types de notifications recevoir
4. **Groupement de notifications** pour éviter le spam
5. **Sons personnalisés** pour différents types de notifications
6. **Rich notifications** avec images et actions
7. **Service Worker** pour les notifications même quand l'application est fermée

## Notes importantes

- Les notifications push nécessitent HTTPS en production
- Les utilisateurs peuvent bloquer les notifications à tout moment
- Les notifications sont stockées en base de données même si l'utilisateur refuse les notifications push
- Le système fonctionne en temps réel grâce à Convex
