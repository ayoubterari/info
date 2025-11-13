# Guide de Dépannage - Dashboard et Profil

## 🐛 Problèmes Résolus

### 0. Les champs se désactivent automatiquement après 1 seconde

**Symptômes:**
- Clic sur "Modifier le profil" active les champs
- Les champs se désactivent automatiquement après ~1 seconde
- Impossible de modifier les informations

**Cause:**
- Le composant `ProfileTab` se remontait à chaque changement d'onglet
- Radix UI Tabs démonte par défaut les contenus inactifs
- Le `useEffect` réinitialisait `formData` à chaque remontage
- L'état `isEditing` était perdu

**Solution appliquée:**

1. **Utilisation de `useRef` pour éviter les réinitialisations:**
```javascript
const isInitialized = useRef(false)

useEffect(() => {
  if (user && !isInitialized.current) {
    setFormData({
      name: user.name || '',
      email: user.email || '',
    })
    isInitialized.current = true
  }
}, [user])
```

2. **Utilisation de `forceMount` sur TabsContent:**
```javascript
<TabsContent value="profile" className="space-y-4" forceMount>
  <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
    <ProfileTab />
  </div>
</TabsContent>
```

Cela garde le composant ProfileTab monté en permanence, préservant son état même quand on change d'onglet.

## 🐛 Problèmes Résolus

### 1. Les champs de formulaire ne s'affichent pas dans le profil

**Symptômes:**
- Les labels "Nom complet" et "Email" sont visibles
- Les champs de saisie sont invisibles ou vides
- Le bouton "Modifier le profil" est visible

**Cause:**
- Les inputs étaient initialisés avant que les données utilisateur soient chargées
- Le style `disabled:opacity-50` rendait les champs trop transparents
- Les valeurs n'étaient pas mises à jour après le chargement de l'utilisateur

**Solution appliquée:**

1. **Ajout d'un useEffect dans ProfileTab.jsx:**
```javascript
useEffect(() => {
  if (user) {
    setFormData({
      name: user.name || '',
      email: user.email || '',
    })
  }
}, [user])
```

2. **Amélioration du style des inputs désactivés:**
```javascript
// Dans input.jsx
"disabled:bg-gray-50 disabled:text-gray-700"
// Au lieu de:
"disabled:opacity-50"
```

3. **Ajout de couleur explicite pour le texte:**
```javascript
"text-sm text-gray-900"
```

### 2. Conflit de fichiers users.js et users.ts

**Symptômes:**
```
✘ [ERROR] Two output files share the same path but have different contents: out\users.js.map
✘ [ERROR] Two output files share the same path but have different contents: out\users.js
```

**Cause:**
- Deux fichiers avec le même nom mais extensions différentes (.js et .ts)
- Convex ne peut pas compiler les deux en même temps

**Solution:**
1. Fusionner le contenu de `users.js` dans `users.ts`
2. Supprimer le fichier `users.js`

### 3. Le profil ne se charge pas après authentification

**Symptômes:**
- Redirection immédiate vers l'accueil après connexion
- Impossible d'accéder au dashboard

**Cause:**
- Le hook `useAuth` initialisait `loading` à `false`
- Le Dashboard vérifiait `!loading && !user` et redirigeait immédiatement

**Solution:**
```javascript
// Dans useAuth.js
const [loading, setLoading] = useState(true) // Au lieu de false

useEffect(() => {
  // ... chargement de l'utilisateur
  setLoading(false) // Fin du chargement
}, [])
```

## 🔍 Vérifications à faire

### Si les champs ne s'affichent toujours pas:

1. **Vérifier la console du navigateur:**
   - Ouvrir les DevTools (F12)
   - Chercher des erreurs JavaScript
   - Vérifier que `user` contient bien les données

2. **Vérifier le localStorage:**
   ```javascript
   // Dans la console du navigateur
   console.log(localStorage.getItem('user'))
   ```

3. **Vérifier que les composants sont bien importés:**
   ```javascript
   // Dans ProfileTab.jsx
   import { Input } from '../ui/input'
   import { Label } from '../ui/label'
   ```

4. **Vérifier que Tailwind CSS est bien configuré:**
   - Les classes CSS doivent être compilées
   - Vérifier `tailwind.config.js`

### Si la modification ne fonctionne pas:

1. **Vérifier que Convex est en cours d'exécution:**
   ```bash
   cd backend
   npx convex dev
   ```

2. **Vérifier les mutations dans users.ts:**
   - La fonction `updateProfile` doit exister
   - Elle doit être exportée correctement

3. **Vérifier les permissions:**
   - L'utilisateur doit avoir le droit de modifier son profil
   - Vérifier que `userId` est correct

## 🛠️ Commandes utiles

### Redémarrer le frontend:
```bash
cd frontend
npm run dev
```

### Redémarrer le backend:
```bash
cd backend
npx convex dev
```

### Nettoyer le cache:
```bash
# Frontend
cd frontend
rm -rf node_modules
npm install

# Backend
cd backend
rm -rf node_modules
npm install
```

### Vérifier les dépendances:
```bash
cd frontend
npm list @radix-ui/react-label
npm list @radix-ui/react-avatar
```

## 📝 Checklist de débogage

- [ ] Le backend Convex est en cours d'exécution
- [ ] Le frontend est en cours d'exécution
- [ ] L'utilisateur est connecté (vérifier localStorage)
- [ ] Les composants UI sont bien importés
- [ ] Les styles Tailwind sont compilés
- [ ] Pas d'erreurs dans la console
- [ ] Les mutations Convex sont définies
- [ ] Les données utilisateur sont chargées

## 🚨 Erreurs courantes

### "Cannot read property 'name' of undefined"
**Cause:** L'utilisateur n'est pas encore chargé
**Solution:** Ajouter une vérification `if (!user) return null`

### "Mutation not found: users.updateProfile"
**Cause:** La mutation n'est pas exportée ou Convex n'est pas démarré
**Solution:** Vérifier `users.ts` et redémarrer Convex

### "This email is already used"
**Cause:** L'email existe déjà dans la base de données
**Solution:** Utiliser un autre email ou vérifier la logique de validation

### Les styles ne s'appliquent pas
**Cause:** Tailwind CSS n'est pas configuré correctement
**Solution:** Vérifier `tailwind.config.js` et redémarrer le serveur

## 💡 Bonnes pratiques

1. **Toujours vérifier que les données sont chargées avant de les utiliser:**
   ```javascript
   if (!user) return <div>Chargement...</div>
   ```

2. **Utiliser useEffect pour les effets de bord:**
   ```javascript
   useEffect(() => {
     // Code qui dépend de props/state
   }, [dependencies])
   ```

3. **Gérer les états de chargement:**
   ```javascript
   const [loading, setLoading] = useState(true)
   ```

4. **Afficher des messages d'erreur clairs:**
   ```javascript
   catch (error) {
     setMessage({ type: 'error', text: error.message })
   }
   ```

5. **Valider les données côté client ET serveur:**
   ```javascript
   // Client
   if (!email) return
   
   // Serveur (Convex)
   if (!email) throw new Error("Email requis")
   ```
