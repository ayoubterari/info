import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Calendar, DollarSign, Tag, FileText, Volume2 } from 'lucide-react'

export function ViewDemandeModal({ open, onOpenChange, demande }) {
  if (!demande) return null

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
      in_progress: { variant: 'info', label: 'En cours' },
      completed: { variant: 'success', label: 'Terminée' },
      cancelled: { variant: 'destructive', label: 'Annulée' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{demande.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Détails de la demande
              </DialogDescription>
            </div>
            {getStatusBadge(demande.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <Tag className="mr-2 h-4 w-4" />
                Catégorie
              </div>
              <Badge variant="secondary">{demande.category}</Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="mr-2 h-4 w-4" />
                Prix proposé
              </div>
              <div className="text-lg font-semibold">{formatPrice(demande.price)}</div>
            </div>

            <div className="space-y-1 col-span-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-2 h-4 w-4" />
                Date de création
              </div>
              <div className="text-sm">{formatDate(demande.createdAt)}</div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-900">
              <FileText className="mr-2 h-4 w-4" />
              Description
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {demande.description}
            </div>
          </div>

          {/* Audio si présent */}
          {demande.audioStorageId && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <Volume2 className="mr-2 h-4 w-4" />
                  Message vocal
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <audio controls className="w-full">
                    <source src={demande.audioUrl} type="audio/webm" />
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                </div>
              </div>
            </>
          )}

          {/* Fichiers joints si présents */}
          {demande.fileStorageIds && demande.fileStorageIds.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <FileText className="mr-2 h-4 w-4" />
                  Fichiers joints ({demande.fileStorageIds.length})
                </div>
                <div className="space-y-2">
                  {demande.fileStorageIds.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Informations supplémentaires */}
          <Separator />
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-900">
              <strong>Note:</strong> Cette demande est visible par tous les utilisateurs qui peuvent proposer leur aide.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
