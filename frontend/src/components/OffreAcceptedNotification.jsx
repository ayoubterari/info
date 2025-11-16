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

    // Si c'est la première fois qu'on charge les offres, on les stocke
    if (previousOffresRef.current === null) {
      previousOffresRef.current = offres
      return
    }

    // Comparer avec les offres précédentes pour détecter un changement de statut
    const previousOffres = previousOffresRef.current
    
    offres.forEach((currentOffre) => {
      const previousOffre = previousOffres.find(o => o._id === currentOffre._id)
      
      // Si une offre vient d'être acceptée (changement de pending à accepted)
      if (
        currentOffre.status === 'accepted' && 
        previousOffre?.status === 'pending'
      ) {
        console.log('🎉 Offre acceptée détectée! Redirection vers /mes-offres')
        
        // Afficher une notification
        const notification = new Notification('Offre acceptée !', {
          body: `Votre offre pour "${currentOffre.demande?.title}" a été acceptée. Le demandeur procède au paiement.`,
          icon: '/favicon.ico',
          tag: 'offre-accepted'
        })

        notification.onclick = () => {
          navigate('/mes-offres')
          window.focus()
        }

        // Rediriger automatiquement vers /mes-offres
        setTimeout(() => {
          navigate('/mes-offres')
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
