# Feature: Notification automatique de scam pour le prestataire

## Vue d'ensemble

Lorsque le demandeur signale un scam pendant une session meet, le prestataire est maintenant automatiquement déconnecté et informé via un modal explicatif. La transaction est annulée et aucun argent n'est transféré.

## Fonctionnalités implémentées

### 1. **Surveillance en temps réel du statut de session**

Le composant `MeetRoom` surveille maintenant le statut de la session en temps réel pour détecter les changements.

**Logique de détection:**
```javascript
// Détecter si la session vient d'être annulée (scam signalé)
const wasActive = previousSessionStatusRef.current === 'active'
const isCancelled = session.status === 'cancelled'
const isProvider = session.offreurId === user.userId

if (wasActive && isCancelled && isProvider) {
  // Scam détecté pour le prestataire
  // → Déconnexion automatique
  // → Affichage du modal
}
```

### 2. **Déconnexion automatique du prestataire**

Quand un scam est détecté:
- ✅ Le prestataire est immédiatement déconnecté de l'appel Stream.io
- ✅ Le client Stream est déconnecté proprement
- ✅ Le modal de notification s'affiche

```javascript
// Déconnecter immédiatement le prestataire
if (call) {
  call.leave().catch(console.error)
}
if (client) {
  client.disconnectUser().catch(console.error)
}

// Afficher le modal de notification
setShowScamModal(true)
```

### 3. **Modal de notification ScamNotificationModal**

Un nouveau composant modal a été créé pour informer le prestataire:

**Caractéristiques:**
- 🎨 Design rouge avec animation de shake
- ⚠️ Message clair sur l'annulation
- 💰 Informations sur le statut de la transaction
- 📋 Détails de la session
- ⏱️ Redirection automatique après 10 secondes
- 🔒 Blocage du scroll pendant l'affichage

**Informations affichées:**
1. **Message principal:** "Le demandeur a signalé cette session comme frauduleuse"
2. **Statut de la transaction:**
   - ❌ Transaction annulée
   - ❌ Aucun argent ne sera transféré
   - 💰 Le demandeur sera remboursé
3. **Informations de la session:**
   - Titre de la demande
   - Montant qui devait être payé
4. **Note:** Possibilité de contacter le support si le signalement est injustifié

## Flux complet

### Scénario: Demandeur signale un scam

**Étape 1: Demandeur signale le scam**
```
Demandeur clique sur "Report SCAM" (disponible pendant les 25% premiers de la session)
→ Confirmation demandée
→ Session terminée avec isScam = true
→ Statut de la session: active → cancelled
```

**Étape 2: Backend met à jour la session**
```
endMeetSession({ sessionId, isScam: true })
→ session.status = 'cancelled'
→ demande.status = 'cancelled'
→ Aucune transaction créée
```

**Étape 3: Prestataire détecte le changement (temps réel)**
```
MeetRoom surveille session.status via useQuery
→ Détecte: active → cancelled
→ Identifie: user est le prestataire
→ Déclenche: déconnexion automatique
```

**Étape 4: Déconnexion du prestataire**
```
→ call.leave()
→ client.disconnectUser()
→ Affichage du ScamNotificationModal
```

**Étape 5: Modal informatif**
```
→ Prestataire voit le modal rouge
→ Informé de l'annulation
→ Informé qu'aucun argent ne sera transféré
→ Redirection automatique vers /dashboard après 10s
```

## Code modifié

### 1. **MeetRoom.jsx**

**Ajouts:**
- Import de `useRef` pour suivre le statut précédent
- Import de `ScamNotificationModal`
- État `showScamModal` pour contrôler l'affichage du modal
- Référence `previousSessionStatusRef` pour comparer les statuts
- `useEffect` pour surveiller les changements de statut
- Rendu du `ScamNotificationModal`

**Logique de détection:**
```javascript
useEffect(() => {
  if (!session || !user) return

  // Stocker le statut initial
  if (previousSessionStatusRef.current === null) {
    previousSessionStatusRef.current = session.status
    return
  }

  // Détecter le changement active → cancelled pour le prestataire
  const wasActive = previousSessionStatusRef.current === 'active'
  const isCancelled = session.status === 'cancelled'
  const isProvider = session.offreurId === user.userId

  if (wasActive && isCancelled && isProvider) {
    // Déconnecter et afficher le modal
    if (call) call.leave().catch(console.error)
    if (client) client.disconnectUser().catch(console.error)
    setShowScamModal(true)
  }

  previousSessionStatusRef.current = session.status
}, [session, user, call, client, navigate])
```

### 2. **ScamNotificationModal.jsx** (Nouveau fichier)

Composant modal complet avec:
- Design responsive
- Animation de shake
- Redirection automatique
- Blocage du scroll
- Informations détaillées

## Tests à effectuer

### Test 1: Scam signalé pendant la session
1. **Setup:**
   - Demandeur et prestataire rejoignent le meet
   - Session active avec 2 participants

2. **Action:**
   - Demandeur clique sur "Report SCAM" (dans les 25% premiers)
   - Confirme le signalement

3. **Résultats attendus:**
   - ✅ Demandeur est déconnecté immédiatement
   - ✅ Prestataire voit le modal rouge apparaître
   - ✅ Prestataire est déconnecté automatiquement
   - ✅ Modal affiche les bonnes informations
   - ✅ Redirection vers /dashboard après 10s
   - ✅ Session status = 'cancelled'
   - ✅ Aucune transaction créée

### Test 2: Vérification de la transaction
1. Après le test 1, vérifier dans le dashboard admin:
   - ✅ Aucune transaction pour cette session
   - ✅ Demande status = 'cancelled'
   - ✅ Wallet du prestataire inchangé

### Test 3: Session normale (pas de scam)
1. **Setup:**
   - Demandeur et prestataire rejoignent le meet

2. **Action:**
   - Laisser la session se terminer normalement
   - Ou cliquer sur "Quitter l'appel"

3. **Résultats attendus:**
   - ✅ Pas de modal de scam
   - ✅ Transaction créée normalement
   - ✅ Prestataire reçoit son argent
   - ✅ Session status = 'completed'

### Test 4: Mobile
1. Tester le même flux sur mobile
2. **Vérifier:**
   - ✅ Modal s'affiche correctement
   - ✅ Responsive design fonctionne
   - ✅ Déconnexion automatique fonctionne

## Logs de débogage

Pour suivre le flux, chercher dans la console:

**Côté prestataire:**
```
🔍 [MeetRoom] Vérification du statut de session
🚨 [MeetRoom] SCAM DÉTECTÉ - Fermeture automatique pour le prestataire
```

**Côté demandeur:**
```
🚨 Session reported as scam. The meeting will end immediately.
```

**Backend:**
```
🚨 SCAM SIGNALÉ - Aucune transaction créée, aucun argent transféré
❌ Le prestataire ne recevra RIEN
💰 L'argent sera remboursé au demandeur
```

## Améliorations futures possibles

1. **Notification push:** Envoyer une notification push au prestataire même s'il n'est pas sur la page
2. **Email de notification:** Envoyer un email au prestataire pour l'informer
3. **Historique des scams:** Tracker les utilisateurs qui signalent souvent des scams
4. **Système de dispute:** Permettre au prestataire de contester le signalement
5. **Enregistrement automatique:** Enregistrer les sessions pour preuve en cas de dispute
6. **Bannissement automatique:** Bannir automatiquement les utilisateurs avec trop de scams signalés

## Sécurité

### Protections en place:
- ✅ Seul le demandeur peut signaler un scam
- ✅ Bouton de scam disponible uniquement pendant les 25% premiers de la session
- ✅ Confirmation requise avant de signaler
- ✅ Transaction annulée immédiatement
- ✅ Aucun argent transféré au prestataire

### Points d'attention:
- ⚠️ Possibilité d'abus: un demandeur malveillant pourrait signaler un scam injustement
- 💡 Solution future: Système de dispute et historique des signalements

## Fichiers créés/modifiés

### Créés:
- ✅ `frontend/src/components/ScamNotificationModal.jsx` - Modal de notification

### Modifiés:
- ✅ `frontend/src/pages/MeetRoom.jsx` - Surveillance du statut et déconnexion automatique

## Résumé

✅ **Fonctionnalité complète:** Le prestataire est maintenant automatiquement informé et déconnecté quand un scam est signalé.

✅ **Expérience utilisateur:** Modal clair et informatif avec redirection automatique.

✅ **Sécurité:** Aucun argent n'est transféré au prestataire en cas de scam.

✅ **Temps réel:** Détection instantanée grâce à la surveillance du statut de session via Convex.
