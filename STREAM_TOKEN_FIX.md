# Fix du problème de token Stream.io

## 🐛 Problème

Erreur: `userToken does not have a user_id or is not matching with user.id`

Stream.io nécessite un token JWT valide signé avec la clé secrète de l'API.

## ✅ Solution implémentée

### 1. Installation des dépendances

**Backend:**
```bash
cd backend
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

**Frontend:**
```bash
cd frontend
npm install jsonwebtoken
```

### 2. Création de la query Convex

**Fichier: `backend/convex/stream.ts`**

Cette query génère un token JWT valide côté serveur avec la clé secrète Stream.io.

```typescript
import { v } from "convex/values";
import { query } from "./_generated/server";
import jwt from "jsonwebtoken";

const STREAM_API_SECRET = "mmhsuh77cvfbsm8a28gu24pvzhupgs8dv4g3979bm8v989uckmuywae7ypw8zzwh";

export const generateStreamToken = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const payload = {
      user_id: args.userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24h
    };

    const token = jwt.sign(payload, STREAM_API_SECRET, { algorithm: "HS256" });
    return { token };
  },
});
```

### 3. Modification de MeetRoom.jsx

**Avant:**
```javascript
token: 'development', // ❌ Ne fonctionne pas
```

**Après:**
```javascript
const streamToken = useQuery(api.stream.generateStreamToken,
  user?.userId ? { userId: user.userId } : "skip"
)

// Dans le useEffect
token: streamToken.token, // ✅ Token JWT valide
```

### 4. Clé secrète Stream.io

**Où trouver la clé secrète:**
1. Allez sur https://getstream.io/dashboard/
2. Sélectionnez votre application
3. Allez dans "Authentication"
4. Copiez le "Secret"

**Important:** 
- ⚠️ Ne jamais exposer la clé secrète côté client
- ✅ Toujours générer les tokens côté serveur (Convex)
- 🔒 En production, utilisez des variables d'environnement

### 5. Configuration des variables d'environnement (Production)

**Backend Convex:**
```bash
# Ajouter dans les environment variables de Convex
STREAM_API_SECRET=votre_clé_secrète_ici
```

**Puis dans stream.ts:**
```typescript
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;
```

## 🧪 Test

1. Acceptez une offre
2. Vérifiez que la redirection fonctionne
3. La page MeetRoom devrait charger sans erreur
4. Le token est généré automatiquement
5. La connexion Stream.io réussit

## 📝 Résumé des changements

**Fichiers créés:**
- `backend/convex/stream.ts` - Génération de tokens

**Fichiers modifiés:**
- `frontend/src/pages/MeetRoom.jsx` - Utilisation du token Convex

**Dépendances ajoutées:**
- `jsonwebtoken` (backend)
- `@types/jsonwebtoken` (backend dev)

## ⚠️ Notes de sécurité

1. **Clé secrète:** Ne jamais committer la clé secrète dans le code
2. **Token côté serveur:** Toujours générer les tokens côté serveur
3. **Expiration:** Les tokens expirent après 24h
4. **Production:** Utiliser des variables d'environnement sécurisées

## 🔄 Prochaines étapes

Si vous voyez encore des erreurs:

1. Vérifiez que la clé secrète est correcte
2. Vérifiez que `user.userId` est bien défini
3. Vérifiez la console pour voir le token généré
4. Testez avec deux utilisateurs différents

## 📚 Documentation Stream.io

- [Authentication](https://getstream.io/video/docs/api/authentication/)
- [Token Generation](https://getstream.io/video/docs/api/authentication/tokens/)
