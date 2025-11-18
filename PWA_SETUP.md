# Configuration PWA - FreeL AI

## ✅ Configuration terminée

Votre application est maintenant configurée comme une Progressive Web App (PWA) !

## 🎯 Fonctionnalités

### 1. **Installation sur mobile**
- Les utilisateurs verront automatiquement une invite d'installation après 3 secondes
- L'invite apparaît uniquement sur mobile et si l'app n'est pas déjà installée
- Design moderne avec animation slide-up

### 2. **Fonctionnement hors ligne**
- Service Worker configuré avec Workbox
- Cache automatique des assets (JS, CSS, images)
- Cache des polices Google Fonts

### 3. **Expérience native**
- Mode standalone (sans barre d'adresse du navigateur)
- Icône sur l'écran d'accueil
- Splash screen automatique
- Thème noir cohérent

## 📱 Test sur mobile

### Android (Chrome)
1. Ouvrez l'application sur Chrome mobile
2. Attendez 3 secondes pour voir l'invite d'installation
3. Cliquez sur "Installer"
4. L'app sera ajoutée à votre écran d'accueil

### iOS (Safari)
1. Ouvrez l'application sur Safari
2. Cliquez sur le bouton "Partager" (icône carré avec flèche)
3. Sélectionnez "Sur l'écran d'accueil"
4. Confirmez l'installation

## 🎨 Icônes

Les icônes actuelles sont des placeholders SVG. Pour la production :

1. Créez vos icônes PNG aux tailles suivantes :
   - `icon-192x192.png` (192x192 pixels)
   - `icon-512x512.png` (512x512 pixels)

2. Placez-les dans `/frontend/public/`

3. Assurez-vous qu'elles ont :
   - Fond opaque (pas de transparence)
   - Design simple et reconnaissable
   - Bon contraste

## 🔧 Configuration

### Fichiers modifiés/créés :
- ✅ `vite.config.js` - Plugin PWA configuré
- ✅ `index.html` - Meta tags PWA ajoutés
- ✅ `public/manifest.json` - Manifest de l'app
- ✅ `src/components/PWAInstallPrompt.jsx` - Composant d'invite
- ✅ `src/App.jsx` - Composant ajouté

### Dépendances installées :
- ✅ `vite-plugin-pwa` - Plugin Vite pour PWA

## 🚀 Build pour production

```bash
cd frontend
npm run build
```

Le build générera automatiquement :
- Service Worker (`sw.js`)
- Manifest optimisé
- Assets en cache

## 📊 Vérification

### Lighthouse (Chrome DevTools)
1. Ouvrez Chrome DevTools (F12)
2. Allez dans l'onglet "Lighthouse"
3. Sélectionnez "Progressive Web App"
4. Lancez l'audit

Vous devriez obtenir un score élevé (90+) !

### Application Panel
1. Chrome DevTools > Application
2. Vérifiez :
   - ✅ Manifest
   - ✅ Service Workers
   - ✅ Cache Storage

## 🎯 Personnalisation

### Modifier le délai d'affichage de l'invite

Dans `src/components/PWAInstallPrompt.jsx` :
```javascript
setTimeout(() => {
  setShowPrompt(true)
}, 3000) // Changez 3000 (3 secondes) selon vos besoins
```

### Désactiver le cache pour certaines ressources

Dans `vite.config.js`, modifiez `workbox.globPatterns` :
```javascript
globPatterns: ['**/*.{js,css,html,ico,png,svg}']
```

### Changer les couleurs du thème

Dans `vite.config.js` et `index.html` :
```javascript
theme_color: '#000000' // Votre couleur
background_color: '#ffffff' // Votre couleur
```

## 🐛 Dépannage

### L'invite ne s'affiche pas
- Vérifiez que vous êtes sur HTTPS (ou localhost)
- Vérifiez que l'app n'est pas déjà installée
- Vérifiez que vous n'avez pas déjà refusé (localStorage)
- Testez sur un vrai appareil mobile

### Service Worker ne se met pas à jour
```javascript
// Dans la console du navigateur
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
})
```

### Réinitialiser le refus d'installation
```javascript
// Dans la console du navigateur
localStorage.removeItem('pwa-install-declined')
```

## 📚 Ressources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developers.google.com/web/tools/workbox)

## ✨ Prochaines étapes

1. Remplacer les icônes placeholder par vos vraies icônes
2. Tester sur différents appareils
3. Configurer les notifications push (optionnel)
4. Ajouter une page offline personnalisée (optionnel)
