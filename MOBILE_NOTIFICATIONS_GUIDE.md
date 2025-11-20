# Guide des Notifications Push sur Mobile

## Problème résolu

Les notifications push fonctionnent maintenant sur **mobile** grâce à l'implémentation d'un Service Worker. Auparavant, elles ne fonctionnaient que sur desktop.

## Améliorations apportées

### 1. Service Worker (`public/sw.js`)
- ✅ Gestion des notifications push même quand l'app est fermée
- ✅ Support des vibrations sur mobile
- ✅ Icônes et badges personnalisés
- ✅ Gestion des clics sur notifications
- ✅ Cache intelligent pour mode hors ligne

### 2. Utilitaires (`src/utils/registerServiceWorker.js`)
- ✅ Enregistrement automatique du Service Worker
- ✅ Demande de permission pour les notifications
- ✅ Détection de l'état PWA (installée ou non)
- ✅ Fonction de test des notifications

### 3. Composant NotificationBell amélioré
- ✅ Utilise le Service Worker pour afficher les notifications
- ✅ Fallback sur Notification API classique si SW non disponible
- ✅ Support des vibrations (200ms, 100ms, 200ms)
- ✅ Icônes haute résolution (192x192px)

### 4. Manifest.json amélioré
- ✅ Permission de notifications explicite
- ✅ Raccourcis vers pages importantes
- ✅ Catégories et métadonnées PWA

## Comment tester sur mobile

### Android (Chrome/Firefox)

#### Étape 1: Installer l'application (PWA)
1. Ouvrez l'application dans Chrome/Firefox mobile
2. Appuyez sur le menu (⋮) → "Installer l'application" ou "Ajouter à l'écran d'accueil"
3. Confirmez l'installation

#### Étape 2: Autoriser les notifications
1. Lors de la première ouverture, autorisez les notifications quand demandé
2. Si vous avez refusé, allez dans:
   - **Chrome**: Paramètres du site → Notifications → Autoriser
   - **Firefox**: Paramètres → Autorisations → Notifications → Autoriser

#### Étape 3: Tester
1. Connectez-vous avec un compte
2. Créez une demande avec un autre compte
3. Proposez une offre sur cette demande
4. Vous devriez recevoir une notification push avec vibration !

### iOS (Safari)

⚠️ **Important**: iOS a des limitations strictes pour les notifications push.

#### Prérequis iOS 16.4+
- L'application **DOIT** être installée comme PWA (Ajouter à l'écran d'accueil)
- Les notifications ne fonctionnent **PAS** dans Safari normal

#### Étape 1: Installer la PWA
1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton Partager (carré avec flèche)
3. Sélectionnez "Sur l'écran d'accueil"
4. Confirmez

#### Étape 2: Autoriser les notifications
1. Ouvrez l'app depuis l'écran d'accueil (pas Safari)
2. Autorisez les notifications quand demandé
3. Si refusé, allez dans: Réglages → Notifications → FreeL AI → Autoriser

#### Étape 3: Tester
1. Suivez les mêmes étapes que pour Android
2. Les notifications apparaîtront comme notifications système iOS

## Vérifier que tout fonctionne

### Console du navigateur
Ouvrez la console et vérifiez ces messages:
```
✅ Service Worker enregistré avec succès
✅ Service Worker prêt pour les notifications
✅ Notification affichée via Service Worker
```

### Test manuel
Vous pouvez tester manuellement dans la console:
```javascript
// Importer la fonction de test
import { showTestNotification } from './src/utils/registerServiceWorker.js'

// Afficher une notification de test
showTestNotification()
```

### DevTools
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet "Application" (Chrome) ou "Storage" (Firefox)
3. Vérifiez que le Service Worker est enregistré et actif
4. Testez les notifications depuis "Service Workers" → "Push"

## Caractéristiques des notifications

### Sur Android
- ✅ Notification système native
- ✅ Vibration (200ms, 100ms, 200ms)
- ✅ Icône haute résolution
- ✅ Badge sur l'icône de l'app
- ✅ Son de notification
- ✅ Fonctionne même app fermée
- ✅ Groupement automatique

### Sur iOS (16.4+)
- ✅ Notification système native
- ⚠️ Vibration limitée
- ✅ Icône de l'app
- ✅ Badge sur l'icône
- ✅ Son de notification
- ⚠️ Nécessite PWA installée
- ⚠️ Limitations Apple

## Dépannage

### "Notification permission denied"
**Solution**: Réinitialisez les permissions du site
- Chrome: Paramètres du site → Réinitialiser les autorisations
- Firefox: Oubliez le site et rechargez
- iOS: Réglages → Safari → Effacer historique et données

### "Service Worker not registered"
**Solution**: Vérifiez que:
1. Vous êtes en HTTPS (ou localhost)
2. Le fichier `sw.js` est accessible à `/sw.js`
3. Pas d'erreurs dans la console
4. Le navigateur supporte les Service Workers

### "Notifications don't appear on iOS"
**Solution**: 
1. Vérifiez iOS 16.4+ minimum
2. L'app DOIT être installée comme PWA
3. Ouvrez depuis l'écran d'accueil, PAS Safari
4. Vérifiez les permissions dans Réglages

### "Vibration doesn't work"
**Solution**:
- Vérifiez que le mode silencieux n'est pas activé
- Sur iOS, la vibration est limitée par le système
- Sur Android, vérifiez les paramètres de vibration

## Limitations connues

### iOS
- ❌ Pas de notifications dans Safari (navigateur)
- ❌ Nécessite iOS 16.4+ minimum
- ❌ DOIT être installée comme PWA
- ⚠️ Vibration limitée par Apple
- ⚠️ Pas de sons personnalisés

### Android
- ✅ Support complet
- ✅ Fonctionne dans le navigateur ET en PWA
- ✅ Toutes les fonctionnalités disponibles

### Desktop
- ✅ Support complet (Chrome, Firefox, Edge, Safari)
- ✅ Notifications riches avec actions
- ✅ Fonctionne même navigateur fermé (si SW actif)

## Prochaines améliorations possibles

1. **Actions sur notifications**: Ajouter des boutons "Voir" et "Ignorer"
2. **Notifications groupées**: Grouper plusieurs notifications
3. **Sons personnalisés**: Différents sons selon le type
4. **Images dans notifications**: Afficher des images riches
5. **Notifications programmées**: Rappels automatiques
6. **Badge dynamique**: Nombre de notifications sur l'icône
7. **Notifications silencieuses**: Pour mises à jour en arrière-plan

## Ressources

- [MDN - Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [MDN - Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web.dev - Push Notifications](https://web.dev/push-notifications-overview/)
- [iOS Web Push](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)

## Support navigateurs

| Navigateur | Desktop | Android | iOS |
|------------|---------|---------|-----|
| Chrome     | ✅      | ✅      | ❌  |
| Firefox    | ✅      | ✅      | ❌  |
| Safari     | ✅      | ❌      | ✅ (16.4+, PWA uniquement) |
| Edge       | ✅      | ✅      | ❌  |
| Opera      | ✅      | ✅      | ❌  |

## Conclusion

Les notifications push fonctionnent maintenant sur **mobile Android** et **iOS 16.4+** (en PWA). Le Service Worker assure une expérience native avec vibrations, icônes haute résolution et fonctionnement même quand l'app est fermée.

Pour iOS, l'application **DOIT** être installée comme PWA depuis l'écran d'accueil pour que les notifications fonctionnent.
