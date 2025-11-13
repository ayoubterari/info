# 📜 Fonctionnalité Historique des Conversations

## ✅ Implémentation terminée

Un système complet d'historique des conversations avec l'IA a été ajouté à l'application.

## 🎯 Fonctionnalités

### 1. Sauvegarde automatique
- ✅ Chaque conversation est automatiquement sauvegardée dans Convex
- ✅ Stockage du message utilisateur, de la réponse IA et de l'agent utilisé
- ✅ Horodatage de chaque conversation

### 2. Bouton Historique
- ✅ Icône d'horloge dans le header
- ✅ Accessible à tout moment
- ✅ Responsive (texte masqué sur mobile)

### 3. Popup Historique
- ✅ Design moderne avec sidebar et zone de détails
- ✅ Liste de toutes les conversations
- ✅ Affichage du nombre total de conversations
- ✅ Dates formatées (relative et absolue)

### 4. Gestion de l'historique
- ✅ Voir les détails d'une conversation
- ✅ Supprimer une conversation individuelle
- ✅ Supprimer tout l'historique
- ✅ Affichage des messages avec design chat

## 📁 Fichiers créés/modifiés

### Backend
```
backend/convex/
├── conversations.ts          ✨ NOUVEAU - Gestion des conversations
└── schema.ts                 ✏️ MODIFIÉ - Ajout table conversations
```

### Frontend
```
frontend/src/
├── components/
│   ├── HistoryModal.jsx      ✨ NOUVEAU - Popup historique
│   └── Header.jsx            ✏️ MODIFIÉ - Bouton historique
└── App.jsx                   ✏️ MODIFIÉ - Sauvegarde auto
```

## 🎨 Design de la Popup

### Layout
- **Sidebar gauche** (1/3) : Liste des conversations
- **Zone principale** (2/3) : Détails de la conversation sélectionnée

### Sidebar
- Header avec icône et compteur
- Liste scrollable des conversations
- Chaque item affiche :
  - Agent utilisé (badge coloré)
  - Aperçu du message (2 lignes max)
  - Date relative
- Bouton "Tout supprimer" en bas

### Zone de détails
- Header avec agent, date et bouton supprimer
- Messages affichés en style chat :
  - Message utilisateur : aligné à droite, fond bleu
  - Réponse IA : aligné à gauche, fond gris
- État vide avec icône et message

## 🔄 Flux de données

```
User sends message
    ↓
OpenAI generates response
    ↓
Display in modal
    ↓
Save to Convex (conversations table)
    ↓
Available in History
```

## 💾 Structure de données

### Table `conversations`
```typescript
{
  _id: Id<"conversations">,
  userId?: Id<"users">,        // Optionnel
  userMessage: string,
  aiResponse: string,
  agentName: string,           // GPT-4, Claude, etc.
  createdAt: number,           // Timestamp
}
```

### Indexes
- `by_user` : Filtrer par utilisateur
- `by_date` : Trier par date

## 🚀 Utilisation

### Voir l'historique
1. Cliquez sur le bouton **Historique** (icône horloge) dans le header
2. La popup s'ouvre avec la liste des conversations
3. Cliquez sur une conversation pour voir les détails

### Supprimer une conversation
1. Sélectionnez une conversation
2. Cliquez sur l'icône poubelle en haut à droite
3. Confirmez la suppression

### Supprimer tout l'historique
1. Cliquez sur "Tout supprimer" en bas de la sidebar
2. Confirmez l'action

## 📊 API Backend

### Queries
```typescript
// Récupérer l'historique
api.conversations.getConversations({ 
  userId?: Id<"users">, 
  limit?: number 
})

// Récupérer une conversation
api.conversations.getConversationById({ 
  id: Id<"conversations"> 
})
```

### Mutations
```typescript
// Sauvegarder une conversation
api.conversations.saveConversation({
  userId?: Id<"users">,
  userMessage: string,
  aiResponse: string,
  agentName: string,
})

// Supprimer une conversation
api.conversations.deleteConversation({ 
  id: Id<"conversations"> 
})

// Supprimer tout l'historique
api.conversations.clearHistory({ 
  userId?: Id<"users"> 
})
```

## 🎨 Personnalisation

### Modifier le nombre de conversations affichées
Dans `HistoryModal.jsx` :
```javascript
const conversations = useQuery(api.conversations.getConversations, { 
  limit: 100  // Changez cette valeur
});
```

### Modifier le format de date
Dans `HistoryModal.jsx`, fonction `formatDate()` :
```javascript
const formatDate = (timestamp) => {
  // Personnalisez le format ici
  return date.toLocaleDateString('fr-FR', {
    // Options de formatage
  });
};
```

### Changer les couleurs
Dans `HistoryModal.jsx` :
- Message utilisateur : `bg-blue-600` → Changez la couleur
- Réponse IA : `bg-gray-100` → Changez la couleur
- Badges agents : `bg-blue-100 text-blue-700` → Personnalisez

## 🔒 Sécurité et confidentialité

### Actuellement
- ✅ Les conversations sont stockées dans Convex
- ✅ Possibilité de lier à un utilisateur (userId optionnel)
- ✅ Suppression individuelle ou totale

### Améliorations possibles
- [ ] Chiffrement des conversations
- [ ] Expiration automatique après X jours
- [ ] Filtrage par utilisateur (si connecté)
- [ ] Export des conversations
- [ ] Recherche dans l'historique

## 🐛 Dépannage

### L'historique est vide
- Vérifiez que le backend Convex est démarré
- Envoyez une nouvelle conversation
- Vérifiez la console pour les erreurs

### Erreur lors de la sauvegarde
- Vérifiez que le schéma est à jour dans Convex
- Redémarrez le backend : `npx convex dev`

### La popup ne s'ouvre pas
- Vérifiez la console du navigateur
- Assurez-vous que `HistoryModal` est importé dans `Header.jsx`

## 📈 Statistiques possibles

Vous pouvez ajouter des statistiques comme :
- Nombre total de conversations
- Agent le plus utilisé
- Temps moyen de réponse
- Conversations par jour/semaine

## 🎯 Prochaines améliorations

- [ ] Recherche dans l'historique
- [ ] Filtres par agent
- [ ] Filtres par date
- [ ] Export en PDF/TXT
- [ ] Partage de conversations
- [ ] Tags/catégories
- [ ] Favoris
- [ ] Notes sur les conversations
