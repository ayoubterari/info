// Service Worker pour les notifications push
const CACHE_NAME = 'freel-v1';

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation');
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Écouter les messages push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push reçu:', event);
  
  let notificationData = {
    title: 'Nouvelle notification',
    body: 'Vous avez reçu une nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'notification',
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.message || data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        data: data.data || {},
        requireInteraction: data.requireInteraction || false,
      };
    } catch (e) {
      console.error('[Service Worker] Erreur parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      vibrate: [200, 100, 200],
    })
  );
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification cliquée:', event);
  
  event.notification.close();

  // Ouvrir ou focus sur l'application
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si l'application est déjà ouverte, la focus
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            // Envoyer un message au client pour naviguer si nécessaire
            if (event.notification.data && event.notification.data.url) {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: event.notification.data.url,
              });
            }
          });
        }
      }
      
      // Sinon, ouvrir une nouvelle fenêtre
      const urlToOpen = event.notification.data && event.notification.data.url 
        ? event.notification.data.url 
        : '/';
      
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + urlToOpen);
      }
    })
  );
});

// Gérer les requêtes réseau (stratégie Network First)
self.addEventListener('fetch', (event) => {
  // Ne pas cacher les requêtes Convex
  if (event.request.url.includes('convex.cloud') || 
      event.request.url.includes('convex.site')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cloner la réponse car elle ne peut être consommée qu'une fois
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // En cas d'erreur réseau, essayer de récupérer depuis le cache
        return caches.match(event.request);
      })
  );
});

// Gérer les messages du client
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message reçu:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
