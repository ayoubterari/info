# Guide de test de l'authentification

## Prérequis

Assurez-vous que :
1. ✅ Le backend est démarré (`cd backend && npm run dev`)
2. ✅ Le frontend est démarré (`cd frontend && npm run dev`)
3. ✅ L'application est accessible sur http://localhost:5173

## Test 1 : Inscription (Sign Up)

### Étapes
1. Ouvrez l'application dans votre navigateur
2. Cliquez sur le bouton **"Sign Up"** dans le header (en haut à droite)
3. Une popup modale devrait s'ouvrir avec le titre "Créer un compte"
4. Remplissez le formulaire :
   - **Nom complet** : Jean Dupont
   - **Email** : jean.dupont@test.com
   - **Mot de passe** : test123456
5. Cliquez sur **"Créer mon compte"**

### Résultat attendu
- ✅ La popup se ferme automatiquement
- ✅ Le header affiche maintenant votre nom "Jean Dupont"
- ✅ Un bouton "Déconnexion" apparaît
- ✅ Les boutons "Sign In" et "Sign Up" disparaissent

### En cas d'erreur
- Si vous voyez "Un utilisateur avec cet email existe déjà", utilisez un autre email
- Vérifiez la console du navigateur (F12) pour les erreurs
- Vérifiez que le backend Convex est bien démarré

## Test 2 : Déconnexion

### Étapes
1. Après vous être connecté (Test 1)
2. Cliquez sur le bouton **"Déconnexion"** dans le header

### Résultat attendu
- ✅ Votre nom disparaît du header
- ✅ Les boutons "Sign In" et "Sign Up" réapparaissent
- ✅ Le bouton "Déconnexion" disparaît

## Test 3 : Connexion (Sign In)

### Étapes
1. Après vous être déconnecté (Test 2)
2. Cliquez sur le bouton **"Sign In"** dans le header
3. Une popup modale devrait s'ouvrir avec le titre "Se connecter"
4. Remplissez le formulaire avec les mêmes identifiants :
   - **Email** : jean.dupont@test.com
   - **Mot de passe** : test123456
5. Cliquez sur **"Se connecter"**

### Résultat attendu
- ✅ La popup se ferme automatiquement
- ✅ Le header affiche à nouveau votre nom "Jean Dupont"
- ✅ Vous êtes reconnecté avec succès

### En cas d'erreur
- Si vous voyez "Email ou mot de passe incorrect", vérifiez vos identifiants
- Assurez-vous d'avoir créé le compte d'abord (Test 1)

## Test 4 : Persistance de session

### Étapes
1. Connectez-vous (Test 1 ou Test 3)
2. Rafraîchissez la page (F5 ou Ctrl+R)

### Résultat attendu
- ✅ Vous restez connecté après le rafraîchissement
- ✅ Votre nom est toujours affiché dans le header
- ✅ La session est persistée dans le localStorage

## Test 5 : Validation des champs

### Test 5.1 : Champs vides
1. Cliquez sur "Sign Up"
2. Essayez de soumettre le formulaire sans remplir les champs
3. **Résultat attendu** : Le navigateur empêche la soumission (champs requis)

### Test 5.2 : Email invalide
1. Cliquez sur "Sign Up"
2. Entrez un email invalide (ex: "test" sans @)
3. Essayez de soumettre
4. **Résultat attendu** : Le navigateur demande un email valide

### Test 5.3 : Mot de passe trop court
1. Cliquez sur "Sign Up"
2. Entrez un mot de passe de moins de 6 caractères (ex: "test")
3. Essayez de soumettre
4. **Résultat attendu** : Le navigateur demande au moins 6 caractères

## Test 6 : Gestion des erreurs

### Test 6.1 : Email déjà utilisé
1. Essayez de créer un compte avec un email déjà enregistré
2. **Résultat attendu** : Message d'erreur "Un utilisateur avec cet email existe déjà"

### Test 6.2 : Mauvais mot de passe
1. Essayez de vous connecter avec un mauvais mot de passe
2. **Résultat attendu** : Message d'erreur "Email ou mot de passe incorrect"

## Test 7 : Interface responsive

### Étapes
1. Ouvrez les DevTools (F12)
2. Activez le mode responsive (Ctrl+Shift+M)
3. Testez différentes tailles d'écran :
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

### Résultat attendu
- ✅ Le header s'adapte à toutes les tailles
- ✅ La popup modale est centrée et responsive
- ✅ Les boutons restent accessibles
- ✅ Le texte est lisible

## Test 8 : Vérification dans Convex Dashboard

### Étapes
1. Ouvrez le [Convex Dashboard](https://dashboard.convex.dev)
2. Sélectionnez votre projet "calculating-magpie-762"
3. Allez dans l'onglet "Data"
4. Cliquez sur la table "users"

### Résultat attendu
- ✅ Vous voyez les utilisateurs créés
- ✅ Les données sont correctement stockées :
  - name
  - email
  - role (devrait être "user")
  - createdAt (timestamp)

## Checklist complète

- [ ] Test 1 : Inscription réussie
- [ ] Test 2 : Déconnexion réussie
- [ ] Test 3 : Connexion réussie
- [ ] Test 4 : Session persistée après rafraîchissement
- [ ] Test 5 : Validation des champs fonctionne
- [ ] Test 6 : Messages d'erreur appropriés
- [ ] Test 7 : Interface responsive
- [ ] Test 8 : Données visibles dans Convex Dashboard

## Dépannage

### Le backend ne démarre pas
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Le frontend ne démarre pas
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Les mutations ne fonctionnent pas
1. Vérifiez que `VITE_CONVEX_URL` est correct dans `frontend/.env.local`
2. Vérifiez que le backend Convex est démarré
3. Regardez la console du navigateur pour les erreurs
4. Vérifiez la console du terminal backend pour les erreurs

### La popup ne s'ouvre pas
1. Vérifiez la console du navigateur (F12)
2. Assurez-vous que tous les composants sont importés correctement
3. Vérifiez qu'il n'y a pas d'erreurs JavaScript

## Prochaines étapes

Une fois tous les tests passés :
1. ✅ L'authentification fonctionne parfaitement
2. Vous pouvez commencer à développer les fonctionnalités métier
3. Intégrer la gestion des posts et commentaires
4. Personnaliser l'interface utilisateur

## Support

Si vous rencontrez des problèmes :
1. Consultez `AUTHENTICATION.md` pour plus de détails
2. Vérifiez les logs du backend et du frontend
3. Consultez la documentation Convex : https://docs.convex.dev
