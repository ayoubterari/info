import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../contexts/AuthContext'

export function OffreAcceptedNotification() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const previousOffresRef = useRef(null)

  // Surveiller les offres proposées par l'utilisateur
  const offres = useQuery(
    api.offres.getOffresProposees,
    user?.userId ? { userId: user.userId } : "skip"
  )

  useEffect(() => {
    if (!offres || !user) return

    console.log('🔍 [OffreAcceptedNotification] Vérification des offres:', {
      offresCount: offres.length,
      currentPath: window.location.pathname,
      userId: user.userId
    })

    // Si c'est la première fois qu'on charge les offres, on les stocke
    if (previousOffresRef.current === null) {
      console.log('📝 [OffreAcceptedNotification] Initialisation de la référence')
      previousOffresRef.current = offres
      return
    }

    // Comparer avec les offres précédentes pour détecter un changement de statut
    const previousOffres = previousOffresRef.current
    
    offres.forEach((currentOffre) => {
      const previousOffre = previousOffres.find(o => o._id === currentOffre._id)
      
      console.log('🔄 [OffreAcceptedNotification] Comparaison offre:', {
        offreId: currentOffre._id,
        currentStatus: currentOffre.status,
        previousStatus: previousOffre?.status,
        demandeTitle: currentOffre.demande?.title
      })
      
      // Si une offre vient d'être acceptée (changement de pending à accepted)
      if (
        currentOffre.status === 'accepted' && 
        previousOffre?.status === 'pending'
      ) {
        console.log('🎉 [OffreAcceptedNotification] Offre acceptée détectée! Redirection vers /mes-offres')
        console.log('📍 [OffreAcceptedNotification] Chemin actuel:', window.location.pathname)
        
        // Afficher une notification (seulement si supporté)
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            const notification = new Notification('Offre acceptée !', {
              body: `Votre offre pour "${currentOffre.demande?.title}" a été acceptée. Le demandeur procède au paiement.`,
              icon: '/favicon.ico',
              tag: 'offre-accepted'
            })

            notification.onclick = () => {
              navigate('/mes-offres')
              window.focus()
            }
          } catch (error) {
            console.warn('⚠️ [OffreAcceptedNotification] Erreur notification:', error)
          }
        }

        // Rediriger automatiquement vers /mes-offres
        // Utiliser window.location comme fallback pour mobile
        setTimeout(() => {
          console.log('🚀 [OffreAcceptedNotification] Redirection vers /mes-offres')
          try {
            navigate('/mes-offres')
          } catch (error) {
            console.error('❌ [OffreAcceptedNotification] Erreur navigate, utilisation de window.location')
            window.location.href = '/mes-offres'
          }
        }, 500)
      }
    })

    // Mettre à jour la référence
    previousOffresRef.current = offres
  }, [offres, navigate, user])

  // Demander la permission pour les notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return null // Ce composant n'affiche rien
}
