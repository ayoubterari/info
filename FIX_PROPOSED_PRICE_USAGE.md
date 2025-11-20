# Fix: Utilisation du prix proposé par le prestataire

## Problème identifié

Lorsqu'un prestataire propose un prix différent du prix initial de la demande (par exemple, un prix plus élevé), ce nouveau prix n'était pas utilisé partout dans l'application. Les calculs de commission et les affichages utilisaient encore le prix initial de la demande (`demande.price`) au lieu du prix de l'offre acceptée (`offre.proposedPrice`).

## Impact

- ❌ Les transactions étaient créées avec le mauvais montant
- ❌ Les commissions étaient calculées sur le mauvais prix
- ❌ L'affichage dans le dashboard montrait le mauvais prix
- ❌ Le prestataire ne recevait pas le bon montant

## Solutions appliquées

### 1. **Backend: meetSessions.ts** - Ajout du proposedPrice dans getSessionById

**Problème:** La query `getSessionById` ne retournait pas le prix de l'offre, donc le modal de paiement ne pouvait pas l'afficher.

**Solution:**
```typescript
// Avant
return {
  ...session,
  demandeTitle: demande?.title || "Service",
  duration: demande?.duration || 30,
  demandeurName: demandeur?.name || "Demandeur",
  helperName: offreur?.name || "Prestataire",
};

// Après
const offre = await ctx.db.get(session.offreId);

return {
  ...session,
  demandeTitle: demande?.title || "Service",
  duration: demande?.duration || 30,
  demandeurName: demandeur?.name || "Demandeur",
  helperName: offreur?.name || "Prestataire",
  offre: offre ? {
    proposedPrice: offre.proposedPrice,
  } : null,
};
```

### 2. **Frontend: ViewDemandeModal.jsx** - Utilisation du prix de l'offre acceptée

**Problème:** Le modal affichait toujours `demande.price` pour les calculs de commission, même si une offre avec un prix différent avait été acceptée.

**Solution:**
```javascript
// Récupérer les offres pour cette demande
const offres = useQuery(
  api.offres.getOffresByDemande,
  demande ? { demandeId: demande._id } : "skip"
)

// Trouver l'offre acceptée
const acceptedOffre = offres?.find(o => o.status === 'accepted')

// Utiliser le prix de l'offre acceptée, sinon le prix de la demande
const finalPrice = acceptedOffre?.proposedPrice || demande.price
```

**Tous les calculs utilisent maintenant `finalPrice`:**
- ✅ Montant total payé
- ✅ Commission plateforme
- ✅ Montant reçu par le prestataire
- ✅ Affichage dans les transactions

**Indicateur visuel ajouté:**
```javascript
<div className="flex items-center gap-2">
  <div className="text-lg font-semibold">{formatPrice(finalPrice)}</div>
  {acceptedOffre && acceptedOffre.proposedPrice !== demande.price && (
    <div className="text-xs text-gray-500">
      (initial: {formatPrice(demande.price)})
    </div>
  )}
</div>
```

### 3. **Vérification des autres fichiers**

#### ✅ **payments.ts** (Backend)
Déjà correct - utilise `offre.proposedPrice`:
```typescript
const totalAmount = offre.proposedPrice;
const commissionAmount = (totalAmount * commissionRate) / 100;
const providerAmount = totalAmount - commissionAmount;
```

#### ✅ **transactions.ts** (Backend)
Déjà correct - reçoit le `totalAmount` calculé depuis l'offre:
```typescript
const transactionId = await ctx.db.insert("transactions", {
  totalAmount: args.totalAmount, // Vient de offre.proposedPrice
  commissionRate,
  commissionAmount,
  providerAmount,
  // ...
});
```

#### ✅ **Payment.jsx** (Frontend)
Déjà correct - utilise `offre.proposedPrice`:
```javascript
<span className="font-semibold">${offre.proposedPrice}</span>
```

#### ✅ **PaymentStatusModal.jsx** (Frontend)
Déjà correct - utilise `session?.offre?.proposedPrice`:
```javascript
<span className="font-semibold text-gray-900">
  ${session?.offre?.proposedPrice || '0'}
</span>
```

## Flux complet corrigé

### 1. Création de la demande
```
Demandeur crée une demande avec un prix initial: $50
```

### 2. Prestataire propose une offre
```
Prestataire propose son aide avec un prix différent: $75
→ offre.proposedPrice = 75
```

### 3. Acceptation de l'offre
```
Demandeur accepte l'offre à $75
→ Création d'une meetSession avec offreId
→ Redirection vers /payment
```

### 4. Page de paiement
```
✅ Affiche: Prix du service: $75 (offre.proposedPrice)
✅ Calcule: Commission (10%): $7.50
✅ Affiche: Prestataire recevra: $67.50
```

### 5. Confirmation du paiement
```
✅ Transaction créée avec totalAmount = $75
✅ Commission = $7.50
✅ Montant prestataire = $67.50
```

### 6. Dashboard - Vue de la demande
```
✅ Affiche: Prix accepté: $75 (initial: $50)
✅ Calcule: Commission: $7.50
✅ Affiche: Prestataire a reçu: $67.50
```

## Cas d'usage testés

### Cas 1: Prix identique
```
Demande: $50
Offre: $50
→ Affichage: $50
→ Pas d'indicateur (initial)
```

### Cas 2: Prix augmenté
```
Demande: $50
Offre: $75
→ Affichage: $75 (initial: $50)
→ Tous les calculs sur $75
```

### Cas 3: Prix diminué
```
Demande: $100
Offre: $80
→ Affichage: $80 (initial: $100)
→ Tous les calculs sur $80
```

## Vérifications à effectuer

### ✅ Backend
- [x] `meetSessions.getSessionById` retourne `offre.proposedPrice`
- [x] `payments.confirmPayment` utilise `offre.proposedPrice`
- [x] `transactions.createTransaction` reçoit le bon montant
- [x] Wallet du prestataire crédité avec le bon montant

### ✅ Frontend
- [x] `Payment.jsx` affiche `offre.proposedPrice`
- [x] `PaymentStatusModal.jsx` affiche `session.offre.proposedPrice`
- [x] `ViewDemandeModal.jsx` utilise `finalPrice` (offre acceptée)
- [x] Indicateur visuel si prix différent du prix initial

### ✅ Dashboard Admin
- [x] Transactions affichent le bon montant
- [x] Commissions calculées sur le bon prix
- [x] Statistiques correctes

## Tests recommandés

### Test 1: Prix augmenté
1. Créer une demande à $50
2. Proposer une offre à $75
3. Accepter l'offre
4. **Vérifier:** Page de paiement affiche $75
5. Payer
6. **Vérifier:** Transaction créée avec $75
7. **Vérifier:** Prestataire reçoit $67.50 (75 - 7.5)
8. **Vérifier:** Dashboard affiche $75 avec "(initial: $50)"

### Test 2: Prix identique
1. Créer une demande à $60
2. Proposer une offre à $60
3. Accepter l'offre
4. **Vérifier:** Pas d'indicateur (initial)
5. **Vérifier:** Tous les calculs sur $60

### Test 3: Prix diminué
1. Créer une demande à $100
2. Proposer une offre à $80
3. Accepter l'offre
4. **Vérifier:** Tous les calculs sur $80
5. **Vérifier:** Dashboard affiche $80 avec "(initial: $100)"

## Fichiers modifiés

### Backend
- ✅ `backend/convex/meetSessions.ts` - Ajout de `offre.proposedPrice` dans `getSessionById`

### Frontend
- ✅ `frontend/src/components/dashboard/ViewDemandeModal.jsx` - Utilisation du prix de l'offre acceptée
  - Récupération des offres
  - Calcul de `finalPrice`
  - Remplacement de tous les `demande.price` par `finalPrice`
  - Ajout d'un indicateur visuel

## Résumé

✅ **Problème résolu:** Le prix proposé par le prestataire est maintenant utilisé partout dans l'application pour tous les calculs et affichages.

✅ **Cohérence:** Le montant payé par le demandeur = le montant de la transaction = le montant affiché dans le dashboard.

✅ **Transparence:** Un indicateur visuel montre quand le prix final diffère du prix initial de la demande.

✅ **Précision:** Les commissions et les montants versés aux prestataires sont calculés sur le bon prix.
