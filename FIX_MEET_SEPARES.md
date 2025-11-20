# Correction du problème de meet séparés

## Problème identifié

Quand le demandeur accepte une offre, chaque utilisateur (demandeur et prestataire) entre dans un meet séparé au lieu d'être dans le même appel vidéo.

**Symptôme dans l'image :**
- Gauche (demandeur) : `/meet/jx77chnkdp2qxrnv3yxx2d3vrn7vs2st`
- Droite (prestataire) : `/meet/jy71f3cqp8tmfff361q4ph7vght`

Ce sont deux `sessionId` différents, donc deux sessions différentes avec deux `callId` différents.

## Causes possibles

### Cause 1 : Double acceptation de la même offre
L'utilisateur accepte l'offre deux fois (depuis deux interfaces différentes), créant deux sessions.

**Interfaces où on peut accepter :**
1. `Offres.jsx` - Page des offres reçues
2. `OffresRecuesModal.jsx` - Modal des offres reçues

**Solution appliquée :** Vérifier si une session existe déjà avant d'en créer une nouvelle.

### Cause 2 : Deux offres différentes acceptées
Il y a deux offres différentes pour la même demande, et les deux ont été acceptées.

**Solution :** Vérifier dans le dashboard Convex combien d'offres existent pour cette demande.

### Cause 3 : Bug de redirection
Le prestataire est redirigé vers une mauvaise session.

**Solution :** Vérifier que le `PaymentStatusModal` utilise bien le bon `sessionId`.

## Correction appliquée

### backend/convex/offres.ts - Éviter les sessions dupliquées

**Avant :**
```typescript
// Si l'offre est acceptée, créer une session meet
if (args.status === "accepted" && offre.userId) {
  // Créer directement la session
  const meetSessionId = await ctx.db.insert("meetSessions", {
    // ...
  });
}
```

**Après :**
```typescript
// Si l'offre est acceptée, créer une session meet
if (args.status === "accepted" && offre.userId) {
  // Vérifier si une session existe déjà pour cette offre
  if (offre.meetSessionId) {
    console.log("Session already exists for this offer:", offre.meetSessionId);
    const existingSession = await ctx.db.get(offre.meetSessionId);
    if (existingSession) {
      return { 
        success: true, 
        meetSessionId: offre.meetSessionId, 
        callId: existingSession.callId 
      };
    }
  }

  // Créer la session seulement si elle n'existe pas
  const meetSessionId = await ctx.db.insert("meetSessions", {
    // ...
  });
}
```

**Avantage :** Si l'offre est acceptée plusieurs fois, la même session est retournée.

## Comment vérifier le problème

### 1. Vérifier dans Convex Dashboard

1. Aller sur https://dashboard.convex.dev
2. Sélectionner votre projet
3. Aller dans "Data" → "meetSessions"
4. Vérifier combien de sessions existent
5. Noter les `callId` de chaque session
6. Vérifier si plusieurs sessions ont le même `offreId`

### 2. Vérifier dans la console

Quand vous acceptez une offre, vérifier les logs :
```
🔄 [OffresRecuesModal] Acceptation de l'offre: js71fcxhk13e2qqx86n208j3z97vsvqx
✅ [OffresRecuesModal] Résultat: { 
  success: true, 
  meetSessionId: "jx77chnkdp2qxrnv3yxx2d3vrn7vs2st", 
  callId: "meet_js71fcxhk13e2qqx_mi7dvnv7" 
}
```

Le `meetSessionId` et `callId` doivent être les mêmes pour le demandeur et le prestataire.

### 3. Vérifier les URLs

Quand les deux utilisateurs sont dans le meet :
- Demandeur : `/meet/[sessionId]`
- Prestataire : `/meet/[sessionId]`

Les `sessionId` doivent être **identiques**.

## Scénarios de test

### Test 1 : Acceptation simple
1. Prestataire propose une offre
2. Demandeur accepte l'offre (une seule fois)
3. Demandeur paie
4. Les deux rejoignent le meet
5. **Vérifier :** Ils sont dans le même appel

### Test 2 : Double acceptation (bug)
1. Prestataire propose une offre
2. Demandeur accepte depuis `Offres.jsx`
3. Demandeur accepte ENCORE depuis `OffresRecuesModal.jsx`
4. **Vérifier :** Une seule session est créée (grâce au fix)

### Test 3 : Deux offres différentes
1. Deux prestataires proposent des offres pour la même demande
2. Demandeur accepte les deux offres
3. **Résultat attendu :** Deux sessions différentes (c'est normal)
4. **Problème :** Le demandeur ne devrait accepter qu'une seule offre

## Solutions supplémentaires recommandées

### 1. Empêcher l'acceptation multiple

Dans `Offres.jsx` et `OffresRecuesModal.jsx`, désactiver le bouton "Accepter" si l'offre a déjà un `meetSessionId` :

```jsx
{isCreator && offre.status === 'pending' && !offre.meetSessionId && (
  <button onClick={() => handleStatusUpdate(offre._id, 'accepted')}>
    Accepter
  </button>
)}
```

### 2. N'afficher qu'une seule interface

Choisir entre `Offres.jsx` et `OffresRecuesModal.jsx` et supprimer l'autre pour éviter la confusion.

### 3. Bloquer l'acceptation de plusieurs offres

Quand une offre est acceptée pour une demande, mettre toutes les autres offres en "rejected" automatiquement :

```typescript
// Dans updateOffreStatus, après avoir accepté une offre
if (args.status === "accepted") {
  // Rejeter toutes les autres offres pour cette demande
  const otherOffres = await ctx.db
    .query("offres")
    .filter((q) => 
      q.and(
        q.eq(q.field("demandeId"), offre.demandeId),
        q.neq(q.field("_id"), args.offreId),
        q.eq(q.field("status"), "pending")
      )
    )
    .collect();

  for (const otherOffre of otherOffres) {
    await ctx.db.patch(otherOffre._id, { status: "rejected" });
  }
}
```

## Fichiers modifiés

1. `backend/convex/offres.ts`
   - Vérification de session existante avant création
   - Retour de la session existante si elle existe

## Prochaines étapes

1. **Tester** l'acceptation d'offre
2. **Vérifier** dans Convex Dashboard qu'une seule session est créée
3. **Vérifier** que les deux utilisateurs ont le même `sessionId` dans l'URL
4. **Implémenter** les solutions supplémentaires si nécessaire

## Notes importantes

- Le `sessionId` est l'ID de la session dans la table `meetSessions`
- Le `callId` est l'ID utilisé par Stream.io pour l'appel vidéo
- Une session = un `callId` = un appel vidéo
- Si deux utilisateurs ont des `sessionId` différents, ils auront des `callId` différents et seront dans des appels séparés
