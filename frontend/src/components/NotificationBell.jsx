import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../contexts/AuthContext'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { requestNotificationPermission } from '../utils/registerServiceWorker'

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [swRegistration, setSwRegistration] = useState(null)
  const dropdownRef = useRef(null)
  const previousNotificationsRef = useRef(null)

  // Récupérer les notifications
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    user?.userId ? { userId: user.userId } : "skip"
  )

  const unreadCount = useQuery(
    api.notifications.countUnreadNotifications,
    user?.userId ? { userId: user.userId } : "skip"
  )

  const markAsRead = useMutation(api.notifications.markNotificationAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead)

  // Initialiser le Service Worker et demander la permission
  useEffect(() => {
    const initNotifications = async () => {
      // Récupérer l'enregistrement du Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready
          setSwRegistration(registration)
          console.log('✅ Service Worker prêt pour les notifications')
        } catch (error) {
          console.error('❌ Erreur Service Worker:', error)
        }
      }

      // Demander la permission pour les notifications
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
        
        if (Notification.permission === 'default') {
          const permission = await requestNotificationPermission()
          setNotificationPermission(permission)
        }
      }
    }

    initNotifications()
  }, [])

  // Afficher une notification push lorsqu'une nouvelle notification arrive
  useEffect(() => {
    if (!notifications || !user) return

    // Si c'est la première fois qu'on charge les notifications, on les stocke
    if (previousNotificationsRef.current === null) {
      previousNotificationsRef.current = notifications
      return
    }

    // Comparer avec les notifications précédentes pour détecter les nouvelles
    const previousNotifications = previousNotificationsRef.current
    const newNotifications = notifications.filter(
      notif => !previousNotifications.find(prev => prev._id === notif._id)
    )

    // Afficher une notification push pour chaque nouvelle notification
    if (newNotifications.length > 0 && Notification.permission === 'granted') {
      newNotifications.forEach(async (notif) => {
        try {
          // Utiliser le Service Worker si disponible (meilleur support mobile)
          if (swRegistration) {
            await swRegistration.showNotification(notif.title, {
              body: notif.message,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: notif._id,
              requireInteraction: false,
              vibrate: [200, 100, 200],
              data: {
                notificationId: notif._id,
                relatedType: notif.relatedType,
                url: notif.relatedType === 'offre' ? '/mes-demandes' : '/',
              },
            })
            console.log('✅ Notification affichée via Service Worker')
          } else {
            // Fallback: Notification API classique (desktop)
            const notification = new Notification(notif.title, {
              body: notif.message,
              icon: '/icon-192x192.png',
              tag: notif._id,
              requireInteraction: false,
            })

            notification.onclick = () => {
              markAsRead({ notificationId: notif._id })
              if (notif.relatedType === 'offre') {
                navigate('/mes-demandes')
              }
              window.focus()
              notification.close()
            }

            setTimeout(() => notification.close(), 5000)
            console.log('✅ Notification affichée via Notification API')
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors de l\'affichage de la notification:', error)
        }
      })
    }

    // Mettre à jour la référence
    previousNotificationsRef.current = notifications
  }, [notifications, user, navigate, markAsRead])

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = async (notification) => {
    // Marquer comme lue
    if (!notification.read) {
      await markAsRead({ notificationId: notification._id })
    }

    // Naviguer vers la page appropriée
    if (notification.relatedType === 'offre') {
      navigate('/mes-demandes')
    }

    setIsOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    if (user?.userId) {
      await markAllAsRead({ userId: user.userId })
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Il y a ${diffInDays}j`
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div className="overflow-y-auto flex-1">
            {!notifications || notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Demander la permission si nécessaire */}
          {notificationPermission === 'denied' && (
            <div className="p-3 bg-yellow-50 border-t border-yellow-200">
              <p className="text-xs text-yellow-800">
                Les notifications push sont bloquées. Activez-les dans les paramètres de votre navigateur.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
