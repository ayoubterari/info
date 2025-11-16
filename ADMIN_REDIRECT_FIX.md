# Fix: Redirection Admin ne fonctionne pas

## Problème
Après avoir changé le rôle d'un utilisateur en `admin` dans Convex, la redirection vers `/admin` ne fonctionne pas lors de la connexion.

## Cause
Le rôle de l'utilisateur est stocké dans le `localStorage` du navigateur lors de la connexion. Si vous étiez déjà connecté avant de changer le rôle, l'ancien rôle est toujours en cache.

## Solutions

### Solution 1: Effacer le localStorage (Recommandé)

#### Option A: Via l'outil de debug
1. Ouvrez le fichier `frontend/clear-storage.html` dans votre navigateur
2. Cliquez sur "🗑️ Effacer le localStorage"
3. Retournez à l'application et reconnectez-vous

#### Option B: Via la console du navigateur
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet "Console"
3. Tapez: `localStorage.clear()`
4. Appuyez sur Entrée
5. Rechargez la page et reconnectez-vous

#### Option C: Via l'onglet Application
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet "Application" (ou "Storage")
3. Dans le menu de gauche, cliquez sur "Local Storage"
4. Sélectionnez votre domaine (localhost:5173)
5. Cliquez droit sur "user" et sélectionnez "Delete"
6. Rechargez la page et reconnectez-vous

### Solution 2: Se déconnecter et se reconnecter
1. Cliquez sur le bouton "Déconnexion" dans l'application
2. Reconnectez-vous avec vos identifiants
3. Le nouveau rôle sera récupéré depuis Convex

### Solution 3: Mode navigation privée
1. Ouvrez une fenêtre de navigation privée/incognito
2. Allez sur votre application
3. Connectez-vous
4. La redirection devrait fonctionner

## Vérification

### 1. Vérifier le rôle dans Convex
1. Allez sur le dashboard Convex
2. Ouvrez la table "users"
3. Trouvez votre utilisateur
4. Vérifiez que le champ `role` est bien `"admin"`

### 2. Vérifier le rôle dans le localStorage
1. Ouvrez les DevTools (F12)
2. Console → tapez: `JSON.parse(localStorage.getItem('user'))`
3. Vérifiez que `role: "admin"` apparaît

### 3. Vérifier les logs de connexion
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet "Console"
3. Connectez-vous
4. Vous devriez voir:
   ```
   Résultat de connexion: {userId: "...", name: "...", email: "...", role: "admin"}
   Rôle de l'utilisateur: admin
   Redirection vers /admin
   ```

## Test de la redirection

Après avoir effacé le localStorage et vous être reconnecté:

### Si vous êtes admin:
- ✅ Vous devriez être redirigé vers `/admin`
- ✅ Vous devriez voir le dashboard administrateur
- ✅ La sidebar devrait afficher les options admin

### Si vous êtes user:
- ✅ Vous devriez être redirigé vers `/dashboard`
- ✅ Vous devriez voir le dashboard utilisateur normal

## Créer un utilisateur admin dans Convex

Si vous n'avez pas encore d'utilisateur admin:

### Méthode 1: Modifier un utilisateur existant
1. Allez sur le dashboard Convex
2. Ouvrez la table "users"
3. Trouvez votre utilisateur
4. Cliquez sur "Edit"
5. Changez `role` de `"user"` à `"admin"`
6. Sauvegardez

### Méthode 2: Créer un nouvel admin via la console Convex
1. Allez dans l'onglet "Functions" de Convex
2. Sélectionnez `users:createUser`
3. Entrez les paramètres:
   ```json
   {
     "name": "Admin User",
     "email": "admin@example.com",
     "role": "admin"
   }
   ```
4. Exécutez la fonction

## Dépannage avancé

### Le rôle est correct mais la redirection ne fonctionne toujours pas

1. **Vérifiez que le backend retourne bien le rôle:**
   - Ouvrez `backend/convex/auth.ts`
   - Ligne 75-80 devrait contenir:
     ```typescript
     return {
       userId: user._id,
       email: user.email,
       name: user.name,
       role: user.role,  // ← Important
     };
     ```

2. **Vérifiez que le frontend stocke bien le rôle:**
   - Ouvrez `frontend/src/hooks/useAuth.js`
   - Ligne 51-56 devrait contenir:
     ```javascript
     const userData = {
       userId: result.userId,
       name: result.name,
       email: result.email,
       role: result.role,  // ← Important
     };
     ```

3. **Vérifiez la logique de redirection:**
   - Ouvrez `frontend/src/components/Header.jsx`
   - Ligne 36-42 devrait contenir:
     ```javascript
     if (result && result.role === 'admin') {
       console.log('Redirection vers /admin');
       navigate('/admin');
     } else if (result) {
       console.log('Redirection vers /dashboard');
       navigate('/dashboard');
     }
     ```

### Erreur "Cannot read property 'role' of undefined"

Si vous voyez cette erreur dans la console:
1. Le problème vient probablement de la mutation `signIn`
2. Vérifiez que Convex retourne bien un objet avec le rôle
3. Vérifiez votre connexion à Convex

## Support

Si le problème persiste:
1. Vérifiez les logs dans la console du navigateur
2. Vérifiez les logs dans le terminal où tourne le frontend
3. Vérifiez les logs dans le dashboard Convex
4. Assurez-vous que Convex est bien déployé et à jour

## Nettoyage des logs de debug

Une fois que tout fonctionne, vous pouvez retirer les `console.log` dans `Header.jsx` (lignes 31-33 et 37, 40).
