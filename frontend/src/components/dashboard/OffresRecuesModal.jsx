import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { User, DollarSign, Calendar, Volume2, Check, X } from 'lucide-react'

export function OffresRecuesModal({ open, onOpenChange, demandeId, demandeTitle }) {
  const navigate = useNavigate()
  const offres = useQuery(
    api.offres.getOffresByDemandeWithUser,
    demandeId ? { demandeId } : "skip"
  )
  const updateOffreStatus = useMutation(api.offres.updateOffreStatus)

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'En attente' },
      accepted: { variant: 'success', label: 'Acceptée' },
      rejected: { variant: 'destructive', label: 'Refusée' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleAcceptOffre = async (offreId) => {
    try {
      const result = await updateOffreStatus({ offreId, status: 'accepted' })
      
      if (result?.meetSessionId) {
        // Fermer le modal et rediriger vers le meet
        onOpenChange(false)
        navigate(`/meet/${result.meetSessionId}`)
      }
    } catch (error) {
      console.error('Error accepting offre:', error)
      alert('Erreur lors de l\'acceptation de l\'offre')
    }
  }

  const handleRejectOffre = async (offreId) => {
    try {
      await updateOffreStatus({ offreId, status: 'rejected' })
    } catch (error) {
      console.error('Error rejecting offre:', error)
      alert('Erreur lors du refus de l\'offre')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Offres reçues</DialogTitle>
          <DialogDescription>
            {demandeTitle && `Pour la demande: ${demandeTitle}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!offres ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : offres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune offre reçue
              </h3>
              <p className="text-sm text-gray-500">
                Vous n'avez pas encore reçu d'offre pour cette demande
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {offres.map((offre) => (
                <div
                  key={offre._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header avec utilisateur et statut */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {offre.user?.name || 'Utilisateur anonyme'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {offre.user?.email || 'Email non disponible'}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(offre.status)}
                  </div>

                  <Separator className="my-3" />

                  {/* Informations de l'offre */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Prix proposé
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {formatPrice(offre.proposedPrice)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 h-4 w-4" />
                        Date de l'offre
                      </div>
                      <div className="text-sm">{formatDate(offre.createdAt)}</div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2 mb-3">
                    <div className="text-sm font-medium text-gray-900">Message</div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {offre.message}
                    </div>
                  </div>

                  {/* Audio si présent */}
                  {offre.audioUrl && (
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <Volume2 className="mr-2 h-4 w-4" />
                        Message vocal
                      </div>
                      <audio controls className="w-full">
                        <source src={offre.audioUrl} type="audio/webm" />
                        Votre navigateur ne supporte pas l'élément audio.
                      </audio>
                    </div>
                  )}

                  {/* Actions */}
                  {offre.status === 'pending' && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAcceptOffre(offre._id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Accepter
                        </Button>
                        <Button
                          onClick={() => handleRejectOffre(offre._id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Refuser
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Statistiques */}
          {offres && offres.length > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{offres.length}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {offres.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-500">En attente</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {offres.filter(o => o.status === 'accepted').length}
                  </div>
                  <div className="text-sm text-gray-500">Acceptées</div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
