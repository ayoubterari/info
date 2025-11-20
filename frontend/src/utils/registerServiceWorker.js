// Enregistrer le Service Worker pour les notifications push
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker non supporté par ce navigateur');
    return null;
  }

  try {
    // Enregistrer le Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('✅ Service Worker enregistré:', registration);

    // Attendre que le Service Worker soit actif
    await navigator.serviceWorker.ready;
    console.log('✅ Service Worker prêt');

    // Gérer les mises à jour du Service Worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 Nouvelle version du Service Worker détectée');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('✨ Nouvelle version disponible. Rechargez la page pour l\'activer.');
          
          // Optionnel: Afficher une notification à l'utilisateur
          if (confirm('Une nouvelle version est disponible. Recharger maintenant ?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });

    // Écouter les messages du Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Message du Service Worker:', event.data);
      
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        // Naviguer vers l'URL spécifiée
        if (event.data.url) {
          window.location.href = event.data.url;
        }
      }
    });

    return registration;
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
    return null;
  }
}

// Demander la permission pour les notifications
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Notifications non supportées par ce navigateur');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    console.log('✅ Permission de notification déjà accordée');
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    console.warn('⛔ Permission de notification refusée');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('🔔 Permission de notification:', permission);
    return permission;
  } catch (error) {
    console.error('❌ Erreur lors de la demande de permission:', error);
    return 'denied';
  }
}

// Afficher une notification de test
export async function showTestNotification() {
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.warn('Permission de notification non accordée');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  
  try {
    await registration.showNotification('Test de notification', {
      body: 'Les notifications fonctionnent correctement ! 🎉',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'test-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: {
        url: '/',
      },
    });
    
    console.log('✅ Notification de test affichée');
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage de la notification:', error);
  }
}

// Vérifier si l'application est installée (PWA)
export function isPWAInstalled() {
  // Vérifier si l'app est lancée en mode standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Vérifier si c'est iOS en mode standalone
  const isIOSStandalone = window.navigator.standalone === true;
  
  return isStandalone || isIOSStandalone;
}

// Obtenir l'état de l'installation PWA
export function getPWAInstallState() {
  return {
    isInstalled: isPWAInstalled(),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    isIOSStandalone: window.navigator.standalone === true,
    hasServiceWorker: 'serviceWorker' in navigator,
    hasNotifications: 'Notification' in window,
    notificationPermission: 'Notification' in window ? Notification.permission : 'denied',
  };
}
