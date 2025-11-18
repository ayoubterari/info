# Guide d'Implémentation Stripe Connect

## 1. Configuration Stripe

### Étape 1 : Créer un compte Stripe
1. Aller sur https://stripe.com
2. Créer un compte
3. Activer **Stripe Connect** dans le dashboard

### Étape 2 : Obtenir les clés API
```env
# .env.local (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# .env (Backend)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Étape 3 : Activer Stripe Connect
1. Dashboard Stripe → Connect → Get Started
2. Choisir le type : **Standard** ou **Express**
3. Configurer les paramètres de paiement

---

## 2. Architecture du Système

### Flux de Paiement Complet

```
1. Demandeur accepte une offre
   ↓
2. Redirigé vers page de paiement
   ↓
3. Paie $50 avec Stripe Checkout/Payment Intent
   ↓
4. Stripe prélève $50 du demandeur
   ↓
5. Backend reçoit webhook "payment_intent.succeeded"
   ↓
6. Backend calcule:
   - Commission: $5 (10%)
   - Montant prestataire: $45
   ↓
7. Backend crée un Transfer vers le compte Connect du prestataire
   ↓
8. Prestataire reçoit $45 dans son compte Stripe
   ↓
9. Transaction enregistrée dans la base de données
```

---

## 3. Code Backend Nécessaire

### A. Créer un compte Connect pour un prestataire

```typescript
// backend/convex/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Créer un compte Connect pour un prestataire
export const createConnectAccount = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Créer un compte Stripe Connect
    const account = await stripe.accounts.create({
      type: 'express', // ou 'standard'
      country: 'FR', // ou US, etc.
      email: args.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Sauvegarder l'ID du compte Connect
    await ctx.db.patch(args.userId, {
      stripeConnectAccountId: account.id,
    });

    return { accountId: account.id };
  },
});

// Générer un lien d'onboarding pour le prestataire
export const createAccountLink = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.stripeConnectAccountId) {
      throw new Error("No Connect account found");
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeConnectAccountId,
      refresh_url: 'https://yourapp.com/reauth',
      return_url: 'https://yourapp.com/dashboard',
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  },
});
```

### B. Créer un Payment Intent

```typescript
// Créer un paiement
export const createPaymentIntent = mutation({
  args: {
    amount: v.number(), // en centimes (5000 = $50)
    sessionId: v.id("meetSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: args.amount,
      currency: 'usd',
      metadata: {
        sessionId: args.sessionId,
        demandeurId: session.demandeurId,
        offreurId: session.offreurId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },
});
```

### C. Transférer l'argent au prestataire

```typescript
// Transférer l'argent au prestataire (après paiement réussi)
export const transferToProvider = mutation({
  args: {
    sessionId: v.id("meetSessions"),
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const prestataire = await ctx.db.get(session.offreurId);
    if (!prestataire?.stripeConnectAccountId) {
      throw new Error("Prestataire has no Connect account");
    }

    // Récupérer le taux de commission
    const commissionRate = await getCommissionRate(ctx);
    const totalAmount = session.offre.proposedPrice * 100; // en centimes
    const commissionAmount = Math.round((totalAmount * commissionRate) / 100);
    const providerAmount = totalAmount - commissionAmount;

    // Créer le transfert vers le compte Connect
    const transfer = await stripe.transfers.create({
      amount: providerAmount,
      currency: 'usd',
      destination: prestataire.stripeConnectAccountId,
      transfer_group: args.sessionId,
      metadata: {
        sessionId: args.sessionId,
        paymentIntentId: args.paymentIntentId,
      },
    });

    // Enregistrer la transaction
    await ctx.db.insert("transactions", {
      sessionId: args.sessionId,
      offreId: session.offreId,
      demandeurId: session.demandeurId,
      offreurId: session.offreurId,
      totalAmount: totalAmount / 100,
      commissionRate,
      commissionAmount: commissionAmount / 100,
      providerAmount: providerAmount / 100,
      stripeTransferId: transfer.id,
      status: "completed",
      createdAt: Date.now(),
    });

    return { transferId: transfer.id };
  },
});
```

### D. Gérer les Webhooks Stripe

```typescript
// backend/api/stripe-webhook.ts
import { Webhook } from 'svix';

export default async function handler(req, res) {
  const payload = await req.text();
  const headers = req.headers;

  const wh = new Webhook(process.env.STRIPE_WEBHOOK_SECRET!);
  let event;

  try {
    event = wh.verify(payload, headers) as any;
  } catch (err) {
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  // Gérer les événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Déclencher le transfert vers le prestataire
      await transferToProvider({
        sessionId: paymentIntent.metadata.sessionId,
        paymentIntentId: paymentIntent.id,
      });
      break;

    case 'transfer.created':
      console.log('Transfer created:', event.data.object);
      break;

    case 'transfer.failed':
      console.log('Transfer failed:', event.data.object);
      // Gérer l'échec du transfert
      break;
  }

  res.json({ received: true });
}
```

---

## 4. Code Frontend Nécessaire

### A. Initialiser Stripe

```javascript
// frontend/src/lib/stripe.js
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);
```

### B. Page de Paiement avec Stripe Elements

```jsx
// frontend/src/pages/Payment.jsx
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';

function CheckoutForm({ clientSecret, sessionId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/meet/${sessionId}`,
      },
    });

    if (error) {
      console.error(error);
      alert('Erreur de paiement');
    } else if (paymentIntent.status === 'succeeded') {
      // Paiement réussi, redirection automatique
      console.log('Paiement réussi!');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || isProcessing}>
        {isProcessing ? 'Traitement...' : 'Payer'}
      </button>
    </form>
  );
}

export default function Payment() {
  const [clientSecret, setClientSecret] = useState('');
  
  // Créer le Payment Intent au chargement
  useEffect(() => {
    createPaymentIntent({ amount: 5000, sessionId })
      .then(result => setClientSecret(result.clientSecret));
  }, []);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} sessionId={sessionId} />
    </Elements>
  );
}
```

### C. Onboarding du prestataire

```jsx
// frontend/src/pages/ProviderOnboarding.jsx
export default function ProviderOnboarding() {
  const createAccount = useMutation(api.stripe.createConnectAccount);
  const getAccountLink = useMutation(api.stripe.createAccountLink);

  const handleOnboarding = async () => {
    // 1. Créer le compte Connect
    const { accountId } = await createAccount({
      userId: user.userId,
      email: user.email,
    });

    // 2. Obtenir le lien d'onboarding
    const { url } = await getAccountLink({ userId: user.userId });

    // 3. Rediriger vers Stripe
    window.location.href = url;
  };

  return (
    <button onClick={handleOnboarding}>
      Configurer mon compte pour recevoir des paiements
    </button>
  );
}
```

---

## 5. Schéma de Base de Données

### Ajouter au schéma users :

```typescript
users: defineTable({
  name: v.string(),
  email: v.string(),
  role: v.union(v.literal("admin"), v.literal("user")),
  stripeConnectAccountId: v.optional(v.string()), // ← NOUVEAU
  stripeOnboardingComplete: v.optional(v.boolean()), // ← NOUVEAU
  createdAt: v.number(),
})
```

### Ajouter au schéma transactions :

```typescript
transactions: defineTable({
  sessionId: v.id("meetSessions"),
  offreId: v.id("offres"),
  demandeurId: v.id("users"),
  offreurId: v.id("users"),
  totalAmount: v.number(),
  commissionRate: v.number(),
  commissionAmount: v.number(),
  providerAmount: v.number(),
  stripePaymentIntentId: v.optional(v.string()), // ← NOUVEAU
  stripeTransferId: v.optional(v.string()), // ← NOUVEAU
  status: v.union(
    v.literal("pending"),
    v.literal("completed"),
    v.literal("refunded"),
    v.literal("failed") // ← NOUVEAU
  ),
  createdAt: v.number(),
})
```

---

## 6. Dépendances NPM à installer

```bash
# Backend
npm install stripe

# Frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 7. Variables d'environnement

```env
# Backend (.env)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend (.env.local)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 8. Configuration Stripe Dashboard

1. **Activer Stripe Connect**
   - Dashboard → Connect → Get Started
   - Choisir "Express" ou "Standard"

2. **Configurer les Webhooks**
   - Dashboard → Developers → Webhooks
   - Ajouter endpoint: `https://yourapp.com/api/stripe-webhook`
   - Événements à écouter :
     - `payment_intent.succeeded`
     - `transfer.created`
     - `transfer.failed`
     - `account.updated`

3. **Configurer les paramètres de paiement**
   - Dashboard → Settings → Payment methods
   - Activer les cartes de crédit/débit

---

## 9. Flux de Test

### Mode Test (Cartes de test Stripe)

```
Carte de test réussie : 4242 4242 4242 4242
Carte de test échouée : 4000 0000 0000 0002
Date : n'importe quelle date future
CVV : n'importe quel 3 chiffres
```

### Tester le flux complet :

1. Créer un compte prestataire
2. Onboarding Stripe Connect (mode test)
3. Créer une demande
4. Proposer une offre
5. Accepter l'offre
6. Payer avec carte test
7. Vérifier le transfert dans Stripe Dashboard

---

## 10. Sécurité et Conformité

### Points importants :

- ✅ **PCI Compliance** : Stripe gère la conformité
- ✅ **Webhooks sécurisés** : Vérifier la signature
- ✅ **Gestion des erreurs** : Gérer les échecs de transfert
- ✅ **Remboursements** : Implémenter la logique de refund
- ✅ **KYC** : Stripe Connect gère la vérification d'identité

---

## 11. Coûts Stripe

### Tarification Stripe Connect :

- **Paiement standard** : 2.9% + $0.30 par transaction
- **Transfert Connect** : Gratuit
- **Frais de plateforme** : Vous gardez votre commission (10%)

### Exemple avec $50 :

```
Demandeur paie : $50.00
Frais Stripe : $1.76 (2.9% + $0.30)
Montant net : $48.24

Votre commission (10% de $50) : $5.00
Prestataire reçoit : $43.24

Note : Vous payez les frais Stripe sur le montant total
```

---

## 12. Checklist de Mise en Production

- [ ] Compte Stripe vérifié
- [ ] Stripe Connect activé
- [ ] Webhooks configurés
- [ ] Variables d'environnement en production
- [ ] Tests de bout en bout effectués
- [ ] Gestion des erreurs implémentée
- [ ] Logs et monitoring configurés
- [ ] Politique de remboursement définie
- [ ] CGV et mentions légales à jour
- [ ] Support client préparé

---

## Ressources

- Documentation Stripe Connect : https://stripe.com/docs/connect
- Stripe Testing : https://stripe.com/docs/testing
- Webhooks : https://stripe.com/docs/webhooks
