# Onglet Mes Demandes - Dashboard

## 📋 Vue d'ensemble

L'onglet "Mes Demandes" permet aux utilisateurs de visualiser et gérer toutes leurs demandes d'aide directement depuis le dashboard.

## ✨ Fonctionnalités

### 1. **Tableau des demandes**
- Liste complète de toutes les demandes créées par l'utilisateur
- Colonnes:
  - **Titre** - Titre de la demande
  - **Catégorie** - Catégorie avec badge coloré
  - **Prix** - Prix proposé formaté en devise
  - **Statut** - Badge coloré selon le statut
  - **Date** - Date et heure de création
  - **Actions** - Boutons pour voir et supprimer

### 2. **Badges de statut**
- 🟡 **En attente** (pending) - Jaune
- 🔵 **En cours** (in_progress) - Bleu
- 🟢 **Terminée** (completed) - Vert
- 🔴 **Annulée** (cancelled) - Rouge

### 3. **Statistiques**
- **Total** - Nombre total de demandes
- **En attente** - Nombre de demandes en attente
- **En cours** - Nombre de demandes en cours
- **Terminées** - Nombre de demandes terminées

### 4. **Actions**
- 👁️ **Voir** - Afficher les détails de la demande
- 🗑️ **Supprimer** - Supprimer la demande
- ➕ **Nouvelle demande** - Créer une nouvelle demande

### 5. **État vide**
- Message informatif quand aucune demande n'existe
- Bouton pour créer la première demande

## 🏗️ Architecture

### Composants créés

**frontend/src/components/ui/table.jsx**
- Composants de tableau réutilisables
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`

**frontend/src/components/ui/badge.jsx**
- Composant Badge avec variantes de couleurs
- Variantes: default, secondary, destructive, success, warning, info

**frontend/src/components/dashboard/DemandesTab.jsx**
- Composant principal de l'onglet Demandes
- Utilise `useQuery` pour récupérer les demandes
- Affiche le tableau et les statistiques

### Query Convex utilisée

**backend/convex/demandes.ts - getUserDemandes**
```typescript
export const getUserDemandes = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    const demandes = await ctx.db
      .query("demandes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return demandes;
  },
});
```

## 🎨 Interface utilisateur

### Tableau responsive
- Design moderne avec bordures et hover effects
- Responsive sur mobile, tablette et desktop
- Couleurs cohérentes avec le design system

### Badges de statut
```javascript
const statusConfig = {
  pending: { variant: 'warning', label: 'En attente' },
  in_progress: { variant: 'info', label: 'En cours' },
  completed: { variant: 'success', label: 'Terminée' },
  cancelled: { variant: 'destructive', label: 'Annulée' },
}
```

### Format des données
- **Date**: Format français (JJ/MM/AAAA HH:MM)
- **Prix**: Format monétaire USD avec symbole $
- **Catégorie**: Badge secondaire

## 🔄 Flux de navigation

```
Dashboard
  ↓
Onglet "Mes Demandes"
  ↓
Tableau des demandes
  ↓
Actions:
  - Voir → /demandes?id={demandeId}
  - Supprimer → Suppression de la demande
  - Nouvelle → /human-service
```

## 📦 Fichiers modifiés/créés

### Créés
- ✅ `frontend/src/components/ui/table.jsx`
- ✅ `frontend/src/components/ui/badge.jsx`
- ✅ `frontend/src/components/dashboard/DemandesTab.jsx`
- ✅ `DEMANDES_TAB.md`

### Modifiés
- ✅ `frontend/src/pages/Dashboard.jsx`
  - Import de `DemandesTab`
  - Ajout de l'onglet "Mes Demandes"
  - Ajout du `TabsContent` pour les demandes

## 🚀 Utilisation

### Accéder à l'onglet Demandes

1. Connectez-vous à l'application
2. Accédez au dashboard
3. Cliquez sur l'onglet "Mes Demandes"

### Créer une nouvelle demande

1. Dans l'onglet "Mes Demandes"
2. Cliquez sur "Nouvelle demande"
3. Remplissez le formulaire sur la page /human-service

### Voir les détails d'une demande

1. Dans le tableau, cliquez sur l'icône 👁️
2. Vous serez redirigé vers la page de détails

### Supprimer une demande

1. Dans le tableau, cliquez sur l'icône 🗑️
2. Confirmez la suppression (à implémenter)

## 📊 Statistiques affichées

Les cartes de statistiques affichent:
- **Total**: Nombre total de demandes
- **En attente**: Filtre `status === 'pending'`
- **En cours**: Filtre `status === 'in_progress'`
- **Terminées**: Filtre `status === 'completed'`

## 🎯 Prochaines améliorations

- [ ] Implémenter la suppression de demande avec confirmation
- [ ] Ajouter un filtre par statut
- [ ] Ajouter une recherche par titre
- [ ] Ajouter un tri par colonne
- [ ] Pagination pour les grandes listes
- [ ] Export des demandes en CSV/PDF
- [ ] Affichage des offres reçues pour chaque demande
- [ ] Modification de demande en cours
- [ ] Notifications pour les nouvelles offres

## 🐛 Dépannage

### Les demandes ne s'affichent pas

**Vérifications:**
1. L'utilisateur est bien connecté
2. Le backend Convex est en cours d'exécution
3. La query `getUserDemandes` fonctionne
4. L'utilisateur a bien créé des demandes

**Console:**
```javascript
// Vérifier les demandes dans la console
console.log(demandes)
```

### Le tableau est vide

**Causes possibles:**
- Aucune demande créée
- `userId` incorrect
- Problème de connexion à Convex

**Solution:**
1. Créer une première demande via /human-service
2. Vérifier que `user.userId` est correct
3. Vérifier les logs Convex

### Les badges ne s'affichent pas correctement

**Vérification:**
- Le composant Badge est bien importé
- Les variantes sont définies
- Les classes Tailwind sont compilées

## 💡 Exemples de code

### Utiliser le composant Table

```jsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Colonne 1</TableHead>
      <TableHead>Colonne 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Valeur 1</TableCell>
      <TableCell>Valeur 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Utiliser le composant Badge

```jsx
import { Badge } from '../ui/badge'

<Badge variant="success">Terminée</Badge>
<Badge variant="warning">En attente</Badge>
<Badge variant="info">En cours</Badge>
<Badge variant="destructive">Annulée</Badge>
```

## 🔐 Sécurité

- Les demandes sont filtrées par `userId`
- Seules les demandes de l'utilisateur connecté sont affichées
- Les actions de suppression nécessitent une confirmation
- Les données sensibles ne sont pas exposées

## 📱 Responsive Design

Le tableau est responsive:
- **Mobile**: Scroll horizontal si nécessaire
- **Tablette**: Affichage optimisé
- **Desktop**: Tableau complet avec toutes les colonnes

## 🎨 Personnalisation

### Modifier les couleurs des badges

```javascript
// Dans badge.jsx
const badgeVariants = cva(
  "...",
  {
    variants: {
      variant: {
        custom: "border-transparent bg-purple-500 text-white",
      },
    },
  }
)
```

### Ajouter une colonne au tableau

```jsx
// Dans DemandesTab.jsx
<TableHead>Nouvelle Colonne</TableHead>

// Dans le map
<TableCell>{demande.nouvelleValeur}</TableCell>
```
