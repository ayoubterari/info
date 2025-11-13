# Système de Visioconférence avec Stream.io

## 🎯 Vue d'ensemble

Système complet de visioconférence intégré qui redirige automatiquement les deux participants (demandeur et offreur) vers une salle de meet lorsqu'une offre est acceptée.

## 🔧 Configuration

### Variables d'environnement

**Fichier: `frontend/.env`**
```env
VITE_STREAM_APP_ID=1412219
VITE_STREAM_API_KEY=rg8y95h634f6
```

### Dépendances installées

```bash
npm install @stream-io/video-react-sdk
```

## 📊 Architecture

### 1. Base de données (Convex Schema)

**Table `meetSessions`:**
- `offreId` - Référence à l'offre acceptée
- `demandeId` - Référence à la demande
- `demandeurId` - Propriétaire de la demande
- `offreurId` - Utilisateur qui a fait l'offre
- `callId` - ID unique de l'appel Stream.io
- `status` - active | completed | cancelled
- `createdAt` - Timestamp de création
- `endedAt` - Timestamp de fin (optionnel)

**Modification table `offres`:**
- Ajout de `meetSessionId` - Lien vers la session meet

### 2. Backend (Convex)

**Fichier: `backend/convex/offres.ts`**

**Mutation `updateOffreStatus` modifiée:**
- Quand une offre est acceptée, crée automatiquement une session meet
- Génère un `callId` unique
- Retourne `meetSessionId` et `callId` pour la redirection

**Fichier: `backend/convex/meetSessions.ts`**

**Queries:**
- `getUserActiveMeetSessions` - Récupère les sessions actives d'un utilisateur
- `getMeetSession` - Récupère les détails d'une session
- `endMeetSession` - Termine une session

### 3. Frontend

#### Page MeetRoom (`frontend/src/pages/MeetRoom.jsx`)

**Fonctionnalités:**
- Initialise le client Stream.io
- Crée/rejoint l'appel vidéo
- Affiche les informations de la session
- Contrôles d'appel (micro, caméra, raccrocher)
- Layout avec SpeakerLayout
- Compteur de participants

**Composants Stream.io utilisés:**
- `StreamVideo` - Provider principal
- `StreamVideoClient` - Client de connexion
- `StreamCall` - Contexte de l'appel
- `SpeakerLayout` - Layout vidéo
- `CallControls` - Contrôles d'appel

#### Composant MeetNotification (`frontend/src/components/MeetNotification.jsx`)

**Fonctionnalités:**
- Notification globale en bas à droite
- Détecte automatiquement les sessions actives
- Affiche un bouton "Rejoindre le Meet"
- Animation slide-in
- Bouton de fermeture
- Différencie demandeur et offreur

#### Modifications des pages existantes

**Page Offres (`frontend/src/pages/Offres.jsx`):**
- Redirection automatique vers `/meet/:sessionId` après acceptation
- Le demandeur est redirigé immédiatement

**Modal OffresRecuesModal (`frontend/src/components/dashboard/OffresRecuesModal.jsx`):**
- Redirection automatique depuis le dashboard
- Ferme le modal avant redirection

## 🔄 Flux de fonctionnement

### Scénario complet:

1. **Utilisateur A crée une demande**
   - Titre: "Besoin d'aide pour déménagement"
   - Prix: $100

2. **Utilisateur B propose une offre**
   - Prix proposé: $80
   - Message: "Je peux vous aider"
   - Statut: pending

3. **Utilisateur A accepte l'offre**
   - Clic sur "Accepter" dans la page Offres ou le Dashboard
   - Backend crée une session meet
   - Génère un `callId` unique
   - Retourne `meetSessionId`

4. **Redirection automatique**
   - **Utilisateur A (demandeur):** Redirigé immédiatement vers `/meet/:sessionId`
   - **Utilisateur B (offreur):** Reçoit une notification en bas à droite

5. **Notification pour l'offreur**
   - Popup animé avec:
     - "Votre offre a été acceptée !"
     - Titre de la demande
     - Nom du demandeur
     - Bouton "Rejoindre le Meet"

6. **Les deux utilisateurs dans le meet**
   - Vidéo en temps réel
   - Audio bidirectionnel
   - Contrôles (micro, caméra, raccrocher)
   - Informations de la session affichées

7. **Fin de l'appel**
   - Clic sur "Raccrocher"
   - Session marquée comme "completed"
   - Redirection vers le dashboard

## 🎨 Interface utilisateur

### Page MeetRoom

**Header:**
- Informations de la session
- Titre de la demande
- Nom de l'autre participant
- Badge "En direct" avec animation

**Zone vidéo:**
- Layout Speaker (participant actif en grand)
- Compteur de participants
- Contrôles en bas

**Contrôles:**
- Micro on/off
- Caméra on/off
- Partage d'écran
- Raccrocher (rouge)

### Notification

**Design:**
- Position: Bas droite (fixed)
- Bordure verte
- Icône vidéo
- Animation slide-in
- Bouton de fermeture

**Contenu:**
- Titre différencié (demandeur vs offreur)
- Titre de la demande
- Nom de l'autre participant
- Bouton CTA vert "Rejoindre le Meet"

## 🔐 Sécurité

**Note importante:**
Le code actuel utilise `token: 'development'` pour Stream.io.

**En production, vous devez:**
1. Créer une mutation Convex pour générer des tokens Stream.io sécurisés
2. Utiliser la clé secrète Stream.io côté serveur
3. Générer un token JWT pour chaque utilisateur
4. Passer ce token au StreamVideoClient

**Exemple de génération de token (à implémenter):**
```typescript
// backend/convex/stream.ts
export const generateStreamToken = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Utiliser la clé secrète Stream.io
    // Générer un JWT token
    // Retourner le token
  }
});
```

## 📱 Responsive

- Desktop: Layout complet avec contrôles
- Mobile: Layout adapté, contrôles optimisés
- Tablette: Layout intermédiaire

## 🚀 Améliorations possibles

1. **Enregistrement des appels**
   - Sauvegarder les sessions
   - Historique des appels

2. **Chat intégré**
   - Messages pendant l'appel
   - Partage de fichiers

3. **Qualité vidéo**
   - Sélection de la qualité
   - Statistiques réseau

4. **Notifications push**
   - Notifications navigateur
   - Sonnerie d'appel

5. **Salle d'attente**
   - Prévisualisation avant de rejoindre
   - Test micro/caméra

6. **Partage d'écran**
   - Déjà disponible dans CallControls
   - À tester et documenter

## 🧪 Tests

### Test manuel:

1. Créer deux comptes utilisateurs
2. Utilisateur A crée une demande
3. Utilisateur B propose une offre
4. Utilisateur A accepte l'offre
5. Vérifier:
   - ✅ A est redirigé vers le meet
   - ✅ B reçoit une notification
   - ✅ Les deux peuvent rejoindre
   - ✅ Vidéo/audio fonctionnent
   - ✅ Contrôles fonctionnent
   - ✅ Fin d'appel fonctionne

## 📝 Fichiers créés/modifiés

**Créés:**
- `frontend/.env` - Variables d'environnement
- `frontend/src/pages/MeetRoom.jsx` - Page de visioconférence
- `frontend/src/components/MeetNotification.jsx` - Notification globale
- `backend/convex/meetSessions.ts` - Queries et mutations

**Modifiés:**
- `backend/convex/schema.ts` - Ajout table meetSessions
- `backend/convex/offres.ts` - Création session meet
- `frontend/src/App.jsx` - Route et notification
- `frontend/src/pages/Offres.jsx` - Redirection
- `frontend/src/components/dashboard/OffresRecuesModal.jsx` - Redirection
- `frontend/src/index.css` - Animation

## 🎉 Résultat

Un système complet de visioconférence qui:
- ✅ Redirige automatiquement les deux participants
- ✅ Notifie l'offreur en temps réel
- ✅ Fournit une interface de meet professionnelle
- ✅ Gère le cycle de vie complet des sessions
- ✅ S'intègre parfaitement au workflow existant
